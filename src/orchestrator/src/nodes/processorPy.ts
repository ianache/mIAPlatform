import { runPythonCode } from '../engine/sandbox.js';
import type { FlowNode, PipeObject } from '../engine/types.js';

/**
 * Node handler for Processor:Python node.
 * Executes node_type.code in a Python subprocess with PipeObject as input.
 */
export async function processorPyHandler(
  node: FlowNode,
  pipeObj: PipeObject,
  nodeType: { id: string; code: string; name: string }
): Promise<Record<string, unknown>> {
  if (!nodeType.code || nodeType.code.trim() === '') {
    // No code defined — passthrough
    return pipeObj.payload;
  }
  
  const result = await runPythonCode(nodeType.code, pipeObj, (node.config ?? node.data?.config) as Record<string, unknown>);
  
  // result should be an object; merge into existing payload
  return { ...pipeObj.payload, ...(result as Record<string, unknown>) };
}
