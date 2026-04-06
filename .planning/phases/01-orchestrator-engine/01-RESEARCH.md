# Phase 01: Orchestration Engine — Pipe & Filter Flow Executor - Research

**Researched:** 2026-04-05
**Domain:** Node.js TypeScript microservice, BullMQ job queues, DAG topological execution, JS sandboxing, Redis pub/sub, FastAPI WebSocket integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Nuevo microservicio **Node.js TypeScript** en `src/orchestrator/` (dentro del monorepo)
- Se agrega como servicio al `docker-compose.yml` existente
- Comunicación vía **Redis + BullMQ**
  - Backend Python publica jobs usando el paquete oficial BullMQ Python → cola en Redis
  - Orchestrator Node.js consume jobs con BullMQ workers
- Redis se agrega como nuevo servicio en docker-compose (ya existe en `config.py` — `REDIS_URL`)
- **Source: File** — lee un archivo del filesystem, inicia el payload
- **Processor: JavaScript** — ejecuta el `code` field del NodeType desde `mia.node_types` en un sandbox
- El engine lee la lógica de ejecución **directamente del catálogo en DB** (campo `code` del NodeType). No hay lógica hard-codeada
- Ejecución **paralela desde el MVP**: branches en paralelo con BullMQ child jobs o Promise.all
- Sin restricción de concurrent runs
- **Cron/schedule** desde MVP: nodo Source "schedule" con `cron_expression` → `upsertJobScheduler` de BullMQ al arrancar
- **Endpoint REST**: `POST /api/v1/library/flows/{id}/execute` en backend Python
- Nueva tabla **`mia.flow_runs`** con Alembic migration
- **WebSocket en tiempo real**: orchestrator emite eventos → backend los retransmite por WebSocket. Reutilizar `ws_manager.py` + `AgentEventManager`
- **Página separada `/library/:id/runs`** (nueva ruta y página `FlowRunsPage.vue`)

### Claude's Discretion

- Para JS sandbox: preferir `vm2` o `worker_threads` para aislamiento (el spec menciona ambos — elegir el más seguro)
- Estructura interna del microservicio Node.js TypeScript

### Deferred Ideas (OUT OF SCOPE)

- Python bridge (Processor: Python)
- Sink nodes: Qdrant, Neo4j
- Source: Folder watcher / File watcher
- Panel inline en el Flow Designer (mostrar ejecución dentro del diseñador)
- Retry logic por nodo
- Node.js package installation sandbox
</user_constraints>

---

## Summary

This phase introduces a Node.js TypeScript microservice (`src/orchestrator/`) that consumes flow DAGs from `mia.flows`, executes them node-by-node in topological order, sandboxes JavaScript code from `mia.node_types`, and streams execution events back to the frontend via WebSocket. The Python backend acts as the trigger and relay — it enqueues jobs using the official BullMQ Python package and rebroadcasts orchestrator events through the existing `AgentEventManager`/`ws_manager.py` WebSocket infrastructure.

**Critical finding:** `vm2` (mentioned in CONTEXT.md as an option) has a CVSS 9.8 critical sandbox escape CVE disclosed January 2026 (CVE-2026-22709). It must not be used. The correct choice is `isolated-vm` v6.1.2, which leverages V8's native Isolate interface — architecturally sound and actively maintained. Redis is already deployed at `192.168.100.254:6379` and reachable. BullMQ has an official Python package (`bullmq` v2.20.0) that lets the Python backend enqueue jobs in a format fully compatible with the Node.js BullMQ worker — no custom serialization needed.

The flow graph shape is well-defined: `{ nodes: FlowNode[], edges: FlowEdge[], misc_nodes?: MiscNode[] }`. Topological sort operates on `nodes` and `edges` arrays. `graphology-dag` (v0.4.1) provides `topologicalSort()` out-of-the-box. The "Pipe Object" (payload that flows between nodes) is a plain JSON object `{ metadata, payload, state }`.

**Primary recommendation:** Use `isolated-vm` (not vm2) for JS sandboxing. Use BullMQ Python package for job dispatch from Python. Use `graphology-dag` for topological sort. Reuse `AgentEventManager` pattern for WebSocket relay with `run_id` as channel key instead of `session_code`.

---

## Standard Stack

