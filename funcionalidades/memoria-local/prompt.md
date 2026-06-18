# Prompt: inicializar memoria local

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Configura el sistema de memoria local en el directorio nativo de tu harness.

---

Configurá en este proyecto un sistema de **memoria local persistente**, usando el directorio de configuración **nativo de tu harness**:

- Claude Code → `.claude/`
- Codex → `.codex/` (instrucciones en `AGENTS.md`)
- Cursor → `.cursor/` (instrucciones en `.cursor/rules/`)
- Copilot → `.github/` (instrucciones en `.github/copilot-instructions.md`)
- Otro / sin convención → `.agent/`

En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Este prompt es seguro de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el archivo/carpeta destino. Nunca reescribas de cuajo un archivo existente.
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectá equivalentes.** Una sección o memoria puede estar ya con otro título o redacción. Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pises**: reportá la divergencia y preguntame antes de reconciliar.
- **Reportá al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere tu decisión).

## 1. Índice de memoria

Asegurá `<config>/memory/MEMORY.md` — índice con una línea por memoria, formato `- [Título](archivo.md) — resumen corto`. Encabezado: `Cargar al inicio de cada sesión y respetar.` Acá nunca va contenido, solo punteros. Si ya existe, conservá su encabezado y todas sus líneas y agregá solo las entradas que falten — nunca lo reescribas entero.

## 2. Formato de memoria

Cada memoria es un `.md` propio bajo `<config>/memory/` con este frontmatter:

```markdown
---
name: <slug-kebab-case>
description: <resumen de una línea>
metadata:
  type: user | feedback | project | reference
---

<el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
```

Tipos: `user` (quién es el usuario), `feedback` (correcciones y enfoques confirmados, con el porqué), `project` (objetivos/restricciones no derivables del código), `reference` (punteros externos). Antes de crear una memoria nueva, revisá si una existente ya la cubre — actualizá en vez de duplicar. Fechas siempre absolutas.

## 3. Referencia en las instrucciones del proyecto

En el archivo de instrucciones que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.), creá/extendé una sección **"Memoria del proyecto"** con link a `<config>/memory/MEMORY.md`, indicando que la memoria se carga al inicio de cada sesión y se respeta.

## 4. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
