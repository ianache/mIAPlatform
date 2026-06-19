import ivm from 'isolated-vm';
export async function runUserCode(code, input, config) {
    const isolate = new ivm.Isolate({ memoryLimit: 64 });
    try {
        const context = await isolate.createContext();
        const jail = context.global;
        await jail.set('_input', new ivm.ExternalCopy(input).copyInto());
        await jail.set('_config', new ivm.ExternalCopy(config).copyInto());
        const wrappedCode = `
      ${code}
      // code MUST define: function process(input, config) { return ...; }
      JSON.stringify(process(_input, _config));
    `;
        const script = await isolate.compileScript(wrappedCode);
        const resultJson = await script.run(context, { timeout: 5000 });
        return JSON.parse(resultJson);
    }
    finally {
        isolate.dispose(); // ALWAYS dispose — prevents memory leaks
    }
}