### Core (Orchestrator Node.js service)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bullmq | 5.73.0 | Job queue on Redis — Worker, Queue, FlowProducer, upsertJobScheduler | Official Node.js queue for BullMQ; only option that interoperates with the BullMQ Python package |
| ioredis | 5.10.1 | Redis client for BullMQ connection | BullMQ's required peer dependency; the `{ maxRetriesPerRequest: null }` config is mandatory for workers |
| isolated-vm | 6.1.2 | Secure V8 isolate sandbox for user JS code | vm2 has active CVSS 9.8 CVE; isolated-vm uses native V8 Isolate API — architecturally secure |
| graphology | 0.26.0 | Directed graph data structure | Basis for graphology-dag; actively maintained |
| graphology-dag | 0.4.1 | `topologicalSort()` and cycle detection for DAGs | Purpose-built for DAG operations; prevents hand-rolling Kahn's algorithm |
| typescript | 6.0.2 | TypeScript compiler | Project standard |
| tsx | 4.21.0 | Run TypeScript directly in Node.js (dev) | Faster startup than ts-node for development |

### Supporting (Backend Python additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| bullmq (Python) | 2.20.0 | Add jobs to BullMQ queues from Python | Dispatch `execute_flow` jobs from `POST /flows/{id}/execute` endpoint |
| redis[hiredis] | 6.4.0 (already in pyproject.toml) | Redis client for Python | Already installed; used by cache.py; bullmq Python package uses it internally |

### Supporting (Frontend additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | — | Vue 3, Pinia, router already installed | FlowRunsPage.vue follows existing patterns |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| isolated-vm | vm2 | vm2 has CVSS 9.8 CVE (Jan 2026) — do not use |
| isolated-vm | worker_threads + vm.Module | worker_threads is same-process, no heap isolation; vm.Module doesn't sandbox globals; weaker isolation |
| graphology-dag | Hand-rolled Kahn's algorithm | Kahn's is ~30 lines; graphology-dag also catches cycles and gives better error messages — worth the dependency |
| BullMQ Python pkg | redis-py LPUSH directly | Raw LPUSH breaks BullMQ's internal Redis key schema — jobs would never be picked up by the Node.js worker |
| BullMQ (for cron) | node-cron / cron package | BullMQ's `upsertJobScheduler` persists schedules in Redis — survives restarts; node-cron is in-memory only |

**Installation (orchestrator):**
```bash
cd src/orchestrator
npm init -y
npm install bullmq ioredis isolated-vm graphology graphology-dag
npm install -D typescript tsx @types/node
```

**Installation (backend Python — add to pyproject.toml):**
```toml
"bullmq>=2.20.0",
```

**Version verification (confirmed 2026-04-05):**
- bullmq: 5.73.0 (published 2026-04-03)
- isolated-vm: 6.1.2
- graphology-dag: 0.4.1
- bullmq Python: 2.20.0

---

## Architecture Patterns

### Recommended Project Structure

```
src/orchestrator/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # entry: start workers + scheduler registration
│   ├── config.ts             # env vars (REDIS_URL, REDIS_PASSWORD, PG_URL)
│   ├── queues.ts             # Queue + connection singleton
│   ├── workers/
│   │   └── flowWorker.ts     # BullMQ Worker — processes execute_flow jobs
│   ├── engine/
│   │   ├── dagParser.ts      # parse FlowGraph → graphology DAG, topologicalSort
│   │   ├── executor.ts       # walk topo order, run each node, collect pipe objects
│   │   └── sandbox.ts        # isolated-vm isolate pool, runUserCode(code, input, config)
│   ├── nodes/
│   │   ├── sourceFile.ts     # Source: File handler — reads file, creates initial payload
│   │   └── processorJs.ts    # Processor: JS handler — calls sandbox.runUserCode
│   ├── db/
│   │   └── postgres.ts       # direct pg connection to write flow_runs rows
│   └── events/
│       └── emitter.ts        # publishes node events back to Redis pub/sub channel
```

### Pattern 1: BullMQ Worker Processing Execute-Flow Jobs

**What:** Python backend enqueues a job via BullMQ Python package; Node.js worker picks it up, parses the DAG, executes nodes in topological order, writes results to `mia.flow_runs`.
**When to use:** Every flow execution triggered by the REST endpoint or cron scheduler.

```typescript
// Source: https://docs.bullmq.io/readme-1
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,  // REQUIRED for BullMQ workers
});

const worker = new Worker(
  'execute_flow',
  async (job) => {
    const { flowId, tenantId, runId } = job.data;
    await executeFlow(flowId, tenantId, runId);
  },
  { connection }
);

worker.on('completed', (job) => console.log(`run ${job.data.runId} completed`));
worker.on('failed', (job, err) => console.error(`run ${job.data.runId} failed`, err));
```

