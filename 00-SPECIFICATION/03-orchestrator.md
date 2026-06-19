# Goal

Estoy construyendo un Engine de Orquestación Low-Code basado en el patrón Pipe & Filter. Los Filter son nodos de diferente tipo que pueden ser programados en javascript o python y cuentan con una configuracion con propiedades que permiten parametrizar su comportamiento. Los nodos se conectan entre si formando un grafo dirigido aciclico (DAG) y se ejecutan en orden secuencial. El flujo se inicia con uno o varios nodos Source (gatillados por schedule/cron, deteccion de cambios en folder segun glob o monitoreo de creacion o cambio en un archivo segun su ruta) que inicia el flujo y puede terminar con uno o varios nodos Sink que finaliza el flujo.

# Specification

El objetivo es que cada "caja" o nodo sea una unidad lógica pura que transforme un Payload basándose en una Config. Para que Claude Code nos genere algo de primer nivel mediante Vibecoding, necesitamos una estructura técnica impecable.

Aquí tienes la propuesta de diseño y las especificaciones de requisitos (ReqSpec).

1. Arquitectura de Referencia: "The Core Engine"
Utilizaremos una arquitectura orientada a eventos para el flujo de datos, con un Runner agnóstico que maneje el ciclo de vida de los nodos.

El Modelo de Datos (The Pipe Object)
El objeto que viaja por el flujo debe ser inmutable o versionado para evitar efectos secundarios extraños:

JSON
{
  "metadata": { "flowId": "uuid", "traceId": "uuid" },
  "payload": { "data": "..." },
  "state": { "key": "value" } 
}
Componentes Clave
Orchestrator (The Brain): Lee el grafo (DAG), resuelve dependencias y dispara la ejecución.

Node Runner (The Worker): El entorno de ejecución (Sandbox) para JS y Python.

Registry: Catálogo de funciones predefinidas (Splitter, Embedder, etc.).

2. ReqSpec para Claude Code
Copia y pega esto en tu sesión con Claude para empezar a iterar.

Project: FlowEngine - Pipe & Filter Orchestrator
Contexto:
Desarrollar un motor de ejecución de flujos basado en nodos. Cada nodo recibe un objeto JSON (input) y una configuración estática (config), y devuelve un nuevo objeto JSON (output).

Requerimientos Funcionales (Core)
Graph Parser: Capacidad de procesar un JSON que defina nodos (IDs, tipos, configs) y aristas (conexiones source/target). Debe validar que sea un DAG (Directed Acyclic Graph).

Execution Engine: * Soporte para ejecución secuencial y paralela (cuando un nodo tiene múltiples salidas).

Gestión de estado del flujo: cada nodo debe recibir el output del anterior.

Multi-Language Sandbox:

Node.js VM: Para ejecutar bloques de JavaScript de forma segura.

Python Bridge: Uso de child_process o Pyodide para ejecutar lógica Python pasando el payload como entrada.

Node Library Inicial: Implementar los nodos del diagrama adjunto:

Source: File, Folder, Bucket (Mockups iniciales).

Splitter: Lógica de fragmentación de texto con overlap.

Embedder: Interface para llamadas a APIs de Vectorización.

Sink: Conectores para Neo4j y Qdrant.

Especificaciones Técnicas
Stack: Node.js (TypeScript) para el orquestador por su naturaleza no bloqueante.

Pattern: Repository Pattern para los nodos y Strategy Pattern para los motores de ejecución (JS vs Python).

Observability: Logs detallados de entrada/salida por cada nodo para debugging.

3. Estrategia de Implementación (Fases de "Vibecoding")
Para que Claude no se pierda, te sugiero guiarlo en este orden:

Paso 1: El Contrato del Nodo
Define la interfaz abstracta. Todo nodo debe tener un método execute(input, config): Promise<output>.

Paso 2: El Orquestador de Grafos
Pide a Claude: "Crea un motor que recorra una lista de nodos y conexiones. Usa una cola de prioridad para manejar qué nodo se ejecuta después basándose en las dependencias de las aristas."

Paso 3: El "Polyglot Bridge"
Aquí es donde brilla el diseño:

Para JS: Usa el paquete vm2 o worker_threads para aislar el código del usuario.

Para Python: Pide que implemente un wrapper que serialice el input a JSON, lo pase a un script .py y capture el stdout.