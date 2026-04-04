# Goal

Visualización de artefactos generados por el agente en la sesión de conversación.

# Intention

Observo que el agente si está generando artefactos en la tabla mia.agent_artifacts pero no se ven reflejados los artefactos en la parte izquierda de Workspace (a la izquierda del panel de "Agent Activity". Se habia solicitado que se mostrara dentro de un panel cada uno de los artifacts producidos por el agente dentro de la sesion de conversacion. Cada artefacto se debe presentar como un card que tenga name, tipo del artefacto (como un badget o etiqueta en la parte baja del card) y icono para abrir que permita acceder a la url del contenido (en la tabla mia.agent_artifacts está file_url que debiera permitir acceder al campo "content" previsualizado en un modal y renderizado segun artifact_type (inicialmente como un Markdown), summary (no mas de 200 caracteres), fecha de creacion.