### Pattern 2: BullMQ Python Package — Enqueue from FastAPI

**What:** Python endpoint adds a job to the BullMQ `execute_flow` queue in a format the Node.js worker understands natively.

```python
# Source: https://docs.bullmq.io/python/introduction
from bullmq import Queue
import asyncio

async def enqueue_flow_execution(flow_id: str, tenant_id: str, run_id: str):
    queue = Queue(
        "execute_flow",
        connection={
            "host": settings.REDIS_HOST,
            "port": settings.REDIS_PORT,
            "password": settings.REDIS_PASSWORD,
        }
    )
    await queue.add("execute_flow", {
        "flowId": flow_id,
        "tenantId": tenant_id,
        "runId": run_id,
    })
    await queue.close()
```

### Pattern 3: DAG Parsing and Topological Execution

**What:** Parse the `FlowGraph` JSON into a graphology DirectedGraph, topologically sort it, execute each node in order (collecting pipe objects between nodes).

```typescript
// Source: https://www.npmjs.com/package/graphology-dag
import { DirectedGraph } from 'graphology';
import { topologicalSort, willCreateCycle } from 'graphology-dag';

interface FlowGraph {
  nodes: Array<{ id: string; type: string; node_type_id: string; config: Record<string, any> }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

export function parseAndSort(graph: FlowGraph): string[] {
  const g = new DirectedGraph();
  for (const node of graph.nodes) {
    g.addNode(node.id, node);
  }
  for (const edge of graph.edges) {
    g.addEdge(edge.source, edge.target);
  }
  // throws if cycle detected
  return topologicalSort(g);
}
```

### Pattern 4: isolated-vm Sandbox for User JavaScript

**What:** Execute untrusted JS code (from `node_type.code`) in a secure V8 isolate with memory limits. The node interface is `function process(input, config) { return output; }`.

```typescript
// Source: https://github.com/laverdet/isolated-vm#readme
import ivm from 'isolated-vm';

export async function runUserCode(
  code: string,
  input: unknown,
  config: Record<string, any>
): Promise<unknown> {
  const isolate = new ivm.Isolate({ memoryLimit: 64 }); // 64 MB
  try {
    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set('_input', new ivm.ExternalCopy(input).copyInto());
    await jail.set('_config', new ivm.ExternalCopy(config).copyInto());

    const wrappedCode = `
      ${code}
      // code must define: function process(input, config) { return ...; }
      JSON.stringify(process(_input, _config));
    `;
    const script = await isolate.compileScript(wrappedCode);
    const resultJson = await script.run(context, { timeout: 5000 });
    return JSON.parse(resultJson as string);
  } finally {
    isolate.dispose();
  }
}
```

### Pattern 5: BullMQ upsertJobScheduler for Cron Sources

**What:** At orchestrator startup, scan all flows for Source nodes with `cron_expression` in their config and register persistent repeatable jobs.

```typescript
// Source: https://docs.bullmq.io/guide/job-schedulers
import { Queue } from 'bullmq';

export async function registerScheduledFlows(flows: ScheduledFlowConfig[]) {
  const queue = new Queue('execute_flow', { connection });
  for (const flow of flows) {
    await queue.upsertJobScheduler(
      `schedule:${flow.flowId}`,   // stable ID — upsert is idempotent
      { pattern: flow.cronExpression },
      {
        name: 'execute_flow',
        data: { flowId: flow.flowId, tenantId: flow.tenantId },
      }
    );
  }
}
```

### Pattern 6: WebSocket Event Relay via Redis Pub/Sub

**What:** Orchestrator publishes node-level events to a Redis Pub/Sub channel keyed by `run_id`. A FastAPI listener subscribes and broadcasts through `AgentEventManager` (reusing existing `ws_manager.py`).

```
Orchestrator (Node.js)
  → Redis PUBLISH  "flow_run:{run_id}"  {"type":"node_complete", "node_id":"...", ...}

Backend (Python FastAPI)
  → redis.asyncio subscribe "flow_run:{run_id}"
  → event_manager.broadcast(run_id, event)  ← existing pattern

Frontend (Vue 3)
  → WS ws://api/v1/library/runs/ws/{run_id}?token=...
```

### Pattern 7: flow_runs Table Write Pattern

