# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (`lint-subsistemas`, `lint-semantica`, …) **no** van acá: son infraestructura del Patrón de cada subsistema y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). Acá solo van Herramientas del Propósito.

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/` (adentro, README + código). Si es `skill` o `MCP`, link a donde vive (`.claude/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

> **Origen del contenido:** las Herramientas se separan por origen en dos secciones — **Herramientas Base** (las manda el Agente Multipropósito; el nivelador `amp:actualizar` reemplaza esa sección entera al poner al día un Agente con Propósito) y **Herramientas del Propósito** (las suma cada repo; el nivelador no las toca). Mismo molde que `conducta/INDICE.md` y que Base/Adaptaciones en `PREFERENCIAS.md`.

## Herramientas Base

Las que instala el harness (origen **Base**). El nivelador reemplaza **esta sección entera**; nunca abre la de abajo.

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [actualizar-plugins](actualizar-plugins/) | script | Pone al día los plugins que este Agente con Propósito tiene habilitados en esta máquina —los que le traen su Agente Multipropósito— y detecta los cuatro desfases: el marketplace bajado que no trajo lo publicado, el plugin que falta traer, el silencioso —traído pero no cargado, porque la sesión arrancó antes— y la dependencia que el repo nunca declaró (`SIN DECLARAR`, que deja al plugin que la pide sin cargar y sin señal); marca aparte los plugins `RETIRADO` (nombres que el marketplace dejó de ofrecer ⇒ migración, no actualización). Sin `--aplicar` solo diagnostica; acepta ruta para apuntarlo a otro repo | `node .claude/herramientas/actualizar-plugins/actualizar-plugins.js [--aplicar] [rutaRepo]` | vigente |
| [instalar-plugins-codex](instalar-plugins-codex/) | script | Instala en Codex CLI el bundle `amp` y sus dependencias en orden, porque Codex no las resuelve al agregar un plugin | `node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar` | vigente |

## Herramientas del Propósito

Las que este repo suma para su Propósito (origen **aprendido**) — acá, autorar el harness. El nivelador **no toca esta sección**.

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [ejecutar-control-cierre](ejecutar-control-cierre/) | script | Corre todos los chequeos del repo de una pasada (lints de subsistema descubiertos dinámicamente + `claude plugin validate`) y resume verde/hallazgos | `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js` | vigente |
| [lint-harness](lint-harness/) | script | Lint de coherencia del harness: disco↔marketplace↔REGISTRO, texto literal divergente entre plantillas, tamaño y estructura de los MANIFIESTO.md (dec. 0017/0019), citas a decisiones del harness en archivos distribuibles (dec. 0024), terminología vetada en el texto que viaja a cada Agente con Propósito | `node .claude/herramientas/lint-harness/lint-harness.js` | vigente |
| [inventariar-componentes-sueltos](inventariar-componentes-sueltos/) | script | Barre `.claude/` y lista los componentes (archivos y carpetas) que no son subsistema (lint co-ubicado) ni infra conocida; inventaría sin juzgar. Frente B del plan de efecto conductual; acepta ruta para apuntarla a un consumidor | `node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js [rutaRepo]` | vigente |
| [lint-herramientas](lint-herramientas/) | script | Lint de este registro: README por herramienta local, herramienta en índice, filas colgadas, refs por ruta de lint en settings | `node .claude/herramientas/lint-herramientas/lint-herramientas.js` | vigente |
| [propagar-harness](../skills/propagar-harness/) | skill | Propaga un cambio textual al instalador consolidado `amp:inicializar`: subagente fresco para la copia, verificación carácter a carácter de los embebidos, subida de versión | skill `propagar-harness` (el agente la dispara al tocar textos que viajan) | vigente |
| [agregar-funcionalidad](../skills/agregar-funcionalidad/) | skill | Alta completa de una funcionalidad/plugin: carpeta + marketplace + REGISTRO + `amp:inicializar` si aplica, con validación final | skill `agregar-funcionalidad` | vigente |
