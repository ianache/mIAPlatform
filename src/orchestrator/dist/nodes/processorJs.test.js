import { describe, it } from 'node:test';
import assert from 'node:assert';
import { processorJsHandler } from './processorJs.js';
const mockPipeObj = {
    metadata: { flowId: 'flow-1', runId: 'run-1', nodeId: 'node-1', tenantId: 'tenant-1' },
    payload: { existing: 'data' },
    state: {},
};
describe('processorJsHandler', async () => {
    it('should call runUserCode with nodeType.code and pipeObj', async () => {
        let calledCode = '';
        let calledInput = null;
        // We can't easily mock runUserCode, but we can verify the behavior
        // by checking that code is passed correctly through the handler
        const node = {
            id: 'node-1',
            type: 'processor',
            node_type_id: 'processor-js',
            label: 'JS Processor',
            config: {},
        };
        const nodeType = { id: 'nt-1', code: 'function process(input, config) { return { processed: true }; }', name: 'Processor:JS' };
        const result = await processorJsHandler(node, mockPipeObj, nodeType);
        assert.equal(result['existing'], 'data');
        assert.equal(result['processed'], true);
    });
    it('should return pipeObj.payload unchanged when code is empty string (passthrough)', async () => {
        const node = {
            id: 'node-1',
            type: 'processor',
            node_type_id: 'processor-js',
            label: 'JS Processor',
            config: {},
        };
        const nodeType = { id: 'nt-1', code: '', name: 'Processor:JS' };
        const result = await processorJsHandler(node, mockPipeObj, nodeType);
        assert.deepEqual(result, mockPipeObj.payload);
    });
    it('should return pipeObj.payload unchanged when code is only whitespace', async () => {
        const node = {
            id: 'node-1',
            type: 'processor',
            node_type_id: 'processor-js',
            label: 'JS Processor',
            config: {},
        };
        const nodeType = { id: 'nt-1', code: '   ', name: 'Processor:JS' };
        const result = await processorJsHandler(node, mockPipeObj, nodeType);
        assert.deepEqual(result, mockPipeObj.payload);
    });
    it('should merge returned object into pipeObj.payload', async () => {
        const node = {
            id: 'node-1',
            type: 'processor',
            node_type_id: 'processor-js',
            label: 'JS Processor',
            config: {},
        };
        const nodeType = { id: 'nt-1', code: 'function process(input, config) { return { newKey: "newValue", merged: true }; }', name: 'Processor:JS' };
        const result = await processorJsHandler(node, mockPipeObj, nodeType);
        assert.equal(result['existing'], 'data'); // original payload preserved
        assert.equal(result['newKey'], 'newValue'); // new key added
        assert.equal(result['merged'], true); // from processor
    });
});
