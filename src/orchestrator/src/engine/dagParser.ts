import { DirectedGraph } from 'graphology';
import { topologicalSort } from 'graphology-dag';

export interface FlowNode {
  id: string;
  type: string;
  node_type_id: string;
  label: string;
  config?: Record<string, unknown>;
  position?: { x: number; y: number };
  data?: { label: string; config: Record<string, unknown> };
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

/**
 * Parses a flow graph and returns node IDs in topological order.
 * Throws if the graph contains a cycle.
 */
export function parseAndSort(graph: FlowGraph): string[] {
  const g = new DirectedGraph();

  // Add all nodes from the graph
  for (const node of graph.nodes) {
    g.addNode(node.id, node);
  }

  // Add edges, skipping self-loops and edges to/from non-existent nodes
  for (const edge of graph.edges) {
    if (edge.source === edge.target) continue; // skip self-loops
    if (!g.hasNode(edge.source) || !g.hasNode(edge.target)) continue;
    g.addEdge(edge.source, edge.target);
  }

  try {
    return topologicalSort(g);
  } catch (err: any) {
    // graphology-dag throws with message containing "not acyclic" when cycle detected
    if (err?.message?.includes('not acyclic')) {
      throw new Error(`Flow contains a cycle — cannot execute: ${String(err)}`);
    }
    throw err;
  }
}
