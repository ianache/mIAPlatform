---
phase: 01-orchestrator-engine
plan: 03
subsystem: orchestrator
tags: [graphology, isolated-vm, bullmq, dag, toposort]

requires:
  - phase: "01-02"
    provides: "Node.js TypeScript orchestrator scaffold with BullMQ worker + Redis/Postgres wiring"

provides:
  - "DAG parser with topological sort and cycle detection"
  - "isolated-vm JavaScript sandbox with 64MB memory limit and 5s timeout"
  - "executeFlow() orchestration loop with parallel fan-out support"
  - "BullMQ flowWorker wired to executeFlow"
  - "StructuredClone for parallel branch isolation"

affects: [orchestrator, execution-engine, flow-runner]

tech-stack:
  added: [graphology, graphology-dag, isolated-vm]
  patterns: [dag-execution, parallel-fan-out, sandboxed-js-execution, level-based-topological-execution]

key-files:
  created:
    - src/orchestrator/src/engine/dagParser.ts
    - src/orchestrator/src/engine/sandbox.ts
    - src/orchestrator/src/engine/executor.ts
    - src/orchestrator/src/workers/flowWorker.ts
    - src/orchestrator/src/engine/dagParser.test.ts
    - src/orchestrator/src/engine/sandbox.test.ts
  modified:
    - src/orchestrator/src/index.ts

key-decisions:
  - "Used graphology-dag topologicalSort for node ordering"
  - "Used CycleError detection via 'not acyclic' message (CycleError not exported by graphology-dag)"
  - "Level-based execution for parallel fan-out: nodes with in-degree 0 execute in parallel"
  - "structuredClone for parallel branch isolation to prevent payload corruption"
  - "isolate.dispose() in finally block to prevent memory leaks"

patterns-established:
  - "DAG parsing with cycle detection: parseAndSort(graph) returns topo-ordered IDs or throws"
  - "Sandbox execution: runUserCode(code, input, config) with isolated-vm"
  - "Parallel fan-out: execution levels where nodes with no pending dependencies run concurrently"
  - "Stub handlers until Plan 04: stubHandler returns {...pipeObj.payload, [node_label]_processed: true}"

requirements-completed: [ORC-03, ORC-05]

duration: 8min
completed: 2026-04-06
---

# Phase 01-03: Orchestrator DAG Engine Summary

**DAG parser with graphology topological sort, isolated-vm sandbox with memory limits, and parallel fan-out executor**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-06T04:40:10Z
- **Completed:** 2026-04-06T04:47:42Z
- **Tasks:** 2 (TDD: RED+GREEN phases)
- **Files created:** 6

## Accomplishments

- Implemented dagParser.ts with topological sort using graphology-dag
- Implemented isolated-vm sandbox with 64MB memory limit and 5s script timeout
- Built executor.ts with level-based parallel execution using in-degree analysis
- Wired BullMQ flowWorker to executeFlow with concurrency=5
- All tests pass: cycle detection, linear/parallel topo sort, sandbox execution, timeout handling

## Task Commits

1. **Task 1 (TDD RED):** `bbbdd2d` - test(01-03): add failing tests for dagParser and sandbox
2. **Task 1 (TDD GREEN):** `95a2fc3` - feat(01-03): implement dagParser and sandbox
3. **Task 2:** `812132f` - feat(01-03): implement executor loop and flowWorker

**Plan metadata:** `812132f` (docs: complete plan)

## Files Created/Modified

- `src/orchestrator/src/engine/dagParser.ts` - Flow graph parser with topo sort, cycle detection
- `src/orchestrator/src/engine/dagParser.test.ts` - Tests for linear, cycle, parallel, misc_nodes
- `src/orchestrator/src/engine/sandbox.ts` - isolated-vm sandbox with timeout, dispose on error
- `src/orchestrator/src/engine/sandbox.test.ts` - Tests for execution, timeout, dispose
- `src/orchestrator/src/engine/executor.ts` - Full orchestration loop with parallel fan-out support
- `src/orchestrator/src/workers/flowWorker.ts` - BullMQ Worker wired to executeFlow
- `src/orchestrator/src/index.ts` - Uses createFlowWorker() instead of inline stub

## Decisions Made

- Used graphology-dag's topologicalSort (no CycleError export, detect via "not acyclic" message)
- Level-based execution: find nodes with in-degree 0, execute in parallel, repeat
- structuredClone(pipeObj) for each parallel branch to prevent payload corruption
- Stub handler adds `{node_label}_processed: true}` to payload (Plan 04 replaces with real handlers)

## Deviations from Plan

None - plan executed exactly as written.

### Auto-fixed Issues

None - no deviations encountered.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** No scope creep, all requirements met exactly as specified.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Plan 04: Node handlers (Source:File, Processor:JS) + cron scheduler.

The orchestrator engine is now functional end-to-end with:
- DAG parsing and validation
- Sandboxed JavaScript execution
- Parallel-aware execution loop
- BullMQ worker integration

---
*Phase: 01-orchestrator-engine*
*Completed: 2026-04-06*
