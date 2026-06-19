# Phase 1: Orchestration Engine — Pipe & Filter Flow Executor

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Construir el motor de ejecución que toma un flow diseñado en el Flow Designer (guardado
en `mia.flows` como DAG JSON), lo parsea, valida como DAG, y ejecuta los nodos en orden
topológico con soporte multi-lenguaje JS/Python.

**Criterio de éxito:** El usuario diseña un flow en el Flow Designer, hace Run, y ve el
resultado en una página de Runs de esa misma UI.

Scheduling con cron/watch de archivos, Python bridge, y Sink nodes (Qdrant/Neo4j) son
expansiones dentro del mismo engine pero se priorizan después de que el DAG executor + JS
sandbox estén funcionando.

</domain>

<decisions>
## Implementation Decisions

### Arquitectura del servicio
- Nuevo microservicio **Node.js TypeScript** en `src/orchestrator/` (dentro del monorepo)
- Se agrega como servicio al `docker-compose.yml` existente
- El backend Python y el orchestrator se comunican vía **Redis + BullMQ**
  - Backend Python publica jobs usando `redis-py` → key/channel en Redis
  - Orchestrator Node.js consume jobs con BullMQ workers
- Redis se agrega como nuevo servicio en docker-compose

### Alcance del MVP (nodos)
- **Source: File** — lee un archivo del filesystem, inicia el payload
- **Processor: JavaScript** — ejecuta el `code` field del NodeType desde `mia.node_types` en un sandbox (vm2 / worker_threads)
- El engine lee la lógica de ejecución **directamente del catálogo en DB** (campo `code` del NodeType). No hay lógica hard-codeada por tipo de nodo.
- Ejecución **paralela desde el MVP**: cuando un nodo tiene múltiples salidas, los branches se ejecutan en paralelo con BullMQ child jobs o Promise.all
- Sin restricción de concurrent runs: cada ejecución es un job independiente

### Disparador de ejecución
- **Cron/schedule** desde el MVP: el nodo Source de tipo "schedule" tiene propiedad `cron_expression` en su config. El orchestrator lee esa config al arrancar y registra jobs repetibles con BullMQ Repeat.
- **Endpoint REST**: `POST /api/v1/library/flows/{id}/execute` en el backend Python. La UI (botón Run en el Flow Designer) y sistemas externos lo usan.
- El botón "Run" en el Flow Designer llama al endpoint REST, que encola el job en Redis.

### Persistencia de ejecuciones
- Nueva tabla **`mia.flow_runs`** con Alembic migration:
  - `id UUID`, `flow_id UUID FK`, `tenant_id UUID`
  - `status`: `running | success | failed`
  - `started_at TIMESTAMP`, `finished_at TIMESTAMP`
  - `log JSONB` — array de eventos por nodo: `{node_id, node_name, status, duration_ms, input, output, error, timestamp}`
  - `final_output JSONB` — payload del último nodo del flow

### Visibilidad en frontend
- **WebSocket en tiempo real**: el orchestrator emite eventos por nodo ejecutado → backend los retransmite por WebSocket al frontend. Reutilizar el patrón `ws_manager.py` + `AgentEventManager` que ya existe en `src/backend/api/`.
- **Página separada `/library/:id/runs`** (nueva ruta y página `FlowRunsPage.vue`):
  - Lista de ejecuciones pasadas (historial) del flow
  - Al hacer Run se navega o se actualiza esta página en tiempo real
  - Por cada run se muestra:
    - Badge de estado: `running` (amarillo) / `success` (verde) / `failed` (rojo)
    - Timeline de nodos: nombre → status → duración → payload entrada/salida colapsable
    - Si falla: error completo con stack trace y qué nodo lo causó
    - Payload final del último nodo como JSON visualizable (colapsable)

</decisions>

<specifics>
## Specific Ideas

- El campo `code` en `mia.node_types` contiene el script que el sandbox ejecuta. La
  interfaz del nodo es: función recibe `(input, config)` y retorna `output` (ambos JSON).
- El "Pipe Object" viaja entre nodos:
  ```json
  { "metadata": { "flowId": "uuid", "runId": "uuid", "nodeId": "uuid" },
    "payload": { "data": "..." },
    "state": {} }
  ```
- Para JS sandbox: preferir `vm2` o `worker_threads` para aislamiento. El spec menciona ambos.
- El patrón de AgentSteps en WorkspacePage.vue (timeline con iconos por tipo de evento)
  puede reutilizarse como base visual para el timeline de nodos en FlowRunsPage.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/backend/api/ws_manager.py` — `AgentEventManager` singleton: broadcast de eventos
  por session_code. Reutilizar para `run_id` como channel key.
- `src/backend/core/security.py` — `verify_token_raw(token)` para autenticar WS connections.
- `src/frontend/src/components/` — el patrón de AgentSteps (WorkspacePage) como base
  para el timeline de ejecución de nodos.
- `src/backend/api/library.py` — ya expone CRUD de flows y node_types. Agregar el
  endpoint `/execute` aquí.

### Established Patterns
- Backend Python: FastAPI + SQLAlchemy async + Alembic para migraciones.
- Frontend: Vue 3 + Pinia stores + `src/frontend/src/api/client.ts` para HTTP calls.
- Auth: token JWT en Authorization header (HTTP) o query param `?token=` (WebSocket).
- El flow graph se guarda como JSONB: `{ nodes: FlowNode[], edges: FlowEdge[], misc_nodes: MiscNode[] }`.

### Integration Points
- `mia.node_types.code` — campo donde vive el script ejecutable de cada nodo.
- `mia.flows.graph` — el DAG que el orchestrator parsea y ejecuta.
- `src/frontend/src/router/index.ts` — agregar ruta `/library/:id/runs`.
- `docker-compose.yml` — agregar servicios `redis` y `orchestrator`.
- `src/backend/api/library.py` — agregar `POST /flows/{id}/execute`.

</code_context>

<deferred>
## Deferred Ideas

- **Python bridge** (Processor: Python) — siguiente iteración del engine tras validar el DAG executor con JS.
- **Sink nodes: Qdrant, Neo4j** — después de que Source + Processor funcionen.
- **Source: Folder watcher / File watcher** — source nodes basados en filesystem events. Requiere un watcher process en el orchestrator.
- **Panel inline en el Flow Designer** — mostrar ejecución en tiempo real dentro del diseñador (además de la página de Runs). Pendiente de validar si la página de Runs es suficiente.
- **Retry logic por nodo** — configurar reintentos en caso de error a nivel de nodo individual (BullMQ lo soporta).
- **Node.js package installation sandbox** — permitir `import` de npm packages en los scripts JS. Requiere aislamiento adicional.

</deferred>

---

*Phase: 01-orchestrator-engine*
*Context gathered: 2026-04-05*
