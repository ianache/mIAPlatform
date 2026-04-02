# Requirements: Orchestra / Synthetix

## Overview

A multi-agent AI platform allowing users to define custom AI agents with specific characteristics, skills, tools, and personalities. Designed as a high-end editorial command center with dark theme, glassmorphism, and intentional asymmetry.

## UI/UX Requirements (from Design System)

### Design System Specification

#### Colors (Dark Theme)
- **Background/Surface**: #091421
- **Surface Container Low**: #121C2A
- **Surface Container**: #16202E
- **Surface Container High**: #212B39
- **Surface Container Highest**: #2B3544
- **Primary**: #ADC6FF (Electric Blue)
- **Primary Container**: #4D8EFF
- **Secondary**: #B1C6F9
- **Tertiary**: #FFB786
- **Tertiary Container**: #DF7412
- **Error**: #FFB4AB
- **On Surface**: #D9E3F6
- **On Surface Variant**: #C2C6D6
- **Outline**: #8C909F

#### Typography
- **Headlines**: Space Grotesk
- **Body**: Manrope
- **Labels**: Inter

#### Design Rules
- **No-Line Rule**: No 1px solid borders - use background shifts and tonal transitions
- **Glassmorphism**: Floating elements use surface_bright at 60% opacity with backdrop-filter blur(12px)
- **Primary Gradient**: from primary to primary_container at 135° angle

## Screens / Pages Required

### 1. Workspace / Dashboard (`multi_agent_ai_dashboard`)
Main multi-agent command center showing task execution and results.

**Elements:**
- Left Sidebar Navigation (Workspace, Agents, Library, Analytics, Settings)
- Top Navigation Bar with search
- Main Working Area (results display)
- Right Agent Activity Zone (agent cards with status, thinking, actions)
- Floating Prompt Bar at bottom center
- Stats footer (Active Agents, Tokens Used)

### 2. Agent Creation Form (`formulario_nuevo_agente_ai`)
Form to create new AI agents with full configuration.

**Sections:**
- **Identidad del Agente**: Avatar upload, name, description
- **Configuración del Modelo**: LLM provider (OpenAI/Anthropic/Gemini), model selection, temperature slider
- **Definición de Rol**: System prompt textarea
- **Capacidades y Herramientas**: Toggles for Web Search, File Analysis, Code Execution (Sandbox)

### 3. Agent Management / Settings (`configuraci_n_de_agentes_con_nuevo_bot_n`)
Agent list and settings page.

**Elements:**
- Agent cards list with status (Ready/Calibrating)
- Edit buttons per agent
- API Keys section (OpenAI, Anthropic, Google Gemini)
- Key validation status indicators
- Stats: Total Tokens, Avg Latency, Success Rate, Current Spend

### 4. Model Registry (`gesti_n_de_modelos_llm_y_etiquetas`)
LLM model registry with feature-to-model mapping.

**Elements:**
- Global stats (Avg Latency, Cost/1k Tokens, Active Tokens, Registry Health)
- Registered Models list with provider logos, status, tags
- Feature-to-Model Mapping panel (Core Chat Agent, Report Generator, Web Search Assistant)
- Registry Activity table (events, model, timestamp, status)

### 5. Analytics / Cost Management (Multiple Views)

**5a. Cost Analytics - Monthly Comparison** (`anal_ticas_de_costos_con_comparativa_mensual`)
- Date range filter (Last 7/30 days, custom)
- Agent filter
- Hero cards: Total Monthly Spend, Cost/1M Tokens, Optimization Savings
- Daily spending chart by provider
- Model distribution donut chart
- Budget progress bar with alerts
- Detailed execution table

**5b. Cost Analytics - Date Filters** (`anal_ticas_de_costos_con_filtros_de_fecha`)
- Filter by date range and agent
- Same layout as 5a

**5c. Cost Analytics - Export** (`anal_ticas_de_costos_con_exportaci_n`)
- Export options (PDF, CSV)
- Download button

**5d. Cost Analytics - By Model** (`anal_ticas_de_costos_por_modelo`)
- Model breakdown view

### 6. Market Intelligence Settings (`market_intelligence_settings`)
Configuration for market intelligence agents.

**Sections:**
- **Data Sources**: Toggles for Global News, Financial Reports, Social Media, Competitor Filings
- **Analysis Depth**: Slider (1-5 levels) with descriptions
- **Alert Preferences**: Checkboxes for Instant, Daily Summaries, Critical Alerts
- **Reporting Formats**: Radio options (PDF, Dashboard, Raw Data)

## Functional Requirements

### Phase 1: Foundation (4-6 weeks)
- Multi-tenant architecture
- LiteLLM unified gateway
- PostgreSQL, MongoDB, Vault setup
- Keycloak authentication
- FastAPI core

### Phase 2: Agent Core & UI (6-8 weeks)
- Agent creation form UI
- Agent management UI
- Settings page with LLM keys
- Model registry UI

### Phase 3: Workspace & Multi-Agent (8-10 weeks)
- Main dashboard with agent activity
- Google ADK integration
- MCP protocol
- Neo4j knowledge graph

### Phase 4: Analytics (4-6 weeks)
- Cost analytics dashboard
- Date filtering
- Export functionality
- Budget alerts

### Phase 5: Security Hardening (4-6 weeks)
- MicroVM sandbox (Firecracker/Kata)
- WASM sandbox
- OWASP compliance

### Phase 6: Production Readiness (4-6 weeks)
- Prometheus, Grafana, Loki, Jaeger
- Docker-compose, Kubernetes
- CI/CD pipelines

## Out of Scope
- Mobile applications
- Voice interfaces
- Third-party marketplace
- Custom model fine-tuning
