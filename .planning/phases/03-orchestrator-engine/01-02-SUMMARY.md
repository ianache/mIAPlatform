---
phase: "01-orchestrator-engine"
plan: "02"
subsystem: infra
tags: [bullmq, redis, nodejs, typescript, docker, postgres]

# Dependency graph
requires:
  - phase: "00-foundation"
    provides: Docker Compose environment with postgres service
provides:
  - Node.js TypeScript orchestrator service scaffold at src/orchestrator/
  - BullMQ Worker listening on execute_flow queue
  - ioredis connection with maxRetriesPerRequest: null for BullMQ compatibility
  - pg Pool singleton for mia.flow_runs writes
  - Redis pub/sub helper for flow_run:{run_id} events
  - docker-compose orchestrator service using external Redis (192.168.100.254:6379)
affects:
  - 01-orchestrator-engine (plans 03-05 will implement engine logic)

# Tech tracking
tech-stack:
  added: [bullmq@5.73.0, ioredis@5.10.1, isolated-vm@6.1.2, graphology@0.26.0, graphology-dag@0.4.1, pg@8.13.3, tsx@4.21.0]
  patterns:
    - ioredis connection with maxRetriesPerRequest: null (required for BullMQ)
    - Separate Redis client for pub/sub (not shared with BullMQ connection)
    - Environment variable resolution with sensible defaults
    - pg Pool singleton pattern for database connections

key-files:
  created:
    - src/orchestrator/package.json - Node.js project manifest
    - src/orchestrator/tsconfig.json - TypeScript ES2022/NodeNext config
    - src/orchestrator/src/index.ts - BullMQ Worker entry point
    - src/orchestrator/src/config.ts - Env var resolution
    - src/orchestrator/src/queues.ts - ioredis + BullMQ Queue singleton
    - src/orchestrator/src/db/postgres.ts - pg Pool + flow_runs helpers
    - src/orchestrator/src/events/emitter.ts - Redis pub/sub helper
    - src/orchestrator/Dockerfile - Alpine-based container build
  modified:
    - docker-compose.yml - Added orchestrator service

key-decisions:
  - "Using external Redis at 192.168.100.254:6379 (not a new redis service) - shared with Python backend"
  - "maxRetriesPerRequest: null required on ioredis connection for BullMQ compatibility"
  - "Separate Redis client for pub/sub to avoid connection sharing issues"

patterns-established:
  - "Environment-first configuration with REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, DATABASE_URL"
  - "SIGTERM graceful shutdown for worker"

requirements-completed: [ORC-02, ORC-03]

# Metrics
duration: 3min
completed: 2026-04-06
---

# Phase 01-02: Orchestrator Scaffold Summary

**Node.js TypeScript orchestrator service scaffolded with BullMQ worker listening on execute_flow queue, using external Redis**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-06T04:30:16Z
- **Completed:** 2026-04-06T04:33:08Z
- **Tasks:** 2
- **Files modified:** 9 (6 created + 3 committed including Dockerfile and compose changes)

## Accomplishments

- Node.js TypeScript project scaffold at src/orchestrator/ with all required dependencies
- BullMQ Worker configured to listen on execute_flow queue with ioredis connection
- pg Pool singleton for writing to mia.flow_runs table
- Redis pub/sub helper for flow_run:{run_id} event channels
- Docker Compose orchestrator service using external Redis (no new redis service added)
- Dockerfile with Node 22 Alpine + build tools for isolated-vm native addon

## Task Commits

Each task was committed atomically:

1. **Task 1: Node.js TypeScript project scaffold + dependencies** - `40050f6` (feat)
   - package.json, tsconfig.json, config.ts, queues.ts, db/postgres.ts, events/emitter.ts
   - npm install completed successfully

2. **Task 2: BullMQ worker entry point + docker-compose orchestrator service** - `ae5376a` (feat)
   - index.ts, Dockerfile, docker-compose.yml

**Plan metadata:** `docs(01-02): complete orchestrator scaffold plan` (pending)

## Files Created/Modified

- `src/orchestrator/package.json` - Dependencies: bullmq, ioredis, isolated-vm, graphology, graphology-dag, pg
- `src/orchestrator/tsconfig.json` - TypeScript config with ES2022, NodeNext module resolution
- `src/orchestrator/src/index.ts` - BullMQ Worker with job handlers, completed/failed event listeners, SIGTERM shutdown
- `src/orchestrator/src/config.ts` - Env vars: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, DATABASE_URL with defaults
- `src/orchestrator/src/queues.ts` - ioredis connection + BullMQ Queue with maxRetriesPerRequest: null
- `src/orchestrator/src/db/postgres.ts` - pg Pool singleton + updateRunStatus() + appendRunLog() helpers
- `src/orchestrator/src/events/emitter.ts` - Redis pub/sub publisher for flow_run:{run_id} channels
- `src/orchestrator/Dockerfile` - Node 22 Alpine with python3/make/g++ for isolated-vm
- `docker-compose.yml` - Added orchestrator service using external Redis at 192.168.100.254:6379

## Decisions Made

- Used external Redis (192.168.100.254:6379) shared with Python backend instead of adding a new redis service
- Required maxRetriesPerRequest: null on ioredis connection for BullMQ worker compatibility
- Separate Redis client for pub/sub (not sharing BullMQ's connection) to avoid conflicts
- SIGTERM graceful shutdown to cleanly close worker connections

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Docker not available in execution environment - could not validate docker-compose config or run orchestrator locally
- Docker validation deferred to runtime when docker is available

## User Setup Required

None - no external service configuration required. The orchestrator uses existing infrastructure:
- External Redis at 192.168.100.254:6379 (already running)
- PostgreSQL at postgres:5432 (from docker-compose)

## Next Phase Readiness

- Orchestrator scaffold complete, ready for Plan 03 which implements the executeFlow engine logic
- Worker stub throws "Engine not yet implemented — Plan 03 required" - intentional placeholder

---
*Phase: 01-orchestrator-engine*
*Completed: 2026-04-06*