**What:** Orchestrator writes directly to PostgreSQL `mia.flow_runs` using `pg` (Node.js postgres client), updating `status`, `log` JSONB array, and `final_output` on completion/failure.

```typescript
// Append a node event to the log array — atomic JSONB append
await pool.query(
  `UPDATE mia.flow_runs
   SET log = log || $1::jsonb
   WHERE id = $2`,
  [JSON.stringify([nodeEvent]), runId]
);
```

### The "Pipe Object" Contract

Every node receives and returns a Pipe Object — the data that flows through the pipeline:

```typescript
interface PipeObject {
  metadata: {
    flowId: string;
    runId: string;
    nodeId: string;
    tenantId: string;
  };
  payload: Record<string, unknown>;  // the actual data being processed
  state: Record<string, unknown>;    // cross-node shared state (optional)
}
```

Node code interface (what user writes in `node_type.code`):
```javascript
function process(input, config) {
  // input: PipeObject
  // config: node's FlowNodeConfig (from flow graph)
  // returns: new payload (merged into PipeObject.payload by engine)
  return { ...input.payload, processedAt: Date.now() };
}
```

### Anti-Patterns to Avoid

- **Using vm2 for sandboxing:** CVE-2026-22709 (CVSS 9.8) — sandbox escape via Promise callbacks. Always use `isolated-vm`.
- **Raw LPUSH/BRPOP from Python:** BullMQ's internal Redis key schema is not LPUSH — jobs would be silently dropped. Use the official `bullmq` Python package.
- **Creating new isolate per-execution without dispose():** isolated-vm isolates leak memory if not explicitly disposed. Always wrap in try/finally with `isolate.dispose()`.
- **Forgetting `maxRetriesPerRequest: null`:** BullMQ workers with ioredis require this setting; omitting it causes `MaxRetriesPerRequestError` under load.
- **Storing large payloads in BullMQ job data:** BullMQ serializes job data as JSON in Redis. For File source nodes, store the file path (or a DB reference) in job data — never the file content itself.
- **Topological sort without cycle detection:** A flow with a cycle will loop forever. `graphology-dag`'s `topologicalSort()` throws on cycles — catch and mark run as `failed`.
- **Single queue for both triggers and node sub-execution:** Keep a single `execute_flow` queue for complete flow executions. Do not create per-node queues — adds overhead with no benefit for this workload size.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Job queue with persistence, retries, workers | Custom Redis list poller | `bullmq` (Node.js) + `bullmq` (Python) | BullMQ handles at-least-once delivery, job state, dead-letter, and cross-language interop |
| Topological sort of DAG | Kahn's algorithm from scratch | `graphology-dag` topologicalSort | Also detects cycles; ~3 lines instead of ~40; tested |
| JS code sandboxing | `vm.runInNewContext()` or `new Function()` | `isolated-vm` | Node's built-in `vm` module does NOT sandbox — it shares the same V8 heap |
| Cron scheduling with persistence | `setInterval()` or `node-cron` | BullMQ `upsertJobScheduler` | Survives process restarts; de-duplication via stable scheduler ID |
| Memory-safe isolate timeout | Try/catch around `eval` | `isolated-vm` with `timeout` option in `script.run()` | Terminates runaway scripts; `eval` cannot be killed once started |

**Key insight:** Node.js's built-in `vm` module is commonly mistaken for a sandbox — it is NOT. It shares the V8 heap and all global objects with the parent process. Always use `isolated-vm` for untrusted code.

---

## Common Pitfalls

### Pitfall 1: vm2 CVE (Critical — active 2026)
**What goes wrong:** Using `vm2` for the JS sandbox introduces a CVSS 9.8 sandbox escape. Attackers can execute arbitrary Node.js code from within a "sandboxed" script via `Promise.prototype.then` callback hijacking.
**Why it happens:** vm2's architecture uses Proxy-based wrapping on the same V8 heap — the isolation is advisory, not enforced by V8.
**How to avoid:** Use `isolated-vm` exclusively. The CONTEXT.md mentions "vm2 / worker_threads" as options — vm2 is eliminated by this CVE. `isolated-vm` is the correct choice.
**Warning signs:** Any `require('vm2')` import in the codebase.

