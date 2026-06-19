import { DirectedGraph } from 'graphology';
import { topologicalSort } from 'graphology-dag';
/**
 * Parses a flow graph and returns node IDs in topological order.
 * Throws if the graph contains a cycle.
 */
export function parseAndSort(graph) {
    const g = new DirectedGraph();
    // Add all nodes from the graph
    for (const node of graph.nodes) {
        g.addNode(node.id, node);
    }
    // Add edges, skipping self-loops and edges to/from non-existent nodes
    for (const edge of graph.edges) {
        if (edge.source === edge.target)
            continue; // skip self-loops
        if (!g.hasNode(edge.source) || !g.hasNode(edge.target))
            continue;
        g.addEdge(edge.source, edge.target);
    }
    try {
        return topologicalSort(g);
    }
    catch (err) {
        // graphology-dag throws with message containing "not acyclic" when cycle detected
        if (err?.message?.includes('not acyclic')) {
            throw new Error(`Flow contains a cycle — cannot execute: ${String(err)}`);
        }
        throw err;
    }
}
