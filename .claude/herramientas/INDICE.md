---
indice: Herramientas del proyecto
origen: agente-multiproposito
columnas: [Código, Nombre, Descripción, Tipo, Cómo se invoca, Estado, Detalle]
descripcion: qué hace la Herramienta, en una línea
---

# Herramientas del proyecto

Registro de las **Herramientas** del repo: las *tools* que el **Propósito** del repo requiere y el agente invoca para tareas repetibles. Tipos: `script`, `skill` local del repo, `MCP` local. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (`lint-subsistemas`, `lint-semantica`, …) **no** van acá: son infraestructura del Patrón de cada subsistema y viven con su subsistema (`.claude/<sub>/lint-<sub>/`). En estos dos archivos solo van Herramientas.

- **Código** — `Base-NNNN` o `Local-NNNN` según el origen. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el nombre de la Herramienta.
- **Descripción** — qué hace, en una línea.
- **Tipo** — `script` | `skill` | `mcp`.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), o cómo se conecta y qué tool-calls expone (`mcp`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).
- **Detalle** — dónde vive: la carpeta local de la tool (adentro, README + código), `.claude/skills/<skill>/` o `.mcp.json`.

> **Origen del contenido:** las Herramientas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador `amp:actualizar` lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre). Mismo molde que `conducta/INDICE.md` y que los dos archivos de `preferencias/`.

## Herramientas del Agente Multipropósito

Las que instala el Agente Multipropósito. El nivelador reemplaza **este archivo entero**; nunca abre el del Agente Desplegado.

| Código | Nombre | Descripción | Tipo | Cómo se invoca | Estado | Detalle |
|--------|--------|-------------|------|----------------|--------|---------|
| Base-0001 | actualizar-plugins | Pone al día los plugins que este Agente con Propósito tiene habilitados en esta máquina —los que le traen su Agente Multipropósito— y detecta los cuatro desfases: el marketplace bajado que no trajo lo publicado, el plugin que falta traer, el silencioso —traído pero no cargado, porque la sesión arrancó antes— y la dependencia que el repo nunca declaró (`SIN DECLARAR`, que deja al plugin que la pide sin cargar y sin señal); marca aparte los plugins `RETIRADO` (nombres que el marketplace dejó de ofrecer ⇒ migración, no actualización). Compara además **las dos partes del Agente Multipropósito entre sí**: los archivos que hay en el repo contra los que instalaría el plugin que efectivamente corre, porque cada parte viaja por su camino y puede estar al día por su cuenta sin coincidir con la otra. Informa además el **cache huérfano** —las carpetas de versión que ningún repo de la máquina usa, separando los nombres retirados de las versiones viejas de plugins vigentes—, que nada limpia y crece con cada publicación; no las borra ni con `--aplicar`, porque están afuera del repo. Sin `--aplicar` solo diagnostica; acepta ruta para apuntarlo a otro repo | script | `node .claude/herramientas/actualizar-plugins/actualizar-plugins.js [--aplicar] [rutaRepo]` | vigente | [actualizar-plugins/](actualizar-plugins/) |
| Base-0002 | instalar-plugins-codex | Instala en Codex CLI el bundle `amp` y sus dependencias en orden, porque Codex no las resuelve al agregar un plugin | script | `node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar` | vigente | [instalar-plugins-codex/](instalar-plugins-codex/) |
