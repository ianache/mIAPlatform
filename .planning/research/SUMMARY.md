# Research Summary: mIAPlatform

**Domain:** Multi-Agent AI Platform (SaaS)
**Researched:** April 2026
**Overall confidence:** HIGH

## Executive Summary

mIAPlatform aims to build a multi-tenant platform where users define custom AI agents with specific characteristics, skills, tools, and personalities. The platform will support multiple LLM providers (OpenAI, Anthropic, Google) and local models (Ollama, LM Studio), with isolated sandbox environments for secure tool execution. The recommended architecture uses Google ADK for production-grade multi-agent orchestration with LangChain for flexibility, combined with microVM-based sandboxing (Firecracker/Kata Containers) for security isolation.

Key architectural decisions: Two-level agent hierarchy (primary orchestrator + specialized subagents), Model Context Protocol (MCP) for tool integration, multi-tenant secret isolation via HashiCorp Vault namespaces, and a polyglot database strategy (PostgreSQL for config, MongoDB for agent data, Neo4j for knowledge graphs).

## Key Findings

**Stack:** Vue 3 + NodeJS BFF + FastAPI + Docker/WASM, supporting Google ADK and LangChain for agent orchestration, with LiteLLM for multi-provider LLM abstraction.

**Architecture:** Event-driven, hierarchical two-level agent model with MCP for tool protocol. Polyglot persistence: PostgreSQL (config), MongoDB (agent definitions), Neo4j (knowledge graphs), Vault (secrets).

**Security:** MicroVM sandboxing (Firecracker/Kata Containers) for untrusted code execution, defense-in-depth with multiple isolation layers, zero-trust network model.

**Critical Pitfall:** Premature complexity in agent architecture. Start with two-level hierarchy, not nested hierarchies.

## Implications for Roadmap

Based on research, the recommended phase structure:

1. **Foundation Phase** - Core platform infrastructure
   - Multi-tenant architecture with Vault namespace isolation
   - Basic LLM gateway with LiteLLM
   - Vue 3 frontend + NodeJS BFF + FastAPI backend
   - Addresses: User authentication, tenant isolation, LLM provider abstraction

2. **Agent Core Phase** - Agent definition and basic execution
   - Agent model (characteristics, skills, tools, personality)
   - Simple single-agent execution with LangChain
   - PostgreSQL for configurations, MongoDB for agent data
   - Addresses: Agent CRUD, basic tool execution

3. **Multi-Agent Phase** - Advanced orchestration
   - Google ADK integration for hierarchical agent trees
   - MCP protocol for tool integration
   - Neo4j for knowledge graph context
   - Addresses: Multi-agent workflows, complex orchestration

4. **Security Hardening Phase** - Sandbox isolation
   - Firecracker/Kata Containers for code execution sandboxing
   - Resource limits (CPU, memory, network)
   - Prompt injection protection
   - Addresses: Secure tool execution, defense-in-depth

5. **Production Readiness Phase** - Scale and monitoring
   - Observability with LangSmith/OpenTelemetry
   - Cost optimization (caching, model routing)
   - Rate limiting and quota management
   - Addresses: Production deployment, monitoring, cost control

**Phase ordering rationale:** Foundation must establish multi-tenancy before agent execution. Agent core establishes basic patterns before multi-agent complexity. Security hardening requires agent execution context to understand what needs isolation. Production readiness requires all components in place.

**Research flags for phases:**
- Phase 1 (Foundation): Standard patterns, well-documented
- Phase 2 (Agent Core): LangChain patterns stable, good documentation
- Phase 3 (Multi-Agent): ADK is newer (April 2025), ecosystem still maturing
- Phase 4 (Security): MicroVM isolation patterns established but operational complexity high
- Phase 5 (Production): LangSmith costs significant at scale, need budget strategy

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vue 3, FastAPI, Docker, WASM are well-established. ADK and LangChain have strong communities. |
| Features | HIGH | Clear understanding of multi-agent platform requirements from research |
| Architecture | HIGH | Two-level hierarchy pattern well-validated in production systems |
| Pitfalls | MEDIUM | Security sandboxing for AI agents is an evolving field; best practices change monthly |

## Gaps to Address

- **ADK vs LangChain migration path**: Consider starting with LangChain for faster prototyping, migrating to ADK for production scale
- **WASM sandboxing**: Research is less mature than microVM approaches; consider as complementary to Firecracker
- **Multi-tenant billing**: Need deeper research on usage-based pricing models for LLM costs
- **Agent marketplace**: Future feature that may need separate research on discovery and sharing patterns