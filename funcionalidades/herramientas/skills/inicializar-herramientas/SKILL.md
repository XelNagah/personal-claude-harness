---
name: inicializar-herramientas
description: Instala la gestión de Herramientas del usuario en el repo actual (.claude/herramientas/ con registro tabla INDICE.md de columnas Herramienta|Tipo|Qué hace|Cómo se invoca|Estado + lint + memoria + sección en AGENTS.md). Las Herramientas son las tools del Propósito (script/skill local/MCP local); los lints de subsistema NO son herramientas. Ordena las herramientas desordenadas. Depende de memoria-local. Use when el usuario dice "inicializar herramientas", "gestión de herramientas", "registro de herramientas", "ordená los scripts", "inicializar scripts".
---

# Inicializar gestión de Herramientas

Instala la convención de **Herramientas** del repo: las *tools* que el propósito del repo requiere y el agente invoca para tareas repetibles — tipos `script`, `skill` local, `MCP` local — listadas en un registro-tabla, con un lint. Ordena las herramientas desordenadas — archivos sueltos sin saber qué son ni cómo se usan. Si parte ya existe, **extender sin pisar**.

**Depende de `memoria-local`**: la convención se guarda como memoria. Si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

> **Qué NO entra:** los lints de subsistema (lint-memoria, lint-glosario…) **no** son Herramientas. Son infra del Patrón de cada subsistema y viven con su subsistema (`.claude/<sub>/lint-<sub>/`), instalados por la funcionalidad de ese subsistema. Este registro cataloga solo las tools de dominio que sirven al propósito.

## Estructura objetivo

```
├── AGENTS.md               # (raíz) se le asegura la sección "Herramientas del proyecto"; CLAUDE.md = adaptador
├── .claude/herramientas/
│   ├── INDICE.md           # tabla: Herramienta | Tipo | Qué hace | Cómo se invoca | Estado
│   ├── <tool>/             # una tool tipo script
│   │   ├── README.md       # ficha del tool
│   │   └── ...             # el código
│   └── lint-herramientas/
│       ├── README.md
│       └── lint-herramientas.js
└── memoria/
    └── feedback_herramientas.md
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo `INDICE.md` ni un README de tool.
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo lo que falte.
- **Detectar equivalentes.** Puede haber ya un registro de tools/scripts con otro nombre. Buscar por tema. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar.
- **Reportar al final** en tres grupos: `agregado` / `ya estaba` / `divergente`.

## Concepto de la funcionalidad

- **Herramienta = tool del Propósito.** Tipos: `script`, `skill` local del repo, `MCP` local. Un `script` vive en `.claude/herramientas/<tool>/` con README (nunca suelto); una `skill` en `.claude/skills/<skill>/`; un `MCP` en `.mcp.json` — el registro los indexa donde viven.
- **Registro-tabla** `INDICE.md`: una fila por tool con su `Tipo`, qué hace, cómo se invoca, estado.
- **Los lints de subsistema no son Herramientas** (viven con su subsistema).
- ⚠️ **Refs por ruta:** una tool referenciada por ruta en `settings`, `.gitignore` o un hook NO se mueve/renombra sin actualizar esa referencia — rompe el match por prefijo exacto y se pierde la pre-autorización.

## Migración (ordenar las herramientas desordenadas)

Si el repo ya tiene una carpeta de scripts desordenada (archivos sueltos, sin doc):

- **Agrupar** cada script suelto como una Herramienta tipo `script` en su carpeta `<tool>/` con un `README.md` (qué hace, cómo se invoca; origen solo si se sabe). Si no se sabe qué hace, **marcarlo `Estado: obsoleto`** y reportarlo para que el user decida — no inventar propósito.
- ⚠️ **Antes de mover un script, grep su ruta** en `settings.local.json`/`settings.json`, `.gitignore` y hooks. Si aparece, actualizar la referencia en el mismo paso (o no moverlo). Correr el lint tras mover → 0 refs por ruta rotas.
- Cubrir **todas** las tools en el registro (las no listadas eran el problema).

## Flujo de trabajo

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Asegurar `.claude/herramientas/INDICE.md`** con el contenido inicial de [PLANTILLA.md](PLANTILLA.md) §Índice (encabezado + tabla vacía de 5 columnas). Formato de la ficha por tool en §README-tool.
3. **Instalar el lint** `.claude/herramientas/lint-herramientas/lint-herramientas.js` (contenido EXACTO de PLANTILLA.md §Script) con su propio `README.md`.
4. **Migrar** scripts sueltos existentes a `<tool>/` con README y fila en el registro (ver Migración). Grep de refs por ruta antes de mover.
5. **Asegurar la memoria `feedback_herramientas.md`** (textual de PLANTILLA.md §Memoria) y su línea en `memoria/MEMORIA.md`.
6. **En `AGENTS.md`** (punto de entrada en la raíz, decisión 0010) asegurar la sección **"Herramientas del proyecto"** (PLANTILLA.md §Sección). No reescribir el archivo entero. Si existe el bloque **"Mapa del repo (siempre cargado)"** (de `memoria-local`), asegurar la línea `@.claude/herramientas/INDICE.md` en él.
7. **Reportar** en los tres grupos. Correr el lint (`node .claude/herramientas/lint-herramientas/lint-herramientas.js`). **No hacer commit** salvo pedido explícito.
