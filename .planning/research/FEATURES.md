# Feature Landscape

**Domain:** Multi-Agent AI Platform (SaaS)
**Researched:** April 2026

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Agent Definition** | Users need to create and configure custom agents | High | Requires: characteristics, skills, tools, personality, system prompt |
| **Multi-Provider LLM** | Users want choice of models, cost control | Medium | OpenAI, Anthropic, Google, Ollama, LM Studio |
| **Basic Tool Execution** | Agents need to take actions | High | File read/write, API calls, code execution |
| **User Authentication** | Platform security baseline | Low | Keycloak with OIDC |
| **Tenant Isolation** | Multi-tenant SaaS requirement | High | Data, secrets, resources per tenant |
| **Conversation Context** | Agents need memory | Medium | Message history, session management |
| **API Exposure** | External integration | Medium | REST API, MCP protocol for tools |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Sandbox Isolation** | Secure tool execution for untrusted code | Very High | Firecracker microVMs or Kata Containers |
| **Knowledge Graph Context** | Agents with persistent memory | Medium | Neo4j integration for RAG-style context |
| **Hierarchical Multi-Agent** | Complex orchestration | High | ADK-style parent-child agent trees |
| **Agent Marketplace** | Share and discover agents | Medium | Future consideration |
| **Real-time Streaming** | Better UX for agent responses | Low | Server-sent events, WebSocket |
| **Custom Tools** | Extend agent capabilities | Medium | User-defined tool registration |
| **Prompt Engineering UI** | Visual prompt builder | Medium | Future consideration |

## Anti-Features

Features to explicitly NOT build (initially).

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full code IDE** | Too complex, security nightmare | Sandbox execution only |
| **Agent-to-agent marketplace** | Premature for MVP | Internal agent sharing |
| **Custom LLM fine-tuning** | High cost, complexity | Use provider fine-tuning |
| **Unlimited sandbox** | Cost escalation | Fixed quotas, resource limits |
| **Public agent deployment** | Security concerns | Internal deployment only |

## Feature Dependencies

```
User Auth (Keycloak)
    ↓
Tenant Isolation (Vault namespaces)
    ↓
Agent Definition (MongoDB) → Agent Execution (FastAPI/ADK)
    ↓                                    ↓
LLM Gateway (LiteLLM) ←────────────────┘
    ↓
Tool Execution → Sandbox Isolation (Kata/Firecracker)
    ↓
Knowledge Graph (Neo4j) ← Context Management
```

## MVP Recommendation

Prioritize:
1. **Agent Definition** — Core value proposition; define agent model first
2. **Multi-Provider LLM** — LiteLLM gateway for OpenAI, Anthropic, Google
3. **Basic Tool Execution** — Simple tools (HTTP, file read) without sandbox
4. **Tenant Isolation** — Vault namespaces, Keycloak realms

Defer:
- **Advanced Sandbox** — Use basic Docker isolation initially
- **Knowledge Graph** — Simple context management first
- **Multi-Agent Orchestration** — Single agent first, add hierarchy later
- **Agent Marketplace** — Post-MVP

## Sources

- [Production-Ready Multi-Agent Systems](https://towardsagenticai.com/production-ready-multi-agent-systems-9-best-practices/) - HIGH
- [Multi-Agent Platform Architecture](https://callsphere.tech/blog/ai-agent-saas-architecture-multi-tenant-platform-design) - MEDIUM
- [Google ADK vs LangChain vs CrewAI](https://dlyc.tech/blog/2026/google-adk-vs-langchain-vs-crewai) - HIGH