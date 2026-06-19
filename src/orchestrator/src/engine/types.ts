/**
 * Shared type definitions for the orchestrator engine.
 * Used by dagParser, executor, handlers, and other engine components.
 * 
 * Note: Flow graphs from the database have label/config directly on the node,
 * NOT nested inside a 'data' property.
 */

export interface FlowNodeData {
  label: string;
  config?: Record<string, unknown>;
}

export interface FlowNode {
  id: string;
  type: string;
  node_type_id: string;
  label: string;
  config?: Record<string, unknown>;
  position?: { x: number; y: number };
  data?: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
  misc_nodes?: unknown[];
}

export interface NodeType {
  id: string;
  code: string;
  name: string;
  language?: string;
}

export interface PipeObject {
  metadata: {
    flowId: string;
    runId: string;
    nodeId: string;
    tenantId: string;
  };
  payload: Record<string, unknown>;
  state: Record<string, unknown>;
}

export type NodeHandler = (
  node: FlowNode,
  pipeObj: PipeObject,
  nodeType: NodeType
) => Promise<unknown>;
