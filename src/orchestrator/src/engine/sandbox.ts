import vm from 'node:vm';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const requireShim = createRequire(import.meta.url);

function findPythonExecutable(): string {
  const pathsToTry = [
    path.resolve(process.cwd(), '../../.venv/Scripts/python.exe'),
    path.resolve(process.cwd(), '../.venv/Scripts/python.exe'),
    path.resolve(process.cwd(), '.venv/Scripts/python.exe'),
    path.resolve(process.cwd(), '../../.venv/bin/python'),
    path.resolve(process.cwd(), '../.venv/bin/python'),
    path.resolve(process.cwd(), '.venv/bin/python'),
  ];
  
  for (const p of pathsToTry) {
    if (existsSync(p)) {
      return p;
    }
  }
  
  return process.platform === 'win32' ? 'python' : 'python3';
}

export async function runUserCode(
  code: string,
  input: unknown,
  config: Record<string, unknown>
): Promise<unknown> {
  const context = {
    console,
    require: (moduleName: string) => {
      try {
        return requireShim(moduleName);
      } catch (err) {
        throw new Error(`Failed to load module '${moduleName}' in sandbox: ${(err as Error).message}`);
      }
    },
    process,
    Buffer,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Promise,
    _input: input,
    _config: config,
  };

  vm.createContext(context);

  const wrappedCode = `
    ${code}
    
    const result = process(_input, _config);
    result;
  `;

  const script = new vm.Script(wrappedCode, { filename: 'sandbox-execution.js' });
  const executionResult = script.runInContext(context, { timeout: 15000 });
  
  return Promise.resolve(executionResult);
}

export async function runPythonCode(
  code: string,
  input: unknown,
  config: Record<string, unknown>
): Promise<unknown> {
  const tempDir = path.resolve(process.cwd(), 'tmp');
  await fs.mkdir(tempDir, { recursive: true });
  
  const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const scriptPath = path.join(tempDir, `script_${uniqueId}.py`);
  const dataPath = path.join(tempDir, `data_${uniqueId}.json`);
  
  const pythonTemplate = `import sys
import json
import asyncio
import inspect

# USER CODE START
${code}
# USER CODE END

async def main():
    try:
        data_file = sys.argv[1]
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        cfg = data.get('config', {})
        inp = data.get('input', {})
        
        if 'execute' not in globals():
            raise AttributeError("Python code must define an 'execute(config, input)' function")
            
        fn = globals()['execute']
        if inspect.iscoroutinefunction(fn):
            result = await fn(cfg, inp)
        else:
            result = fn(cfg, inp)
            
        print(json.dumps({"status": "success", "result": result}))
    except Exception as e:
        import traceback
        print(json.dumps({"status": "error", "error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
`;

  try {
    await fs.writeFile(scriptPath, pythonTemplate, 'utf-8');
    await fs.writeFile(dataPath, JSON.stringify({ input, config }), 'utf-8');
    
    const pythonExe = findPythonExecutable();
    const { stdout } = await execFileAsync(pythonExe, [scriptPath, dataPath], { timeout: 15000 });
    
    const lastLine = stdout.trim().split('\n').pop() || '';
    const response = JSON.parse(lastLine);
    if (response.status === 'success') {
      return response.result;
    } else {
      throw new Error(`Python execution error: ${response.error}\nTraceback:\n${response.traceback}`);
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(`Python interpreter not found. Please ensure Python is installed and accessible.`);
    }
    if (err.stdout) {
      try {
        const lastLine = err.stdout.trim().split('\n').pop() || '';
        const response = JSON.parse(lastLine);
        if (response.status === 'error') {
          throw new Error(`Python execution error: ${response.error}\nTraceback:\n${response.traceback}`);
        }
      } catch (_) {}
    }
    throw new Error(`Python Sandbox Error: ${err.message}${err.stderr ? '\nStderr:\n' + err.stderr : ''}`);
  } finally {
    await fs.unlink(scriptPath).catch(() => {});
    await fs.unlink(dataPath).catch(() => {});
  }
}