### Pitfall 2: BullMQ Worker ioredis Configuration
**What goes wrong:** Worker fails with `MaxRetriesPerRequestError` under concurrent load or during Redis reconnection.
**Why it happens:** ioredis default `maxRetriesPerRequest: 3` conflicts with BullMQ's blocking Redis commands (BRPOPLPUSH). BullMQ requires unlimited retries.
**How to avoid:** Always instantiate ioredis with `{ maxRetriesPerRequest: null }` for BullMQ connections.
**Warning signs:** Workers fail sporadically in development, consistently under load.

### Pitfall 3: isolated-vm Memory Leaks
**What goes wrong:** Orchestrator memory grows over time and eventually crashes.
**Why it happens:** Each `new ivm.Isolate()` allocates a V8 heap. If `isolate.dispose()` is not called (especially on error paths), memory accumulates.
**How to avoid:** Always use `try/finally` — call `isolate.dispose()` in the `finally` block.
**Warning signs:** Node.js process RSS growing steadily with each flow execution.

### Pitfall 4: Cycle in Flow Graph
**What goes wrong:** Flow execution loops forever, consuming CPU and memory until OOM.
**Why it happens:** The Flow Designer allows connecting nodes freely — a user might accidentally create a cycle. graphology's `topologicalSort` throws a `CycleError` on cycles.
**How to avoid:** Wrap `topologicalSort()` in try/catch; on `CycleError`, immediately mark the `flow_run` as `failed` with error message "Flow contains a cycle — cannot execute".
**Warning signs:** Execution job never completes; BullMQ worker stalled.

### Pitfall 5: Fan-out Parallel Execution with Shared Pipe Object
**What goes wrong:** When one node has multiple outgoing edges (fan-out), branches mutate the same Pipe Object reference, causing data corruption.
**Why it happens:** JavaScript object references — if you pass the same object to two branches, one branch's mutations affect the other.
**How to avoid:** Deep-clone the Pipe Object before passing to each parallel branch: `structuredClone(pipeObj)`.
**Warning signs:** Non-deterministic output in flows with fan-out topology.

### Pitfall 6: WebSocket Channel Collision (run_id vs session_code)
**What goes wrong:** Flow run events appear in the wrong WebSocket session (chat session gets flow events or vice versa).
**Why it happens:** `AgentEventManager` uses a string key for channel lookup. If `run_id` accidentally matches a `session_code`, events cross channels.
**How to avoid:** Namespace keys: use `"run:{run_id}"` for flow runs and keep `"chat:{session_code}"` for chat sessions. Alternatively, create a separate `FlowRunEventManager` instance with the same pattern.
**Warning signs:** Frontend receives flow events during chat or vice versa.

### Pitfall 7: Redis docker-compose service conflicts with existing REDIS_URL
**What goes wrong:** Adding a Redis service to docker-compose conflicts with the external Redis already configured at `192.168.100.254:6379`.
**Why it happens:** The backend's `config.py` already has `REDIS_URL: str = "redis://192.168.100.254:6379"` pointing to an external Redis instance. Adding a `redis:` service in docker-compose creates a second Redis that the orchestrator might connect to while the backend uses the external one.
**How to avoid:** The orchestrator must use the SAME Redis instance as the backend. Do not add a new Redis service to docker-compose. The `redis:` service in docker-compose is for local dev fallback only. Both services (backend + orchestrator) must read `REDIS_URL` from the same env source. The `redis:` service in docker-compose should be conditional (e.g., a `dev` override) and clearly documented.
**Warning signs:** Backend caches something, orchestrator can't see BullMQ jobs; queue length is always 0.

---

## Code Examples

### Alembic Migration for mia.flow_runs

```python
# alembic/versions/c3d4e5f6a7b8_create_flow_runs_table.py
# Source: existing migration patterns (a1b2c3d4e5f6_create_flows_table.py)

def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS mia.flow_runs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            flow_id UUID NOT NULL REFERENCES mia.flows(id) ON DELETE CASCADE,
            tenant_id VARCHAR NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'running',
            started_at TIMESTAMP NOT NULL DEFAULT now(),
            finished_at TIMESTAMP,
            log JSONB NOT NULL DEFAULT '[]',
            final_output JSONB,
            trigger VARCHAR(20) NOT NULL DEFAULT 'manual'
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_mia_flow_runs_flow_id ON mia.flow_runs (flow_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_mia_flow_runs_tenant_id ON mia.flow_runs (tenant_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_mia_flow_runs_status ON mia.flow_runs (status)")
```

### FastAPI POST /flows/{id}/execute Endpoint

