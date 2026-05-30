# Análisis Técnico y Propuesta de Integración: Asistente Virtual Operativo (Copiloto) para Hipermaxi

Este documento detalla el análisis de la infraestructura actual del Portal Web de Proveedores de Hipermaxi y la propuesta arquitectónica para la implementación del Copiloto basado en IA, diseñado para el Innova Hack 2026.

---

## 1. Inspección del portal: Tecnologías frontend detectadas

Basado en el análisis de la plataforma actual, el portal de Hipermaxi presenta una arquitectura tradicional donde el backend (ASP.NET) renderiza gran parte de la interfaz. Las tecnologías clave detectadas en la capa del cliente son:

* **Estructura HTML y Renderizado:** Renderizado del lado del servidor (SSR) mediante **ASP.NET (C# / .NET Framework 4.0)**, ejecutándose sobre IIS.
* **Lógica de Interacción (JavaScript):** Dominada fuertemente por **jQuery**. Esto facilita la manipulación directa del DOM, captura de eventos en formularios y animaciones básicas.
* **Componentes Complejos de UI:** Uso de **Wijmo**, una librería especializada para la creación de componentes de datos avanzados (grillas, tablas dinámicas, calendarios) que interactúan con los datos del proveedor.
* **Estilos y Layout:** Basado en **Bootstrap 3.3.7**. Esto define el sistema de grillas, modales, alertas y tipografía actual del portal.
* **Librerías Auxiliares:** Uso de Moment.js para el manejo de fechas y Modernizr para la detección de características del navegador.

---

## 2. Identificación de puntos de integración viable para el widget embebido

Para lograr un "Copiloto" que no solo responda preguntas, sino que actúe de forma proactiva sobre el DOM (resaltando campos faltantes, validando inputs en tiempo real y guiando visualmente al proveedor), se evaluaron las siguientes opciones:

* **iFrame (Descartado):** Aunque ofrece aislamiento seguro, un iFrame restringe severamente el acceso al DOM del documento padre. El copiloto no podría resaltar campos en los formularios nativos de Hipermaxi (como el `SOP-04` de registro de productos) sin complejas implementaciones de `window.postMessage`, lo cual añade latencia y fricción.
* **API REST pura (Insuficiente para UI):** Consumir una API REST desde el cliente es útil para datos estáticos, pero carece de la bidireccionalidad necesaria para que el agente reaccione de forma autónoma y fluida ante los eventos del usuario en tiempo real.
* **Script Tag + WebSockets (Opción Seleccionada):** La integración más viable y potente es inyectar un `<script>` asíncrono en el portal. 
    * Este script montará un Widget UI flotante (el chat).
    * Permitirá la manipulación directa del DOM (aprovechando jQuery existente) para añadir clases CSS (ej. `border: 2px solid red`) a los elementos que la IA identifique como problemáticos.
    * Utilizará WebSockets para mantener una conexión persistente y de baja latencia con el backend del Copiloto, permitiendo una experiencia verdaderamente reactiva e interactiva.

---

## 3. Propuesta preliminar de stack propio para la solución

Para garantizar que la solución sea escalable, segura y no interfiera con el código *legacy* de Hipermaxi, se propone una arquitectura de microservicios desacoplada.

### A. Capa Frontend (El Copiloto / Widget)
* **Tecnología Base:** Vanilla JavaScript o un framework ultraligero (como Preact) empaquetado en un solo bundle (JS/CSS) inyectado vía Script Tag.
* **Comunicación:** **WebSockets** (vía Socket.io o nativo) para transmitir el estado del DOM al servidor y recibir instrucciones de UI (ej. `{"action": "highlight", "target": "#codigo_barra"}`).
* **UI/UX:** Componentes flotantes diseñados para armonizar con Bootstrap 3.3.7, utilizando tooltips dinámicos y modales para las interacciones del "Human-in-the-loop" antes de enviar datos críticos (como los Avisos de Despacho).

### B. Capa Backend (Orquestación y Microservicio)
* **Entorno:** Contenedores **Docker** para asegurar portabilidad y fácil despliegue.
* **Framework:** **Python (FastAPI)**. Ideal para manejar concurrencia, WebSockets y la integración asíncrona con librerías de IA.
* **Infraestructura:** Despliegue orientado a la nube (ej. **Microsoft Azure**), utilizando servicios administrados para garantizar alta disponibilidad y aprovechar capacidades de IA empresarial.

### C. Capa de Inteligencia Artificial (Cerebro del Agente)
* **Modelos de Lenguaje (LLMs):** Uso de modelos eficientes y potentes como **Llama 4, Qwen o Gemma**, optimizados para tareas de razonamiento sobre documentos y generación de JSON estructurado.
* **Recuperación de Información (RAG):** Implementación de una base de datos vectorial para indexar todos los SOPs (Credenciales, AVD, Facturación). El agente recuperará el contexto exacto antes de instruir al frontend.
* **Seguridad y Robustez (Crítico):** Implementación de una capa defensiva estricta para mitigar *prompt injections* y ataques de *jailbreak*. Es imperativo controlar y generar variabilidad en el **Attack Success Rate (ASR)** frente a intentos de manipulación maliciosa, asegurando que el proveedor no pueda engañar al sistema para evadir validaciones comerciales o acceder a información de terceros.
