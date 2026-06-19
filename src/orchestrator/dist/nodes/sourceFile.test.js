import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { sourceFileHandler } from './sourceFile.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const testDir = path.join(os.tmpdir(), 'orchestrator-test-' + Date.now());
const testFilePath = path.join(testDir, 'test.txt');
const testContent = 'Hello, World!';
async function setup() {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testFilePath, testContent);
}
async function cleanup() {
    try {
        await fs.rm(testDir, { recursive: true, force: true });
    }
    catch {
        // ignore
    }
}
const mockPipeObj = {
    metadata: { flowId: 'flow-1', runId: 'run-1', nodeId: 'node-1', tenantId: 'tenant-1' },
    payload: {},
    state: {},
};
describe('sourceFileHandler', () => {
    before(async () => {
        await setup();
    });
    after(async () => {
        await cleanup();
    });
    it('should read a file and return payload with filename, content, size', async () => {
        const node = {
            id: 'node-1',
            type: 'source',
            node_type_id: 'source-file',
            label: 'Read File',
            config: { file_path: testFilePath },
        };
        const result = await sourceFileHandler(node, mockPipeObj, { id: 'nt-1', code: '', name: 'Source:File' });
        assert.equal(result['filename'], 'test.txt');
        assert.equal(result['content'], testContent);
        assert.equal(result['size'], testContent.length);
    });
    it('should throw "Path traversal not allowed" for ../etc/passwd style paths', async () => {
        const node = {
            id: 'node-1',
            type: 'source',
            node_type_id: 'source-file',
            label: 'Read File',
            config: { file_path: '../etc/passwd' },
        };
        await assert.rejects(async () => sourceFileHandler(node, mockPipeObj, { id: 'nt-1', code: '', name: 'Source:File' }), (err) => {
            return err.message.includes('Path traversal not allowed');
        });
    });
    it('should throw "file_path config required" when file_path is missing', async () => {
        const node = {
            id: 'node-1',
            type: 'source',
            node_type_id: 'source-file',
            label: 'Read File',
            config: {},
        };
        await assert.rejects(async () => sourceFileHandler(node, mockPipeObj, { id: 'nt-1', code: '', name: 'Source:File' }), (err) => {
            return err.message.includes('file_path config required');
        });
    });
});
