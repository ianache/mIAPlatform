/**
 * Shared type definitions for the orchestrator engine.
 * Used by dagParser, executor, handlers, and other engine components.
 */

export interface FlowNodeData {
  label: string;
  config?: Record<string, unknown>;
}

export interface FlowNode {
  id: string;
  type: string;
  node_type_id: string;
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface NodeType {
  id: string;
  code: string;
  name: string;
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
