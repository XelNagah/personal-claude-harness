---
indice: Herramientas del proyecto
origen: agente-multiproposito
columnas: [Código, Nombre, Descripción, Tipo, Cómo se invoca, Estado, Detalle]
descripcion: qué hace la Herramienta, en una línea
---

# Herramientas del proyecto

Registro de las **Herramientas** del repo: la maquinaria con que se construye y se mantiene el Producto, que no es parte del Producto. La invoca el agente, o la invoca otro mecanismo del repo — quién la llama no cambia lo que es. Tipos: `script`, `skill` local del repo, `MCP` local, `funcion`. Una fila por Herramienta. Ordena las herramientas desordenadas: qué es cada una, cómo se invoca, si sigue vigente.

> Los **lints de subsistema** (`lint-subsistemas`, `lint-semantica`, …) y los **hooks** hoy **no** van acá: vienen con su subsistema por el Patrón (`.claude/<sub>/lint-<sub>/`) y pueden quedar así. Es una ubicación, no una negación de que sean maquinaria.

- **Código** — `Base-NNNN` o `Local-NNNN` según el origen. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el nombre de la Herramienta.
- **Descripción** — qué hace, en una línea.
- **Tipo** — `script` | `skill` | `mcp` | `funcion`.
- **Cómo se invoca** — el comando (`script`), el nombre de skill que dispara el modelo (`skill`), cómo se conecta y qué tool-calls expone (`mcp`), o el `require` con que otro código la toma (`funcion`).
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).
- **Detalle** — dónde vive: la carpeta local de la tool (adentro, README + código), `.claude/skills/<skill>/` o `.mcp.json`.

> **Origen del contenido:** las Herramientas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador `amp:actualizar` lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre). Mismo molde que `conducta/INDICE.md` y que los dos archivos de `preferencias/`.

## Herramientas del Agente Multipropósito

Las que instala el Agente Multipropósito. El nivelador reemplaza **este archivo entero**; nunca abre el del Agente Desplegado.

| Código | Nombre | Descripción | Tipo | Cómo se invoca | Estado | Detalle |
|--------|--------|-------------|------|----------------|--------|---------|
| Base-0001 | actualizar-plugins | Pone al día los plugins que este Agente con Propósito tiene habilitados en esta máquina y diagnostica los desfases entre lo publicado, lo traído y lo que la sesión efectivamente corre —incluidos los `RETIRADO`, que son migración y no actualización, y el cache huérfano, que nada más limpia y que solo borra con su propio flag—. Compara también las dos partes del Agente Multipropósito entre sí. Sin `--aplicar` solo diagnostica; `--avisar` la corre en segundo plano y deja el desfase en el Buzón de Avisos Generales, en vez de imprimirlo; acepta ruta para apuntarlo a otro repo | script | `node .claude/herramientas/actualizar-plugins/actualizar-plugins.js [--aplicar] [--limpiar-cache] [--avisar] [rutaRepo]` | vigente | [actualizar-plugins/](actualizar-plugins/) |
| Base-0002 | instalar-plugins-codex | Instala en Codex CLI el bundle `amp` y sus dependencias en orden, porque Codex no las resuelve al agregar un plugin. Para arrancar un repo que todavía no la tiene, se corre la copia del marketplace bajado | script | `node .claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar` | vigente | [instalar-plugins-codex/](instalar-plugins-codex/) |
| Base-0003 | frontmatter | Lee el frontmatter de un `.md`. Única copia del repo: la usan los lints de subsistema, los hooks, las Herramientas y el nivelador que viaja en el plugin | funcion | `require('../../common/frontmatter.js')` | vigente | [../common/frontmatter.js](../common/frontmatter.js) |
| Base-0004 | indices | Descubre los Índices de Subsistema por el frontmatter que los declara (`indice`, `origen`, `columnas`) y controla su forma. Única copia del repo: la usan los ocho lints de subsistema | funcion | `require('../../common/indices.js')` | vigente | [../common/indices.js](../common/indices.js) |
