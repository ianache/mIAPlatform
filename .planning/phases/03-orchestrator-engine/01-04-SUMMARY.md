---
phase: 01-orchestrator-engine
plan: 04
subsystem: orchestrator
tags: [bullmq, node-handlers, source-file, processor-js, cron-scheduler]

requires:
  - phase: "01-03"
    provides: "DAG parser with topological sort, isolated-vm sandbox, parallel fan-out executor"

provides:
  - "Source:File node handler reading files with path traversal protection"
  - "Processor:JavaScript node handler calling runUserCode sandbox"
  - "Real handler dispatch replacing stub handler in executor"
  - "Cron scheduler registering BullMQ repeatable jobs at startup"

affects: [orchestrator, execution-engine, flow-runner, cron-scheduler]

tech-stack:
  added: []
  patterns: [node-handler-dispatch, path-traversal-security, cron-job-registration]

key-files:
  created:
    - src/orchestrator/src/engine/types.ts
    - src/orchestrator/src/nodes/sourceFile.ts
    - src/orchestrator/src/nodes/processorJs.ts
    - src/orchestrator/src/nodes/sourceFile.test.ts
    - src/orchestrator/src/nodes/processorJs.test.ts
    - src/orchestrator/src/scheduler.ts
  modified:
    - src/orchestrator/src/engine/executor.ts
    - src/orchestrator/src/index.ts

key-decisions:
  - "Handler dispatch based on node.type and nodeType.name matching (e.g., 'source' + 'file' -> sourceFileHandler)"
  - "Path traversal blocked: rejects ../etc/passwd, /etc, /proc on all platforms"
  - "Passthrough handler for unknown node types (defers sink and other source handlers)"

patterns-established:
  - "Node handler signature: (node, pipeObj, nodeType) => Promise<unknown>"
  - "Handler returns new payload, executor merges into pipeObj.payload"
  - "Scheduler uses stable ID 'schedule:${flowId}' for idempotent BullMQ upsert"

requirements-completed: [ORC-03, ORC-07]

duration: 5min
completed: 2026-04-06
---

# Phase 01-04: Node Handlers and Cron Scheduler Summary

**Source:File and Processor:JavaScript node handlers with real dispatch and BullMQ cron job registration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-06T04:51:13Z
- **Completed:** 2026-04-06T04:56:12Z
- **Tasks:** 2
- **Files created:** 6
- **Files modified:** 2

## Accomplishments

- Implemented sourceFileHandler: reads file content, outputs {filename, content, size}, blocks path traversal attacks
- Implemented processorJsHandler: calls runUserCode sandbox, merges result into pipeObj.payload
- Created shared types.ts with FlowNode, PipeObject, NodeType, NodeHandler interfaces
- Replaced stubHandler with real handler dispatch based on node.type and nodeType.name
- Added registerScheduledFlows() using BullMQ upsertJobScheduler for cron-based flow triggers
- Updated index.ts to register scheduled flows at startup before worker starts
- All node handler tests pass (path traversal blocked, passthrough works, sandbox output merged)

## Task Commits

1. **Task 1 (Node handlers + tests):** `0e43f37` - feat(03-04): implement Source:File and Processor:JS node handlers
2. **Task 2 (Executor wiring + scheduler):** `2d993f9` - feat(03-04): wire real handlers into executor and add cron scheduler

## Files Created/Modified

- `src/orchestrator/src/engine/types.ts` - Shared interfaces (FlowNode, PipeObject, NodeType, NodeHandler)
- `src/orchestrator/src/nodes/sourceFile.ts` - Source:File handler with path traversal protection
- `src/orchestrator/src/nodes/processorJs.ts` - Processor:JS handler calling sandbox
- `src/orchestrator/src/nodes/sourceFile.test.ts` - Tests for file reading and path traversal blocking
- `src/orchestrator/src/nodes/processorJs.test.ts` - Tests for passthrough and payload merging
- `src/orchestrator/src/scheduler.ts` - registerScheduledFlows() with BullMQ upsertJobScheduler
- `src/orchestrator/src/engine/executor.ts` - Replaced stub with real handler dispatch
- `src/orchestrator/src/index.ts` - Calls registerScheduledFlows() at startup

## Decisions Made

- Handler dispatch uses node.type + nodeType.name matching (e.g., type='source' AND name.includes('file') -> sourceFileHandler)
- Path traversal blocking checks for '..', '/etc', '/proc' on Unix and 'C:/etc', 'C:/proc' on Windows
- Passthrough handler returns p.payload for unknown node types (deferred implementation for sink, etc.)
- Scheduler uses stable ID `schedule:${flowId}` for idempotent job registration

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

Ready for next plan: The orchestrator engine now has real node handlers and cron scheduling. A flow with Source:File → Processor:JavaScript can execute end-to-end and produce final_output in mia.flow_runs.

The orchestrator is now functional end-to-end with:
- DAG parsing and validation
- Real node handlers (Source:File, Processor:JS)
- Sandboxed JavaScript execution
- Parallel-aware execution loop
- BullMQ worker integration
- Cron job scheduler for scheduled flows

---
*Phase: 01-orchestrator-engine*
*Completed: 2026-04-06*
