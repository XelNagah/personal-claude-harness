# Replicar los componentes de Hermes en el AMP con los subsistemas

Diseño del **2026-07-23**. Toma los mecanismos de Hermes Agent (relevados en [proyectos similares al harness](proyectos-similares-al-harness.md)) y los baja a **cómo se instrumentan con los subsistemas del Agente Multipropósito**: qué ya existe, qué falta y qué plan lo cubre. Replicar Hermes no es construir un producto nuevo: es **cablear subsistemas que ya están**. Tampoco hace falta replicar todo — la tabla sirve como lista de qué tiene Hermes que el AMP no.

## Principio rector

La auto-mejora de Hermes **en vivo** no es magia estadística: son **dos piezas simples** — (1) un texto en el prompt de sistema que empuja al agente a guardar lo que aprendió, y (2) una herramienta que escribe ese aprendizaje a un archivo. La minería de sesiones y el entrenamiento corren **en diferido**, en un repo aparte, con una persona aprobando cada cambio: fuera del alcance del AMP y no hace falta.

Consecuencia clave: el AMP tiene una pieza que Hermes **en vivo no** tiene — el subsistema `conducta` con reglas de clase **correr**, donde una Herramienta resuelve el momento **sin juicio del agente**. Donde Hermes solo puede *inyectar* un recordatorio y confiar en que el agente lo siga, el AMP puede *correr* la captura de forma determinística. En vivo, el AMP puede igualar o superar a Hermes.

Regla de traducción:

- La pieza **empuje/observador** de Hermes → una **regla de conducta** (`inyectar` o `correr`) atada a un momento del flujo.
- La pieza **herramienta que escribe** de Hermes → una **skill de registro** del subsistema que corresponda (`registrar-*`, `/contrastar`).
- La pieza **en diferido / entrenamiento** → fuera de alcance.

## Tabla maestra

| Componente Hermes | Mecanismo Hermes | Subsistema(s) del AMP | Estado | Plan que lo cubre |
|---|---|---|---|---|
| **Bucle de auto-mejora** | empuje "guardá una skill tras una tarea compleja" + herramienta que escribe skills | `conducta` (dispara) + `conocimiento`/`decisiones`/… (escribe) vía `/contrastar` | Diseño listo; falta el repartidor del hook `Stop` | *Verificar que el aprendizaje quede asentado* + *Crecer el subsistema conducta* |
| **Memoria — auto-escritura** | el agente agrega/reemplaza/borra en sus archivos de memoria, con chequeo de inyección de prompt antes de escribir | `memoria` + skills `registrar-*` | La escritura existe (a mano); falta el disparo | *Verificar que el aprendizaje quede asentado* (parcial); **auto-escritura sin plan propio** |
| **Memoria — sesiones buscables** | búsqueda de texto completo sobre las conversaciones pasadas guardadas en SQLite | — (no hay subsistema de sesiones) | **Falta, sin plan** | ninguno |
| **Skills — que el agente las escriba solo** | el agente crea y parcha sus propias skills; carga por niveles | skills del harness + `conducta` (empuje) | Las skills existen; la auto-escritura no | *Crecer el subsistema conducta* (empuje); auto-escritura sin plan |
| **Tareas agendadas** | tarea de agente en lenguaje natural, modo sin LLM, corte por seguridad de costo, adjuntar skills | repo `Alertas-Push` (fuera del harness) | Existe base; sin corte por seguridad | **Falta** — vive en `Alertas-Push` |
| **Persona** | `SOUL.md` | `preferencias` (Base/Adaptaciones) | Cubierto | — |
| **Gobernanza terminológica** | *(Hermes no tiene)* | `semantica` + `converger-terminologia` | **AMP adelante** | — (exportar, no importar) |

## Cómo replicar cada componente

### 1. Bucle de auto-mejora — el central

**Hermes:** observa la tarea y, tras repetirla varias veces, el agente decide guardar una skill y la afina con el uso.

**AMP con subsistemas:**

