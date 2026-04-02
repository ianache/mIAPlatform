# Project: Orchestra / Synthetix

## Description

A multi-agent AI platform allowing users to define custom AI agents with specific characteristics, skills, tools, and personalities to assist with complex tasks across different business domains. Designed as a high-end editorial command center with "Orchestrated Intelligence" feel.

## Brand Names

- **Primary**: Orchestra
- **Secondary**: Synthetix (appears in agent form)
- **Tagline**: Multi-Agent System / Multi-Agent OS

## Key Ideas

- Specialized agents for different thematic areas
- Multiple LLM providers (OpenAI, Anthropic, Google) and local models (Ollama, LM Studio)
- Isolated sandbox environment for secure tool execution
- Two-level agent hierarchy pattern (primary orchestrator + specialized subagents)

## Architecture

- **Web**: Vue 3
- **BFF**: NodeJS
- **API/MCP**: FastAPI
- **Sandboxing**: Docker + WASM + MicroVM (Firecracker/Kata)
- **Agent Frameworks**: Google ADK, LangChain
- **Knowledge**: Graphiti for Neo4J

## Databases

- PostgreSQL (configurations)
- MongoDB (agent data)
- Neo4j (knowledge graphs)
- HashiCorp Vault (secrets)

## Security

- Keycloak v26+
- ISO 27001 compliant
- OWASP Top 10 2025 compliant

## Deployment

- Docker-compose
- Kubernetes (Helm charts)

## Monitoring

- Prometheus
- Grafana (RUM)
- Loki
- Jaeger

## Tech Stack

- Vue 3, NodeJS, FastAPI, Docker, WASM, Google ADK, LangChain, Neo4j, PostgreSQL, MongoDB, HashiCorp Vault, LiteLLM