```python
# Adds to src/backend/api/library.py
# Source: existing library.py pattern + BullMQ Python docs
from bullmq import Queue as BullQueue
from uuid import uuid4

@router.post("/{flow_id}/execute", status_code=202)
async def execute_flow(
    flow_id: UUID,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant),
):
    # Verify flow exists
    result = await db.execute(
        select(Flow).where(Flow.id == flow_id, Flow.tenant_id == tenant_id)
    )
    flow = result.scalar_one_or_none()
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")

    # Create flow_run record
    run_id = str(uuid4())
    await db.execute(
        text("""INSERT INTO mia.flow_runs (id, flow_id, tenant_id, status, trigger)
                VALUES (:id, :flow_id, :tenant_id, 'running', 'manual')"""),
        {"id": run_id, "flow_id": str(flow_id), "tenant_id": tenant_id}
    )
    await db.commit()

    # Enqueue BullMQ job
    settings = get_settings()
    queue = BullQueue("execute_flow", connection={
        "host": settings.REDIS_URL.split("://")[-1].split(":")[0],
        "port": 6379,
        "password": settings.REDIS_PASSWORD,
    })
    await queue.add("execute_flow", {
        "flowId": str(flow_id),
        "tenantId": tenant_id,
        "runId": run_id,
    })
    await queue.close()

    return {"runId": run_id, "status": "running"}
```

### FastAPI WebSocket Endpoint for Flow Run Events

```python
# New endpoint — reuses ws_manager.py pattern exactly
# Source: src/backend/api/chat.py WebSocket endpoint

@router.websocket("/ws/runs/{run_id}")
async def flow_run_events_ws(
    run_id: str,
    websocket: WebSocket,
    token: str = Query(...),
):
    try:
        await verify_token_raw(token)
    except Exception:
        await websocket.close(code=1008)
        return

    channel_key = f"run:{run_id}"
    await event_manager.connect(channel_key, websocket)
    try:
        while True:
            await websocket.receive_text()   # keep-alive
    except WebSocketDisconnect:
        event_manager.disconnect(channel_key, websocket)
```

### Orchestrator Event Relay back to Python (via Redis Pub/Sub)

The orchestrator publishes events to Redis. A background task in the Python backend subscribes and relays them to WebSocket clients:

```python
# src/backend/services/flow_run_relay.py
import asyncio
import json
import redis.asyncio as aioredis
from src.backend.api.ws_manager import event_manager
from src.backend.core.config import get_settings

async def relay_flow_run_events(run_id: str):
    settings = get_settings()
    r = aioredis.from_url(settings.REDIS_URL, password=settings.REDIS_PASSWORD)
    pubsub = r.pubsub()
    await pubsub.subscribe(f"flow_run:{run_id}")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                event = json.loads(message["data"])
                await event_manager.broadcast(f"run:{run_id}", event)
                if event.get("type") in ("run_complete", "run_failed"):
                    break
    finally:
        await pubsub.unsubscribe(f"flow_run:{run_id}")
        await r.aclose()
```

### FlowRunsPage.vue Route Addition