- **El disparo es `conducta`.** El momento *al cerrar tarea* (hook `Stop`) ya está declarado, y la 4.ª regla Base —*registrar en el subsistema cuando algo cambia*— ya está en el registro, hoy en estado `pendiente` porque falta el **hook repartidor de `Stop`**.
- **La escritura es `/contrastar` mirando hacia atrás.** No se construye nada nuevo: detecta lo aprendido y lo rutea al subsistema con ratificación.
- **Dos intensidades:**
  - `al cerrar tarea | inyectar | "registrá lo que cambió"` → el agente lo hace con su juicio (equivalente a Hermes en vivo).
  - `al cerrar tarea | correr | /contrastar hacia atrás` → determinístico, sin depender del juicio (**más fuerte que Hermes en vivo**).

**Nudo real a resolver:** el repartidor de `Stop`. Su recordatorio (`additionalContext`) llega tarde —el turno ya cerró—, forzar la continuación arriesga un bucle infinito, y "algo cambió" roza el juicio (decisión 0021: lo que necesita juicio no es un momento de conducta).

### 2. Memoria — auto-escritura y búsqueda de sesiones

**Hermes:** el agente edita sus archivos de memoria con una herramienta propia (con topes de tamaño y un chequeo de inyección de prompt antes de escribir), y recupera de conversaciones pasadas con búsqueda de texto completo.

**AMP con subsistemas:**

- **Auto-escritura:** la herramienta que escribe ya existe (`registrar-memoria`). Falta el **disparo automático**, que cae de nuevo en `conducta` (el mismo hook `Stop`). Si la escritura pasa a ser automática, el chequeo de inyección de prompt de Hermes es un patrón a copiar.
- **Búsqueda de sesiones:** **no hay equivalente.** El AMP no indexa las conversaciones pasadas. Sería una **Herramienta nueva** (indexar las transcripciones + buscar en ellas), no un subsistema de datos.

### 3. Skills — que el agente las escriba solo

El AMP ya tiene skills como slash y como disparo conversacional, y una carga por niveles equivalente: el índice liviano se carga, el cuerpo se lee al invocar. Lo que Hermes agrega es que **el agente las escribe solo**. En el AMP sería una regla de `conducta` que empuje *"esto que repetiste, ¿va como skill?"* más una skill que redacte skills. Baja prioridad: primero el bucle de conocimiento.

### 4. Tareas agendadas — con las salvaguardas de Hermes

Las tareas agendadas viven en `Alertas-Push`, repo aparte, no en el harness. A copiar cuando se toque ese repo:

- **Corte por seguridad de costo:** congelar el proveedor y el modelo al crear la tarea y **saltar la corrida** si el default global cambió, en vez de gastar en silencio.
- **Modo sin LLM:** para una alerta que es solo un script, cero inferencia.

Hermes además impide que una tarea agendada cree más tareas agendadas, para no encadenar programaciones descontroladas.

### 5. Persona — ya cubierto

`PREFERENCIAS.md` (Base/Adaptaciones) es el equivalente de `SOUL.md`, y separa mejor lo del harness de lo del repo. Sin trabajo pendiente.

## Huecos sin plan (candidatos)

1. **Búsqueda de sesiones pasadas** — Herramienta nueva (indexar + buscar transcripciones). El hueco más grande contra Hermes.
2. **Auto-escritura de memoria** — hoy colgada del mismo hook `Stop` que el bucle; si se separa, necesita criterio propio + chequeo de inyección de prompt.
3. **Corte por seguridad de costo en tareas agendadas** — vive en `Alertas-Push`, no en el harness.
4. **Auto-escritura de skills** — baja prioridad.

## Lo inverso: lo que el AMP tiene y Hermes no

La **gobernanza terminológica** (glosario con alias y vetos ratificados por el usuario, `converger-terminologia`, lint de colisiones) no existe en Hermes. No es algo a replicar: es la ventaja del AMP, y al publicar es el ángulo que lo separa de "otro banco de memoria".

## Qué NO conviene copiar

- **Motor propio** — costo de mantenimiento que el AMP evita a propósito viviendo sobre el harness de Claude Code.
- **Proveedores de memoria excluyentes** (uno solo activo a la vez) — el modelo de subsistemas tipados del AMP es más rico.
- **Entrenamiento de modelo** — fuera de alcance: el AMP no entrena modelos.

## Fuente

Diseño original del agente de mejora de uso, en `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\replicar-hermes-en-amp.md`.
