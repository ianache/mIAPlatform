import { pool, updateRunStatus, appendRunLog } from '../db/postgres.js';
import { emitRunEvent } from '../events/emitter.js';
import { parseAndSort, type FlowGraph } from './dagParser.js';
import type { FlowNode, PipeObject, NodeType } from './types.js';
import { sourceFileHandler } from '../nodes/sourceFile.js';
import { processorJsHandler } from '../nodes/processorJs.js';

/**
 * NodeHandler type - function that executes a node and returns new payload
 */
type NodeHandler = (
  node: FlowNode,
  pipeObj: PipeObject,
  nodeType: NodeType
) => Promise<unknown>;

/**
 * Determines the handler for a node based on its type.
 * Routes to real handlers: sourceFileHandler, processorJsHandler, or passthrough.
 */
function getHandler(node: FlowNode, nodeType: NodeType | undefined): NodeHandler {
  const type = node.type.toLowerCase();
  const name = (nodeType?.name || '').toLowerCase();
  
  if (type === 'source' && name.includes('file')) return sourceFileHandler;
  if (type === 'processor') return processorJsHandler;
  
  // Unknown node type — passthrough (deferred: sink, other sources)
  return async (_n, p) => p.payload;
}

/**
 * Build adjacency map: nodeId -> list of target nodeIds
 */
function buildAdjacencyMap(graph: FlowGraph): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }
  return adj;
}

/**
 * Find execution levels: nodes that can run in parallel are in the same level.
 * Uses a simple approach: compute in-degree for each node, process nodes with
 * in-degree 0 first, then remove them and repeat.
 */
function findExecutionLevels(
  graph: FlowGraph,
  sortedNodeIds: string[]
): string[][] {
  const adj = buildAdjacencyMap(graph);
  const inDegree = new Map<string, number>();

  // Initialize in-degree for all nodes
  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
  }
  // Count incoming edges for each node
  for (const edge of graph.edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const levels: string[][] = [];
  const remaining = new Set(sortedNodeIds);

  while (remaining.size > 0) {
    // Find all nodes with in-degree 0 that are still remaining
    const level: string[] = [];
    for (const nodeId of remaining) {
      if (inDegree.get(nodeId) === 0) {
        level.push(nodeId);
      }
    }

    if (level.length === 0) {
      // Should not happen with a valid DAG
      break;
    }

    levels.push(level);

    // Remove processed nodes and update in-degrees
    for (const nodeId of level) {
      remaining.delete(nodeId);
      const children = adj.get(nodeId) || [];
      for (const child of children) {
        inDegree.set(child, (inDegree.get(child) || 0) - 1);
      }
    }
  }

  return levels;
}

/**
 * Execute a single node and return its result + updated pipeObj
 */
async function executeNode(
  node: FlowNode,
  pipeObj: PipeObject,
  nodeType: NodeType | undefined,
  runId: string
): Promise<{ nodeId: string; result: unknown; pipeObj: PipeObject }> {
  const handler = getHandler(node, nodeType);
  const startTime = Date.now();

  pipeObj.metadata.nodeId = node.id;
  // nodeType could be undefined for unknown node types - use empty object as fallback
  const effectiveNodeType = nodeType ?? { id: '', code: '', name: '' };
  const result = await handler(node, pipeObj, effectiveNodeType);
  const duration_ms = Date.now() - startTime;

  const nodeEvent = {
    node_id: node.id,
    node_name: node.data.label,
    status: 'success' as const,
    duration_ms,
    input: pipeObj.payload,
    output: result,
    timestamp: new Date().toISOString(),
  };

  await appendRunLog(runId, nodeEvent);
  await emitRunEvent(runId, { type: 'node_complete', ...nodeEvent });

  // Create new pipeObj with merged payload for next nodes
  const newPipeObj: PipeObject = {
    ...pipeObj,
    payload: result && typeof result === 'object'
      ? { ...pipeObj.payload, ...(result as Record<string, unknown>) }
      : pipeObj.payload,
  };

  return { nodeId: node.id, result, pipeObj: newPipeObj };
}

