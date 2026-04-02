# Architecture Patterns

**Domain:** Multi-Agent AI Platform
**Researched:** April 2026

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Vue 3 Frontend                                  │
│                    (SPA with Pinia state management)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NodeJS BFF Layer                                   │
│              (Express/Fastify - Auth, Session, API Aggregation)             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FastAPI Agent Layer                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐ │
│  │   LLM Gateway   │  │  Agent Runtime   │  │    MCP Tool Server         │ │
│  │    (LiteLLM)    │  │   (ADK/LangChain)│  │   (Tool Registry)         │ │
│  └─────────────────┘  └──────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
           │                        │                         │
           ▼                        ▼                         ▼
┌──────────────────┐  ┌──────────────────────┐  ┌─────────────────────────────┐
│  LLM Providers   │  │  Execution Sandbox   │  │     External Tools         │
│ (OpenAI/Anthropic │  │ (Kata/Firecracker)  │  │  (APIs, Databases, etc)   │
│  Google/Ollama)  │  │                     │  │                             │
└──────────────────┘  └──────────────────────┘  └─────────────────────────────┘
           │                        │                         │
           ▼                        ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Data Layer                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │ PostgreSQL  │  │  MongoDB   │  │  Neo4j     │  │   HashiCorp Vault   │   │
│  │ (Config)   │  │ (Agents)   │  │ (Knowledge)│  │    (Secrets)        │   │
│  └────────────┘  └────────────┘  └────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Vue 3 Frontend** | UI, user interactions, agent builder | NodeJS BFF via REST/WebSocket |
| **NodeJS BFF** | Auth proxy, session management, API aggregation | Frontend, FastAPI, Keycloak |
| **FastAPI (LLM Gateway)** | Unified LLM interface, model routing | LLM Providers (OpenAI, Anthropic, etc.) |
| **FastAPI (Agent Runtime)** | Agent execution, tool orchestration | Sandbox, MCP Server, LLM Gateway |
| **Sandbox** | Isolated code/tool execution | Agent Runtime (via RPC) |
| **MCP Server** | Tool registration, protocol handling | Agent Runtime, External APIs |
| **Vault** | Secrets injection, tenant isolation | All components needing credentials |

### Data Flow

1. **Agent Creation Flow:**
   ```
   User (Vue) → BFF (NodeJS) → FastAPI → MongoDB (agent def)
   ```

2. **Agent Execution Flow:**
   ```
   User (Vue) → BFF → FastAPI → LLM Gateway → LLM Provider
                                ↓
                         Agent Runtime → Tool Call → Sandbox → External API
                                ↓
                         Knowledge Graph (Neo4j for context)
                                ↓
                         Response → BFF → Vue
   ```

3. **Tool Execution with Sandbox:**
   ```
   Agent Runtime → MCP Server → Sandbox Request → Kata Container
                                                 ↓
                                          Code Execution
                                                 ↓
                                          Result → Agent Runtime
   ```

## Patterns to Follow

### Pattern 1: Two-Level Agent Hierarchy

**What:** Primary orchestrator agent + specialized subagents
**When:** Building multi-agent systems
**Example:**
```python
# Primary agent - orchestrates tasks
class PrimaryAgent:
    async def run(self, task: str) -> Result:
        if task.requires_analysis:
            return await self.delegate_to(subagent=AnalysisAgent, task=task)
        elif task.requires_generation:
            return await self.delegate_to(subagent=GeneratorAgent, task=task)
```

**Why:** Production-proven pattern from LinkedIn, Uber. Simplifies debugging, reduces coordination overhead.

### Pattern 2: Model Context Protocol (MCP)

**What:** Standardized tool integration protocol
**When:** Connecting agents to external tools and services
**Why:** Open standard (Anthropic), vendor-neutral, growing ecosystem (100+ servers)

### Pattern 3: Multi-Tenant Namespace Isolation

**What:** Vault namespaces for tenant secret isolation
**When:** Multi-tenant SaaS deployment
**Example:**
```python
# Each tenant gets isolated namespace
vault_client = hvac.Client(url=VAULT_URL, token=VAULT_TOKEN)
vault_client.namespace = f"tenant-{tenant_id}"

# Agent credentials retrieved within namespace
secrets = vault_client.secrets.kv.v2.read_secret(
    path=f"agents/{agent_id}/credentials"
)
```

### Pattern 4: LiteLLM for LLM Gateway

**What:** Unified gateway for 100+ LLM providers
**When:** Supporting multiple LLM providers
**Why:** Consistent API, built-in retries, cost tracking, easy model switching

## Anti-Patterns to Avoid

### Anti-Pattern 1: Premature Agent Complexity

**What:** Building nested hierarchies from day one
**Why bad:** Over-engineering leads to debugging nightmares, unpredictable behavior, high costs
**Instead:** Start with two levels, add complexity only after proven stable

### Anti-Pattern 2: Raw Context Shoveling

**What:** Passing full conversation history to every LLM call
**Why bad:** Context bloat causes high costs, slow responses, token limits
**Instead:** Implement context pruning, compression, and importance-based filtering

### Anti-Pattern 3: No Sandbox for Tool Execution

**What:** Running tools directly on host system
**Why bad:** Security vulnerabilities, data exfiltration risk, system compromise
**Instead:** Use microVM sandbox (Kata/Firecracker) for untrusted code

### Anti-Pattern 4: Hardcoded API Keys

**What:** Storing LLM provider keys in code or config files
**Why bad:** Credential exposure, no tenant isolation, audit failures
**Instead:** Use Vault with namespace isolation, dynamic credentials

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Agent Execution** | Single FastAPI instance | Horizontal scaling, load balancer | Kubernetes HPA, auto-scaling |
| **LLM Costs** | Fixed quota per user | Usage-based billing, budget alerts | Token metering, rate limiting |
| **Sandbox** | On-demand containers | Pre-warmed pool, queue-based | Multi-region, dedicated clusters |
| **Database** | Single PostgreSQL | Read replicas, connection pooling | Sharding, CQRS |
| **Monitoring** | Basic metrics | LangSmith, custom dashboards | Full observability stack |

## Sources

- [Production-Ready Multi-Agent Systems - Best Practices](https://towardsagenticai.com/production-ready-multi-agent-systems-9-best-practices/) - HIGH
- [Multi-Tenant LLM SaaS Architecture](https://markaicode.com/multi-tenant-llm-saas-isolation/) - HIGH
- [Google ADK vs LangChain vs CrewAI](https://dlyc.tech/blog/2026/google-adk-vs-langchain-vs-crewai) - HIGH
- [LiteLLM Documentation](https://docs.litellm.ai/) - HIGH
- [HashiCorp Vault Multi-Tenant](https://developer.hashicorp.com/vault/docs/enterprise/namespaces) - HIGH