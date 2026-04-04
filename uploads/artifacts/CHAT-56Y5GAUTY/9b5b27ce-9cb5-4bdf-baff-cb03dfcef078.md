## Revisión del Test Case  
**Proyecto:** 65 – *SIGO*  
**Issue / TC:** 6099 – *US5430‑CP01*  
**Fecha:** 2026‑04‑04  
**Revisor:** QA Experto  

### 1. Cobertura de los componentes del plan de pruebas
| Ítem del plan de pruebas | Cumple | Comentario |
|--------------------------|--------|------------|
| **Información General** | ✅ | Tabla con producto y funcionalidad incluida. |
| **Propósito** | ✅ | Descripción clara del objetivo del caso. |
| **Pre‑requisitos** | ✅ | Todos los pre‑requisitos necesarios están listados (sesión, OT, ítem “Por verificar”, conectividad, GPS). |
| **Código CP** | ✅ | Código US5430‑CP01 presente en varios lugares (encabezado, criterio de aceptación y procedimiento). |
| **Nombre del escenario / caso** | ✅ | Nombre descriptivo y alineado con la historia de usuario. |
| **Criterio de aceptación asociado** | ✅ | Se incluye CA‑01 con formato Given/When/Then. |
| **Prioridad** | ✅ | Indicada como “Alta”. |
| **Procedimiento de prueba (pasos)** | ✅ | Secuencia paso‑a‑paso completa, con acción múltiple para validar el bloqueo. |
| **Resultados esperados** | ✅ | Definidos de forma concreta y medibles. |
| **Historia(s) de usuario vinculada(s)** | ✅ | US5430 referenciada. |
| **Etiquetas** | ✅ | Relevantes para trazabilidad (Cliente, Front‑End, Pruebas Manuales, Responsable). |
| **Formato y legibilidad** | ✅ | Uso de markdown, encabezados y tablas facilita la lectura. |

### 2. Observaciones de mejora (no críticas)

| Área | Observación | Acción recomendada |
|------|-------------|--------------------|
| **Datos de entorno** | No se especifica la versión de la App (p. ej. 4.2.1) ni la versión del SO (Android 13 / iOS 17). | Añadir una línea opcional en “Pre‑requisitos” → *Versión de la APP: X.Y.Z, SO: …* |
| **Criterio de aceptación** | Solo se cubre el inicio de la verificación; no se menciona el retorno del servicio (éxito/fallo). | Considerar crear un **CA‑02** que verifique que, una vez completado, el ítem pasa a “Verificado” o muestra error apropiado. |
| **Métrica de bloqueo** | La descripción indica “no se generan solicitudes duplicadas”, pero no se define cómo se comprobará (p. ej. inspección de logs, captura de tráfico). | Incluir en los pasos de verificación una indicación de *“Revisar el log de la aplicación / tráfico de red para asegurar que solo se envía una petición”*. |
| **Datos de prueba** | No se indica el tipo de vehículo/dispositivo (marca, modelo) que se usará. | Añadir una nota opcional: *Ej.: vehículo “Toyota Prius 2020” con telemetría habilitada*. |
| **Criterio de “deshabilitada”** | Se menciona que la acción permanece deshabilitada, pero no se indica cómo se verifica visualmente (color, opacidad). | Precise: *“Comprobar que el botón se muestra gris y no responde a taps”*. |

> **Nota:** Las observaciones anteriores son *recomendaciones* para reforzar la trazabilidad y la verificabilidad, pero **no impiden la aprobación** del caso tal como está.

### 3. Verdict

Con base en la revisión, el Test Case **cumple con los requisitos de la User Story US5430 y con el plan de pruebas**. Las observaciones señaladas son mejoras opcionales que pueden incorporarse en una versión futura del caso o en casos complementarios (p.ej., CA‑02 para el flujo de respuesta).

**✅ Aprobo la especificación del Test Case 6099 (US5430‑CP01) tal como se presenta.**  

Se sugiere actualizar la documentación con las mejoras indicadas para facilitar la ejecución y el reporte de resultados en entornos de automatización o auditoría.  

---  

*Fin del reporte de revisión.*