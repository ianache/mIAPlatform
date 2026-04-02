# Arquitectura

- modulos orientados a funciones específicas dentro de la plataforma: web, bff, api, mcp, sandbox (basados en WASM y docker)
- conjunto de skills basadas en estandar de la industria que definen las capacidades de los agentes
- conjunto de herramientas disponibles para soportar los skills
- conjunto de modelos LLMs disponibles para soportar los skills
- conjunto de fuentes de datos y conocimiento disponibles para soportar los skills.

# Frameworks

- uv (for python package and app management)
- Vue 3 (web)
- NodeJS (para bff)
- FastAPI (api, mcp)
- Docker (sandboxing)
- WASM (sandboxing)
- Google ADK (framework de orquestación de agentes)
- LangChain (framework de orquestación de agentes)
- Graphiti for Neo4J

# Bases de Datos

- Base de datos relacional (postgres) para almacenamiento de configuraciones y datos necesarios.
- Base de datos NoSQL (mongodb) para almacenamiento de datos de los agentes.
- Base de datos Neo4j para almacenamiento de conocimiento.
- Hashicorp Vault para almacenamiento de secretos y parametria general.

# Seguridad
- Seguridad basada en RedHat Keycloak v26+
- Conformidad con ISO 27001
- Conformidad con OWASP Top 10 2025 (o reciente)
- Autorizacion basada en Feature Flags con Unleash

# Deployment
- Componentes contenerizados
- Solución distribuible en docker-compose y cartas helm para kubernetes.

# Monitoring
- Exposicion de metricas prometheus sobre todos los componentes
- Grafana para visualización de metricas (out of scope)
- Loki para almacenamiento de logs (out of scope)
- Jaeger para trazabilidad (out of scope)
- Alertmanager para notificaciones (out of scope)
- Ral User Monitoring (RUM) con Grafana Faro (out of scope)