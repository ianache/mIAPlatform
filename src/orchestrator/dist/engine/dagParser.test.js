import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseAndSort } from './dagParser.js';
describe('dagParser', () => {
    it('parseAndSort with linear graph [A→B→C] returns [A, B, C]', () => {
        const graph = {
            nodes: [
                { id: 'A', type: 'source', node_type_id: 'nt1', label: 'A', config: {} },
                { id: 'B', type: 'processor', node_type_id: 'nt2', label: 'B', config: {} },
                { id: 'C', type: 'sink', node_type_id: 'nt3', label: 'C', config: {} },
            ],
            edges: [
                { id: 'e1', source: 'A', target: 'B' },
                { id: 'e2', source: 'B', target: 'C' },
            ],
        };
        const result = parseAndSort(graph);
        assert.deepStrictEqual(result, ['A', 'B', 'C']);
    });
    it('parseAndSort with cycle [A→B→A] throws an error containing "cycle"', () => {
        const graph = {
            nodes: [
                { id: 'A', type: 'source', node_type_id: 'nt1', label: 'A', config: {} },
                { id: 'B', type: 'processor', node_type_id: 'nt2', label: 'B', config: {} },
            ],
            edges: [
                { id: 'e1', source: 'A', target: 'B' },
                { id: 'e2', source: 'B', target: 'A' },
            ],
        };
        assert.throws(() => parseAndSort(graph), /cycle/i);
    });
    it('parseAndSort with parallel branches [A→B, A→C] returns A first; B and C in any order after', () => {
        const graph = {
            nodes: [
                { id: 'A', type: 'source', node_type_id: 'nt1', label: 'A', config: {} },
                { id: 'B', type: 'processor', node_type_id: 'nt2', label: 'B', config: {} },
                { id: 'C', type: 'processor', node_type_id: 'nt3', label: 'C', config: {} },
            ],
            edges: [
                { id: 'e1', source: 'A', target: 'B' },
                { id: 'e2', source: 'A', target: 'C' },
            ],
        };
        const result = parseAndSort(graph);
        assert.strictEqual(result[0], 'A');
        assert.ok(result.includes('B'));
        assert.ok(result.includes('C'));
        assert.strictEqual(result.length, 3);
    });
    it('parseAndSort ignores misc_nodes (sticky notes have no edges)', () => {
        const graph = {
            nodes: [
                { id: 'A', type: 'source', node_type_id: 'nt1', label: 'A', config: {} },
                { id: 'B', type: 'processor', node_type_id: 'nt2', label: 'B', config: {} },
            ],
            edges: [
                { id: 'e1', source: 'A', target: 'B' },
            ],
            misc_nodes: [
                { id: 'note1', type: 'misc' },
            ],
        };
        // misc_nodes are filtered implicitly since they have no edges pointing to/from them
        const result = parseAndSort(graph);
        assert.deepStrictEqual(result, ['A', 'B']);
    });
    it('parseAndSort skips self-loops', () => {
        const graph = {
            nodes: [
                { id: 'A', type: 'source', node_type_id: 'nt1', label: 'A', config: {} },
            ],
            edges: [
                { id: 'e1', source: 'A', target: 'A' }, // self-loop
            ],
        };
        // Self-loop should be skipped, graph has no edges so A is just a single node
        const result = parseAndSort(graph);
        assert.deepStrictEqual(result, ['A']);
    });
});
