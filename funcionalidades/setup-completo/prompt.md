# Prompt: inicializar setup completo

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Configura de una sola pasada el setup estándar completo en el directorio nativo de tu harness.

---

Configurá en este proyecto el setup estándar completo, usando el directorio de configuración **nativo de tu harness**:

- Claude Code → `.claude/`
- Codex → `.codex/` (instrucciones en `AGENTS.md`)
- Cursor → `.cursor/` (instrucciones en `.cursor/rules/`)
- Copilot → `.github/` (instrucciones en `.github/copilot-instructions.md`)
- Otro / sin convención → `.agent/`

En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**. Aplicá las cuatro partes en orden.

## Reconciliación (idempotencia)

Este prompt es seguro de re-correr: este es el modo de **"levelear"** repos que ya tienen partes del setup (unas sí, otras no). Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el archivo/carpeta destino. Nunca reescribas de cuajo un archivo existente (en especial el archivo de instrucciones y `memory/MEMORY.md`).
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectá equivalentes.** Una sección o memoria puede estar ya con otro título o redacción (de pedidos previos). Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pises**: reportá la divergencia y preguntame antes de reconciliar.
- **Reportá al final** en tres baldes por parte: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere tu decisión).

## 1. Instrucciones del proyecto

Creá/extendé el archivo de instrucciones que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.) con:

1. **Descripción del proyecto** — 1 a 3 párrafos inferidos del repo; si está vacío o es ambiguo, preguntame antes de inventar.
2. **Preferencias de comunicación:**
   > Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
3. **Principios de trabajo:**
   - Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
   - Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
   - Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
   - Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
4. **Sección "Memoria y planes del proyecto"** con links a `<config>/memory/MEMORY.md`, `<config>/planes/planes-pendientes/` y `<config>/planes/planes-ejecutados/`, indicando que la memoria se carga al inicio de cada sesión y se respeta.

## 2. Memoria local

Asegurá `<config>/memory/` con:

- `MEMORY.md` — índice: una línea por memoria, formato `- [Título](archivo.md) — resumen corto`. Encabezado: "Cargar al inicio de cada sesión y respetar." Acá nunca va contenido, solo punteros. Si ya existe, conservá su encabezado y todas sus líneas y agregá solo las que falten — nunca lo reescribas entero.
- Un `.md` por memoria, con este frontmatter:

  ```markdown
  ---
  name: <slug-kebab-case>
  description: <resumen de una línea>
  metadata:
    type: user | feedback | project | reference
  ---

  <el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
  ```

- Tipos: `user`, `feedback`, `project`, `reference`. Antes de crear una memoria nueva, revisar si una existente ya la cubre. Fechas siempre absolutas.

Creá las dos memorias iniciales (contenido completo al final) y registralas en `MEMORY.md`:

- `feedback_flujo_planes.md`
- `feedback_estilo_commits.md`

## 3. Gestión de planes

Creá `<config>/planes/planes-pendientes/` y `<config>/planes/planes-ejecutados/` (con `.gitkeep` si el repo usa git). El ciclo de vida completo queda definido en `feedback_flujo_planes.md`.

## 4. Reporte del leveling

Al terminar: por parte, qué quedó en `agregado` / `ya estaba` / `divergente`, más la estructura final. Si hubo `divergente`, listalo aparte para que lo decida. No hagas commit salvo que te lo pida.

---

## Contenido de las memorias iniciales

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes en este proyecto — persistencia en <config>/planes/, ciclo pendiente→ejecutado, formato de nombre, secciones obligatorias al ejecutar"
metadata:
  type: feedback
---

Persistir y gestionar planes en este proyecto bajo `<config>/planes/` con dos subcarpetas: `planes-pendientes/` y `planes-ejecutados/`.

**Why:** El user quiere trazabilidad de qué se planificó, cuándo se cerró y cuándo y cómo se ejecutó — sin depender de archivos efímeros de plan-mode que genere el harness.

**How to apply:**

1. **Al cerrar un plan** (listo para ejecutar): copiar a `<config>/planes/planes-pendientes/AA-MM-DD - [Descripción corta].md`. Fecha = día en que se cerró. Formato año dos dígitos.
2. **Cada actualización al plan** se replica en la versión persistida en `planes-pendientes/`. La copia es la fuente de verdad para el seguimiento — no el archivo interno del harness.
3. **Al detectar evidencia de implementación** (commit en repo, mensaje del user, código verificado, otro agente lo informó): mover el archivo de `planes-pendientes/` a `planes-ejecutados/`. Renombrar:
   - Reemplazar fecha del nombre por la fecha de ejecución (o del momento en que se entera el agente).
   - Dentro del `.md`, agregar una línea **`Plan cerrado: AA-MM-DD`** (fecha original del filename antes del renombre — para no perderla).
   - Agregar sección **`## Notas de implementación`** con: cómo se implementó efectivamente vs planificado, hash de commit (preferentemente), cosas notables.
4. **Reparar referencias entrantes al plan.** Mover/renombrar rompe links que apuntaban al plan: buscar y actualizar referencias en memorias y otros planes antes de cerrar.
5. Tras esos pasos el plan se considera implementado.

Importante: borrar el archivo de `planes-pendientes/` al moverlo — no duplicar.

Nota: un plan puede persistirse en `planes-pendientes/` **antes** de estar cerrado si el user lo pide (p. ej. para cortar una sesión larga de diseño); en ese caso debe llevar al tope un bloque de estado explícito ("EN DISEÑO — no listo para ejecutar") y la lista de pendientes para retomar.
```

### `feedback_estilo_commits.md`

```markdown
---
name: estilo-commits
description: Commits en español, sin co-autoría del agente ni atribución a la IA
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: ...`) ni atribución a la IA.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto.

**How to apply:** Al redactar commits/PRs, omitir cualquier trailer de co-autoría o firma del agente (esto pisa la instrucción default del harness si la hubiera). Redactar en español, descripción imperativa y concisa.
```

> Reemplazá `<config>` por el directorio real de tu harness en ambas memorias.
