---
indice: Herramientas del proyecto
origen: agente-multiproposito
columnas: [Herramienta, Tipo, Qué hace, Cómo se invoca, Estado]
---

# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (`lint-subsistemas`, `lint-semantica`, …) **no** van acá: son infraestructura del Patrón de cada subsistema y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). En estos dos archivos solo van Herramientas.

- **Herramienta** — nombre; si es tipo `script` con carpeta local, link a `<tool>/` (adentro, README + código). Si es `skill` o `MCP`, link a donde vive (`.claude/skills/<skill>/`, `.mcp.json`).
- **Tipo** — `script` | `skill` | `mcp`.
- **Qué hace** — una línea.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

> **Origen del contenido:** las Herramientas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador `amp:actualizar` lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre). Mismo molde que `conducta/INDICE.md` y que los dos archivos de `preferencias/`.

## Herramientas del Agente Multipropósito

Las que instala el Agente Multipropósito. El nivelador reemplaza **este archivo entero**; nunca abre el del Agente Desplegado.

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [actualizar-plugins](actualizar-plugins/) | script | Pone al día los plugins que este Agente con Propósito tiene habilitados en esta máquina —los que le traen su Agente Multipropósito— y detecta los cuatro desfases: el marketplace bajado que no trajo lo publicado, el plugin que falta traer, el silencioso —traído pero no cargado, porque la sesión arrancó antes— y la dependencia que el repo nunca declaró (`SIN DECLARAR`, que deja al plugin que la pide sin cargar y sin señal); marca aparte los plugins `RETIRADO` (nombres que el marketplace dejó de ofrecer ⇒ migración, no actualización). Sin `--aplicar` solo diagnostica; acepta ruta para apuntarlo a otro repo | `node .claude/herramientas/actualizar-plugins/actualizar-plugins.js [--aplicar] [rutaRepo]` | vigente |
| [instalar-plugins-codex](instalar-plugins-codex/) | script | Instala en Codex CLI el bundle `amp` y sus dependencias en orden, porque Codex no las resuelve al agregar un plugin | `node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar` | vigente |