```typescript
// src/frontend/src/router/index.ts — add this line
{ path: 'library/:id/runs', name: 'FlowRuns', component: FlowRunsPage },
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BullMQ `add()` with `repeat: { cron }` | `upsertJobScheduler()` with `pattern` | BullMQ v5.16.0 | `add()` with repeat still works but `upsertJobScheduler` is idempotent and preferred in production |
| vm2 for Node.js sandboxing | `isolated-vm` v6 | 2023-2026 (multiple CVEs) | vm2 is functionally deprecated for security use; isolated-vm is the ecosystem replacement |
| BullMQ Node.js only | BullMQ Python + Elixir + PHP | 2023+ | Official multi-language clients let Python backend enqueue jobs natively |

**Deprecated/outdated:**
- `vm2`: Do not use — CVE-2026-22709 (CVSS 9.8, Jan 2026 disclosure). Architecturally vulnerable.
- BullMQ `add()` with `repeat` option: Still functional but `upsertJobScheduler` is the recommended replacement since v5.16.0.

---

## Runtime State Inventory

> Step 2.5 check — this is a greenfield microservice phase, not a rename/refactor phase.

**Not applicable** — Phase creates new services and tables. No existing runtime state (Redis keys, DB records, OS registrations) will be renamed or migrated.

New state introduced:
- `mia.flow_runs` table — new, no migration of existing data
- BullMQ queue keys in Redis: `bull:execute_flow:*` — new
- Redis pub/sub channels: `flow_run:{run_id}` — new, ephemeral

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Orchestrator runtime | Yes | v22.15.0 | — |
| npm | Orchestrator package install | Yes | 10.9.2 | — |
| Redis (192.168.100.254:6379) | BullMQ + backend cache | Yes | (ping OK) | Add redis: service to docker-compose for local dev |
| Python 3.12+ | Backend (existing) | Yes | 3.12 (per pyproject.toml) | — |
| PostgreSQL (192.168.100.254:5432) | flow_runs writes from orchestrator | Yes (existing, used by backend) | 16 | — |
| Docker + docker-compose | Service orchestration | Yes (assumed — existing docker-compose.yml) | — | — |
| redis-cli | Local dev debugging | Not installed | — | Use Python redis-py or Node.js ioredis for debug queries |

**Missing dependencies with no fallback:**
- None that block execution.

**Missing dependencies with fallback:**
- `redis-cli` not installed locally — use `python3 -c "import redis; ..."` or ioredis scripts for debugging.

---

## Validation Architecture

> `nyquist_validation` key absent from `.planning/config.json` — treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework (Python backend) | pytest 8.x + pytest-asyncio 0.23 (in pyproject.toml dev deps) |
| Framework (Orchestrator Node.js) | vitest 4.1.2 (to be installed in Wave 0) |
| Config file (Python) | none — to be added: `[tool.pytest.ini_options]` in pyproject.toml |
| Config file (Node.js) | none — `vitest.config.ts` to be created in Wave 0 |
| Quick run command (Python) | `cd <root> && uv run pytest tests/test_flow_runs.py -x` |
| Quick run command (Node.js) | `cd src/orchestrator && npx vitest run --reporter=verbose` |
| Full suite command | `uv run pytest tests/ -x && cd src/orchestrator && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ORCH-01 | DAG parser rejects cycles | unit (Node.js) | `cd src/orchestrator && npx vitest run src/engine/dagParser.test.ts` | Wave 0 |
| ORCH-02 | DAG parser returns correct topological order | unit (Node.js) | `cd src/orchestrator && npx vitest run src/engine/dagParser.test.ts` | Wave 0 |
| ORCH-03 | isolated-vm sandbox executes valid JS and returns output | unit (Node.js) | `cd src/orchestrator && npx vitest run src/engine/sandbox.test.ts` | Wave 0 |
| ORCH-04 | isolated-vm sandbox times out and disposes isolate on infinite loop | unit (Node.js) | `cd src/orchestrator && npx vitest run src/engine/sandbox.test.ts` | Wave 0 |
| ORCH-05 | Source:File node reads file and returns payload | unit (Node.js) | `cd src/orchestrator && npx vitest run src/nodes/sourceFile.test.ts` | Wave 0 |
| ORCH-06 | POST /flows/{id}/execute creates flow_run record + returns runId | integration (Python) | `uv run pytest tests/test_flow_runs.py::test_execute_creates_run -x` | Wave 0 |
| ORCH-07 | BullMQ Worker picks up job and calls executor | smoke (manual) | Start worker, POST execute, check DB run status | manual-only (requires Redis + Node) |
| ORCH-08 | WebSocket /ws/runs/{run_id} relays node events in real-time | smoke (manual) | Open WS in browser, trigger run, observe timeline | manual-only (requires full stack) |
| ORCH-09 | FlowRunsPage.vue displays run history + live timeline | e2e (manual) | Navigate to /library/:id/runs, trigger run | manual-only (requires UI) |