/**
 * Executes a flow end-to-end:
 * 1. Loads flow graph from DB
 * 2. Topologically sorts nodes
 * 3. Finds execution levels (parallel fan-out supported)
 * 4. Executes each level, with parallel execution within a level
 * 5. Deep-clones PipeObject before parallel branches
 * 6. Persists events and emits WebSocket events
 */
export async function executeFlow(flowId: string, tenantId: string, runId: string): Promise<void> {
  // Step 1: Load flow graph from DB
  const flowResult = await pool.query<{ graph: FlowGraph }>(
    'SELECT graph FROM mia.flows WHERE id = $1',
    [flowId]
  );

  if (flowResult.rows.length === 0) {
    throw new Error(`Flow not found: ${flowId}`);
  }

  const graph: FlowGraph = flowResult.rows[0].graph;

  // Step 2: Load all node_types referenced by flow nodes
  const nodeTypeIds = [...new Set(graph.nodes.map((n) => n.node_type_id))];
  const nodeTypesResult = await pool.query<NodeType>(
    'SELECT id, code, name FROM mia.node_types WHERE id = ANY($1)',
    [nodeTypeIds]
  );
  const nodeTypeMap = new Map(nodeTypesResult.rows.map((nt) => [nt.id, nt]));

  // Step 3: Topologically sort - on CycleError, fail the run
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = parseAndSort(graph);
  } catch (err: any) {
    await updateRunStatus(runId, 'failed', new Date());
    await emitRunEvent(runId, {
      type: 'run_failed',
      runId,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Find execution levels for parallel fan-out
  const levels = findExecutionLevels(graph, sortedNodeIds);

  // Step 4: Initialize PipeObject
  let pipeObj: PipeObject = {
    metadata: { flowId, runId, nodeId: '', tenantId },
    payload: {},
    state: {},
  };

  // Step 5: Execute level by level
  for (const level of levels) {
    if (level.length === 1) {
      // Single node - execute directly
      const nodeId = level[0];
      const node = graph.nodes.find((n) => n.id === nodeId)!;
      const nodeType = nodeTypeMap.get(node.node_type_id);

      try {
        const { result, pipeObj: newPipeObj } = await executeNode(node, pipeObj, nodeType, runId);
        pipeObj = newPipeObj;
      } catch (err: any) {
        const nodeEvent = {
          node_id: nodeId,
          node_name: node.data.label,
          status: 'failed' as const,
          input: pipeObj.payload,
          error: err.message,
          timestamp: new Date().toISOString(),
        };
        await appendRunLog(runId, nodeEvent);
        await emitRunEvent(runId, { type: 'node_complete', ...nodeEvent });
        await updateRunStatus(runId, 'failed', new Date());
        throw err;
      }
    } else {
      // Multiple nodes in parallel - deep-clone PipeObject per branch
      const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

      const promises = level.map(async (nodeId) => {
        const node = nodeMap.get(nodeId)!;
        const nodeType = nodeTypeMap.get(node.node_type_id);
        // Deep-clone for parallel execution - each branch gets its own copy
        const branchPipeObj = structuredClone(pipeObj);
        return executeNode(node, branchPipeObj, nodeType, runId);
      });

      try {
        const results = await Promise.all(promises);
        // Merge results from all branches - later nodes get combined payload
        // For stub handlers, each adds its own key, so we merge all payloads
        let mergedPayload = { ...pipeObj.payload };
        for (const { result, pipeObj: branchPipeObj } of results) {
          mergedPayload = { ...mergedPayload, ...branchPipeObj.payload };
        }
        pipeObj = {
          ...pipeObj,
          payload: mergedPayload,
        };
      } catch (err: any) {
        // One of the parallel nodes failed
        await updateRunStatus(runId, 'failed', new Date());
        throw err;
      }
    }
  }

  // Step 6: On success
  await updateRunStatus(runId, 'success', new Date(), pipeObj.payload);
  await emitRunEvent(runId, {
    type: 'run_complete',
    runId,
    finalOutput: pipeObj.payload,
    timestamp: new Date().toISOString(),
  });
}
