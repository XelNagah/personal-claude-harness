---
name: inicializar-preferencias-trabajo
description: Instala las preferencias del usuario en el repo actual (.claude/preferencias/PREFERENCIAS.md versionada Base/Adaptaciones, importada siempre al contexto). Use when el usuario dice "inicializar preferencias", "agregá mis principios de trabajo", "configurá preferencias de comunicación".
---

# Inicializar preferencias

Instala el sistema de preferencias del usuario: un archivo `.claude/preferencias/PREFERENCIAS.md` con dos secciones — **Base** (del harness, versionada; el leveleo la actualiza) y **Adaptaciones de este repo** (del user; el leveleo nunca la toca) — **importado vía `@` desde el punto de entrada `AGENTS.md`** (decisión 0010), así está en contexto en toda sesión sin depender de que el agente lo busque (las preferencias son reglas de conducta: inline, no índice+fetch). Textos en [PLANTILLA.md](PLANTILLA.md).

Por qué por-repo y no global de máquina: el user trabaja en varias computadoras y sincroniza por git — el repo es su unidad de sincronización. La duplicación entre repos es deliberada; el versionado de la Base la vuelve actualizable.

## Estructura objetivo

```
├── AGENTS.md              # punto de entrada (fuente única): "Descripción del proyecto" + sección "Preferencias (siempre cargadas)" con el @import + el lint
├── CLAUDE.md              # adaptador para Claude Code: @AGENTS.md
└── .claude/
    └── preferencias/
        ├── PREFERENCIAS.md    # Base (harness vN) + Adaptaciones de este repo
        └── lint-preferencias/
            └── lint-preferencias.js   # lint estructural (sin LLM, sin red)
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas generales: inspeccionar antes de escribir; crear solo lo ausente; detectar equivalentes por tema; reportar en tres baldes (`agregado` / `ya estaba` / `divergente`). Reglas específicas de esta funcionalidad:

- **Base con versión vieja** (`## Base (harness vM)` con M < versión de PLANTILLA): reemplazar la sección Base completa por la actual. No es divergencia — reportar como actualización.
- **Base editada a mano** (no coincide verbatim con ninguna versión conocida): mover las líneas ajenas a **Adaptaciones** y reinstalar la Base limpia; reportar el movimiento.
- **Adaptaciones**: nunca tocarlas.

## Migración desde los esquemas viejos

**CLAUDE.md como fuente** (esquema previo a 0010) — si el repo tiene un `CLAUDE.md` con contenido (en la raíz o en `.claude/`) y no tiene `AGENTS.md`: mover el contenido a `AGENTS.md` en la raíz (reescribiendo los `@imports` con prefijo `.claude/`), dejar `CLAUDE.md` en la raíz como adaptador (`@AGENTS.md`), y eliminar el `.claude/CLAUDE.md` residual si lo hubiera (genera doble carga). Reportar. Si el contenido difiere de lo que el harness instala, no pisar: migrar tal cual y marcar `divergente`.

**Bloques inline** — si el punto de entrada tiene las secciones "Preferencias de comunicación" y/o "Principios de trabajo":

1. Comparar contra PLANTILLA §Bases anteriores. Verbatim iguales → eliminarlas del punto de entrada y reemplazar por el import (sin preguntar; reportar). Con diferencias → las diferencias van a **Adaptaciones** de PREFERENCIAS.md; reportar qué se movió.
2. Crear `PREFERENCIAS.md` con la Base actual + las Adaptaciones detectadas.

## Workflow

1. **Asegurar el punto de entrada** (decisión 0010): `AGENTS.md` en la raíz + `CLAUDE.md` adaptador (`@AGENTS.md`). Si hay un CLAUDE.md con contenido, primero la migración de arriba. Si no existe ninguno, arrancar `AGENTS.md` con **"Descripción del proyecto"** (1 a 3 párrafos inferidos del repo; si está vacío o es ambiguo, **preguntar** — no inventar). Si `AGENTS.md` ya existe, no reescribirlo.
2. **Migración** (sección anterior) si hay bloques viejos.
3. **Asegurar `preferencias/PREFERENCIAS.md`** (semilla de PLANTILLA §Semilla, con la reconciliación de versiones de arriba). La Base incluye el bullet de **Terminología** (gate duro en glosario/decisiones: nada acuñado por el agente se asienta sin ratificación).
4. **Instalar el lint** `.claude/preferencias/lint-preferencias/lint-preferencias.js` con el contenido EXACTO de [PLANTILLA.md](PLANTILLA.md) §Script. Va en **su propia carpeta** co-ubicado con el subsistema (`.claude/preferencias/lint-preferencias/`), nunca suelto. Es un script Node sin dependencias ni red que chequea (estructural, no semántico): que `PREFERENCIAS.md` tenga las secciones `## Base` y `## Adaptaciones` y no esté vacío, y que el punto de entrada (`AGENTS.md`, o `CLAUDE.md` en layouts legacy) lo importe.
5. **Asegurar en AGENTS.md la sección "Preferencias (siempre cargadas)"** con el `@import` (`@.claude/preferencias/PREFERENCIAS.md`) **y el paso de lint** al tocar las preferencias (PLANTILLA §Sección). Si existe una sección equivalente sin el paso de lint, agregárselo.
6. **Reportar** en los tres baldes. Correr el lint (`node .claude/preferencias/lint-preferencias/lint-preferencias.js`) → debe dar limpio. **No hacer commit** salvo pedido explícito.