### Sampling Rate
- **Per task commit:** `cd src/orchestrator && npx vitest run` (unit tests only, < 10s)
- **Per wave merge:** `uv run pytest tests/ -x && cd src/orchestrator && npx vitest run`
- **Phase gate:** Full suite green + manual smoke tests ORCH-07/08/09 before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/orchestrator/vitest.config.ts` — vitest config for orchestrator
- [ ] `src/orchestrator/src/engine/dagParser.test.ts` — covers ORCH-01, ORCH-02
- [ ] `src/orchestrator/src/engine/sandbox.test.ts` — covers ORCH-03, ORCH-04
- [ ] `src/orchestrator/src/nodes/sourceFile.test.ts` — covers ORCH-05
- [ ] `tests/test_flow_runs.py` — covers ORCH-06 (Python pytest)
- [ ] Framework install (Node.js): `cd src/orchestrator && npm install -D vitest`
- [ ] `pyproject.toml`: add `[tool.pytest.ini_options] asyncio_mode = "auto"`

---

## Open Questions

1. **How does the orchestrator access `mia.node_types.code`?**
   - What we know: The orchestrator runs in Node.js; `node_types` is in PostgreSQL `mia` schema
   - What's unclear: Should the orchestrator query PG directly (adds a PG connection from Node.js) or call the Python backend's REST API to fetch node type code?
   - Recommendation: Query PostgreSQL directly from the orchestrator using `pg` npm package. Adding a REST call to the backend introduces latency, a retry dependency, and a circular service dependency (backend triggers orchestrator, orchestrator calls back to backend). Direct PG access is simpler. Use the same `POSTGRES_URL` env var.

2. **Parallel branch execution in MVP — BullMQ child jobs vs Promise.all**
   - What we know: CONTEXT.md says "BullMQ child jobs or Promise.all". BullMQ FlowProducer creates parent-child job trees where children run in parallel.
   - What's unclear: FlowProducer is best for deeply nested dependency graphs that span multiple queues. For a simple fan-out within a single flow, `Promise.all` within the worker is simpler and avoids queuing overhead.
   - Recommendation: Use `Promise.all` for within-flow parallel branches (MVP). Reserve BullMQ FlowProducer for future multi-service parallelism if needed. This aligns with "Cron/schedule desde el MVP" focus.

3. **Source:File node — what filesystem does it access?**
   - What we know: The orchestrator runs as a Docker container. The node config specifies a file path.
   - What's unclear: Is this path on the container filesystem (from a volume mount), or a path to an uploaded file stored in the backend?
   - Recommendation: For MVP, map a Docker volume `uploads_data:/uploads` shared between backend and orchestrator containers. The Source:File config field `filePath` is an absolute path within `/uploads`. The backend's `UPLOADS_PATH` env already points to `./uploads`.

4. **Flow run status update from orchestrator — direct PG write vs REST API**
   - What we know: The orchestrator needs to update `mia.flow_runs` status and log entries
   - What's unclear: Direct PG write from Node.js is simpler; REST API maintains single data access point
   - Recommendation: Direct PG write from the orchestrator using `pg` (npm). Use `PATCH /flows/{id}/runs/{run_id}` only if the orchestrator needs cache invalidation — for MVP, direct PG write + Redis pub/sub for events is sufficient.

---

## Sources

### Primary (HIGH confidence)

- BullMQ official docs — https://docs.bullmq.io/readme-1 (Quick Start, Worker patterns)
- BullMQ FlowProducer docs — https://docs.bullmq.io/guide/flows (parent-child job trees)
- BullMQ Job Schedulers docs — https://docs.bullmq.io/guide/job-schedulers (upsertJobScheduler)
- BullMQ Python docs — https://docs.bullmq.io/python/introduction (Python Queue.add)
- isolated-vm GitHub README — https://github.com/laverdet/isolated-vm (Isolate API, context, data transfer)
- npm registry (verified 2026-04-05): bullmq@5.73.0, ioredis@5.10.1, isolated-vm@6.1.2, graphology@0.26.0, graphology-dag@0.4.1, bullmq Python@2.20.0, redis-py@6.4.0
- Existing project code: `src/backend/api/ws_manager.py`, `src/backend/api/chat.py`, `src/backend/core/cache.py`, `src/frontend/src/types/index.ts`

### Secondary (MEDIUM confidence)

- CVE-2026-22709 vm2 critical sandbox escape — https://thehackernews.com/2026/01/critical-vm2-nodejs-flaw-allows-sandbox.html (corroborated by multiple sources including Semgrep, Endor Labs, npm registry history)
- BullMQ Python interop with Node.js workers — confirmed by official docs + npm package cross-references
- isolated-vm as vm2 successor — confirmed by vm2 maintainer recommendation and multiple security researchers

### Tertiary (LOW confidence)

- Redis pub/sub as orchestrator→backend relay pattern — single blog sources, but pattern is well-established; verified against redis-py asyncio docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from npm registry on 2026-04-05
- Architecture: HIGH — based on official docs (BullMQ, isolated-vm) + existing codebase patterns
- Pitfalls: HIGH — vm2 CVE verified from multiple authoritative sources; other pitfalls verified from official BullMQ docs
- Open Questions: MEDIUM — recommendations are reasoned from existing codebase but not verified with user

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (30 days — BullMQ is stable; isolated-vm is stable; check for new vm2 security advisories if reconsidering)
