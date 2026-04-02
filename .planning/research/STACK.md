# Technology Stack

**Project:** mIAPlatform
**Researched:** April 2026

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|-----------|---------|---------|-----|
| **Vue 3** | 3.4+ | Frontend UI | Composition API, TypeScript support, excellent DX. Pinia for state management. |
| **NodeJS** | 20+ (LTS) | BFF Layer | Express or Fastify. Handles API aggregation, session management, auth proxying to Keycloak. |
| **FastAPI** | 0.115+ | Agent API/MCP | Python-based for ADK/LangChain integration. Native async, Pydantic validation, OpenAPI generation. |
| **Docker** | Latest | Containerization | Primary deployment mechanism. Compose for dev, Kubernetes for production. |
| **WASM** | WASI Preview 2 | Sandbox complement | Lightweight code execution. Consider as complement to microVM isolation, not replacement. |

### Agent Frameworks
| Technology | Purpose | When to Use |
|------------|---------|-------------|
| **Google ADK** | Production multi-agent orchestration | When building production systems on Google Cloud, needing native MCP support, hierarchical agent trees |
| **LangChain** | Flexible agent building | When needing maximum ecosystem integration, custom workflows, or rapid prototyping |
| **LangGraph** | Graph-based orchestration | Complex conditional workflows, state machines, supervisor patterns |

**Recommendation:** Use ADK as primary for production multi-agent systems. LangChain/LangGraph for specialized tools or when ADK ecosystem gaps exist.

### Database
| Technology | Purpose | Why |
|------------|---------|-----|
| **PostgreSQL** | Configuration, user data, tenant config | ACID compliance, reliable for structured data, excellent JSON support |
| **MongoDB** | Agent definitions, dynamic schemas | Flexible schemas for agent configurations, personality traits, tool definitions |
| **Neo4j** | Knowledge graphs | Graph traversal for agent context, relationship-aware queries |
| **HashiCorp Vault** | Secrets management | Dynamic credentials, namespace isolation for multi-tenancy |

### LLM Integration
| Technology | Purpose | Why |
|------------|---------|-----|
| **LiteLLM** | Unified LLM gateway | 100+ model support, consistent API, built-in retries, cost tracking |
| **Ollama** | Local models | Self-hosted LLMs, privacy-sensitive workloads |
| **LM Studio** | Local model management | Desktop GUI for local model testing |

### Infrastructure
| Technology | Purpose | Why |
|------------|---------|-----|
| **Keycloak** | Identity & Access | OpenID Connect, multi-tenant realm configuration |
| **Kata Containers** | VM-level sandbox | Hardware isolation via microVMs, Kubernetes integration |
| **Firecracker** | MicroVM isolation | Minimal overhead (~125ms boot), strong isolation |
| **gVisor** | Syscall interception | Alternative to full VMs for trusted workloads |

### Observability
| Technology | Purpose |
|------------|---------|
| **Prometheus** | Metrics collection |
| **Grafana** | Visualization, RUM |
| **Loki** | Log aggregation |
| **Jaeger** | Distributed tracing |
| **LangSmith** | Agent-specific observability (optional paid) |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Frontend | Vue 3 | React | Team familiarity, simpler state management with Pinia |
| Backend API | FastAPI | NestJS | Better Python ecosystem for AI/ML, native async |
| Agent Framework | ADK | CrewAI | ADK has stronger production story, native MCP, Google backing |
| Container Runtime | Kata Containers | Plain Docker | Shared kernel insufficient for untrusted code |
| LLM Gateway | LiteLLM | Custom implementation | 100+ providers, battle-tested, cost tracking built-in |

## Installation

### Core Backend (FastAPI)
```bash
pip install fastapi uvicorn litellm langchain langgraph google-adk pydantic
pip install sqlalchemy asyncpg motor neo4j hvac
pip install python-jose python-multipart
```

### Frontend (Vue 3)
```bash
npm create vue@latest my-app -- --typescript
cd my-app
npm install pinia vue-router @vueuse/core
npm install -D vite-plugin-pwa
```

### Infrastructure
```bash
# Docker
docker-compose up -d postgres mongo neo4j vault keycloak

# Python services
pip install -r requirements.txt

# Node BFF
npm install express-session keycloak-connect cors helmet
```

## Sources

- [Google ADK Documentation](https://google.github.io/adk-docs/) - HIGH
- [LangChain/LangGraph Documentation](https://python.langchain.com/docs) - HIGH
- [LiteLLM GitHub](https://github.com/BerriAI/liteLLM) - HIGH
- [Northflank Sandbox Guide](https://northflank.com/blog/how-to-sandbox-ai-agents) - HIGH
- [Kata Containers Documentation](https://katacontainers.io/) - HIGH
- [HashiCorp Vault Namespaces](https://developer.hashicorp.com/vault/docs/enterprise/namespaces) - HIGH
- [Vue 3 Documentation](https://vuejs.org/) - HIGH
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - HIGH