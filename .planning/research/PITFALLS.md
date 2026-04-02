# Domain Pitfalls

**Domain:** Multi-Agent AI Platform
**Researched:** April 2026

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Premature Agent Hierarchy Complexity

**What goes wrong:** Building nested multi-level agent hierarchies from day one leads to debugging nightmares, unpredictable coordination, and excessive LLM costs.

**Why it happens:** Teams over-engineer based on "production-ready" examples that are actually for complex enterprise use cases. They forget those systems took months to stabilize.

**Consequences:**
- Cannot trace agent decisions through complex trees
- Context explosion from excessive inter-agent messaging
- Costs spiral from unnecessary LLM calls
- Timeout cascades from deep agent chains

**Prevention:**
- Start with exactly two levels (primary + specialized)
- Debug thoroughly before adding complexity
- Only parallelize or branch after proven reliable

**Detection:**
- Agent trace depth > 5 layers
- Average execution time > 30 seconds
- Unpredictable outputs for similar inputs

### Pitfall 2: Inadequate Sandbox for Tool Execution

**What goes wrong:** Running agent tools directly on host infrastructure allows prompt injection, code execution exploits, and data exfiltration.

**Why it happens:** Standard Docker containers share the host kernel. AI agents generate untrusted code. Kernel vulnerabilities allow container escape = host compromise.

**Consequences:**
- Data breach (agent accesses sensitive files)
- Lateral movement (agent compromises other services)
- Resource exhaustion (agent runs crypto mining)
- Compliance violations (ISO 27001 failures)

**Prevention:**
- Use microVM isolation (Firecracker/Kata Containers) for untrusted code
- Implement defense-in-depth (multiple security layers)
- Default to strong isolation, relax only when threat model justifies

**Detection:**
- Container escape attempts in logs
- Unusual network connections from sandbox
- Resource spikes in sandbox environments

### Pitfall 3: No Multi-Tenant Secret Isolation

**What goes wrong:** Storing all tenant secrets in same Vault namespace or using shared API keys allows cross-tenant data access.

**Why it happens:** Treating Vault like a simple key-value store without namespace isolation. Using single API key for all LLM providers.

**Consequences:**
- Tenant A can access Tenant B's secrets
- One compromised tenant exposes entire platform
- Audit failures, compliance violations
- Legal liability for data breaches

**Prevention:**
- Use Vault namespace per tenant (Vault Enterprise)
- Implement tenant-scoped credential injection
- Audit all secret access with tenant context

**Detection:**
- Cross-tenant secret access attempts
- Missing tenant context in audit logs
- Shared credentials across tenants

### Pitfall 4: Context Explosion

**What goes wrong:** Passing full conversation history and verbose tool outputs to every LLM call causes costs to spiral and latency to spike.

**Why it happens:** "Shoveling" all context without pruning. Tool outputs contain excessive detail. No summarization of older messages.

**Consequences:**
- Token costs 10x-100x expected
- Latency exceeds 30 seconds per agent turn
- Context overflow errors (max tokens exceeded)
- Poor user experience from slow responses

**Prevention:**
- Implement context pruning (keep important + recent)
- Compress tool outputs to essential data only
- Summarize older conversation history
- Use semantic caching to avoid repeated calls

**Detection:**
- Token usage per request growing unbounded
- Latency spikes correlating with conversation length
- Context overflow errors in logs

## Moderate Pitfalls

### Pitfall 5: No 30-Second Task Limit Enforcement

**What goes wrong:** Long-running agent tasks cause timeouts, resource exhaustion, and poor user experience.

**Why it happens:** No enforcement of task duration. Synchronous waiting for complex workflows.

**Prevention:** Decompose tasks > 30 seconds into chunks. Implement as background jobs with status polling.

### Pitfall 6: LLM Provider Lock-in

**What goes wrong:** Hardcoded provider calls make switching impossible and create cost/availability risks.

**Why it happens:** Direct calls to provider APIs instead of abstraction layer.

**Prevention:** Use LiteLLM gateway for unified interface. Test failover between providers.

### Pitfall 7: Insufficient Error Handling

**What goes wrong:** Single LLM failure cascades to complete system failure. No graceful degradation.

**Why it happens:** No retry logic, fallback models, or error boundaries.

**Prevention:** Implement exponential backoff retries. Fallback to cheaper models. Graceful degradation responses.

## Minor Pitfalls

### Pitfall 8: No Observability for Agent Decisions

**What goes wrong:** Cannot debug why agent made specific decision. No audit trail for compliance.

**Prevention:** Use LangSmith or custom tracing. Log all agent actions, tool calls, decisions.

### Pitfall 9: Hardcoded Rate Limits

**What goes wrong:** Fixed rate limits don't account for tenant tier differences or usage patterns.

**Prevention:** Implement dynamic rate limiting based on tenant configuration and usage.

### Pitfall 10: Ignoring Prompt Injection

**What goes wrong:** User inputs manipulate agent behavior to execute malicious actions or leak data.

**Prevention:** Input validation, prompt filtering, output monitoring, sandboxed tool execution.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation | Poor tenant isolation design | Design Vault namespaces upfront |
| Agent Core | Premature complexity | Two-level only, no nesting |
| Multi-Agent | Context explosion | Implement pruning from day one |
| Security Sandbox | Insufficient isolation | Use microVMs, not containers |
| Production | Cost runaway | Budget alerts, caching, model routing |

## Sources

- [Production-Ready Multi-Agent Systems - Best Practices](https://towardsagenticai.com/production-ready-multi-agent-systems-9-best-practices/) - HIGH
- [AI Agent Sandboxing Guide](https://northflank.com/blog/how-to-sandbox-ai-agents) - HIGH
- [Multi-Tenant Security Patterns](https://zylos.ai/research/2026-02-23-multi-tenant-security-patterns-saas-platforms) - MEDIUM
- [NVIDIA Security Guidance](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/) - HIGH