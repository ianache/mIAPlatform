# Roadmap: Orchestra / Synthetix

## Phase 1: Foundation (4-6 weeks)

**Goal:** Establish core infrastructure and multi-tenant capabilities

### Tasks

1. Set up project structure and development environment
2. Configure PostgreSQL and MongoDB databases
3. Implement Keycloak authentication
4. Set up HashiCorp Vault integration
5. Build FastAPI core with OpenAPI docs
6. Implement LiteLLM gateway for unified LLM access
7. Create basic tenant isolation mechanisms
8. Set up design system tokens (Tailwind config with custom colors)

**Deliverables:**
- Working development environment
- Authenticated API endpoints
- Unified LLM gateway
- Design system token configuration

**Plans:**
- [x] 01-foundation-01-PLAN.md — Project structure and design tokens
- [x] 01-foundation-02-PLAN.md — FastAPI core with LiteLLM gateway

## Phase 2: Agent Core & UI (6-8 weeks)

**Goal:** Enable user-defined agent creation and UI foundation

### Tasks

1. Design agent definition schema
2. Build Vue 3 agent configuration UI (from formulario_nuevo_agente_ai)
3. Implement agent avatar upload
4. Create LLM provider selection interface
5. Build temperature and system prompt controls
6. Implement capability toggles
7. Create agent list management UI
8. Build settings page with API key management
9. Configurar Keycloak v26 en oauth2.qa.comsatel.com.pe (Realm: Apps, Client ID: miaplatform)
10. Migrar gestión de paquetes Python a uv (pyproject.toml)

**Deliverables:**
- Agent creation UI matching spec
- Agent management interface
- Settings page with LLM keys
- Keycloak v26 configurado y funcional
- Gestión de paquetes Python con uv

**Plans:** 6 plans
- [x] 02-01-PLAN.md — Agent schema + CRUD API (backend)
- [x] 02-02-PLAN.md — Vue 3 app scaffold, routing, layout shell
- [x] 02-03-PLAN.md — Agent creation form UI (4 sections)
- [ ] 02-04-PLAN.md — Agent management list + settings with API keys
- [ ] 02-05-PLAN.md — Model registry UI
- [x] 02-06-PLAN.md — Keycloak v26 config + uv migration

## Phase 3: Workspace & Multi-Agent Orchestration (8-10 weeks)

**Goal:** Main dashboard and multi-agent workflows

### Tasks

1. Build main workspace dashboard (from multi_agent_ai_dashboard)
2. Implement agent activity zone
3. Create floating prompt bar component
4. Integrate Google ADK for orchestration
5. Implement LangChain/LangGraph tools
6. Build MCP protocol server and client
7. Set up Neo4j knowledge graph
8. Implement Graphiti knowledge processing
9. Add RAG and GraphRAG capabilities

**Deliverables:**
- Full workspace dashboard
- Multi-agent orchestration
- Knowledge management

## Phase 4: Analytics & Cost Management (4-6 weeks)

**Goal:** Cost analytics and usage tracking

### Tasks

1. Build analytics dashboard (from anal_ticas_de_costos)
2. Implement cost tracking per model/agent
3. Create spending trend charts
4. Build budget alerts system
5. Implement export functionality (PDF, CSV)
6. Create usage statistics

**Deliverables:**
- Cost analytics dashboard
- Budget management
- Usage reporting

## Phase 5: Security Hardening (4-6 weeks)

**Goal:** Production-grade security isolation

### Tasks

1. Implement microVM sandbox (Firecracker/Kata)
2. Add WASM sandbox for lightweight tools
3. Configure API gateway with WAF
4. Implement mTLS between services
5. Complete OWASP Top 10 compliance
6. Security audit and penetration testing

**Deliverables:**
- Secure sandbox execution
- Network security
- Compliance documentation

## Phase 6: Production Readiness (4-6 weeks)

**Goal:** Production deployment and operations

### Tasks

1. Set up Prometheus metrics
2. Configure Grafana dashboards
3. Implement Loki log aggregation
4. Add Jaeger distributed tracing
5. Create Docker-compose distribution
6. Build Kubernetes Helm charts
7. Set up CI/CD pipelines

**Deliverables:**
- Full observability stack
- Deployment manifests
- CI/CD automation

---

**Total Timeline:** 30-40 weeks

## Dependencies

- Phase 1 → Phase 2 (foundation required for agent core)
- Phase 2 → Phase 3 (agent core required for orchestration)
- Phase 3 → Phase 4 (orchestration needed for analytics)
- Phase 4 → Phase 5 (analytics needed before security)
- Phase 5 → Phase 6 (security required for production)

## Key Decisions

1. **Two-level hierarchy**: Primary orchestrator + specialized subagents
2. **ADK primary**: Use Google ADK as main orchestration framework
3. **LiteLLM**: Unified LLM gateway from start
4. **MicroVM sandbox**: Use Firecracker/Kata over plain Docker
5. **Design-first**: UI must match Design System Specification exactly
