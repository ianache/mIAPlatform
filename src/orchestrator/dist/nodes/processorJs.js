import { runUserCode } from '../engine/sandbox.js';
/**
 * Node handler for Processor:JavaScript node.
 * Executes node_type.code in isolated-vm sandbox with PipeObject as input.
 */
export async function processorJsHandler(node, pipeObj, nodeType) {
    if (!nodeType.code || nodeType.code.trim() === '') {
        // No code defined — passthrough
        return pipeObj.payload;
    }
    const result = await runUserCode(nodeType.code, pipeObj, (node.config ?? node.data?.config));
    // result should be an object; merge into existing payload
    return { ...pipeObj.payload, ...result };
}
