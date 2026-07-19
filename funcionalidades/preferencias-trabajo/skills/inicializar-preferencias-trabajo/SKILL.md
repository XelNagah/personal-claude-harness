---
name: inicializar-preferencias-trabajo
description: Instala las preferencias del usuario en el repo actual (.claude/preferencias/PREFERENCIAS.md versionada Base/Adaptaciones, importada siempre al contexto). Use when el usuario dice "inicializar preferencias", "agregá mis principios de trabajo", "configurá preferencias de comunicación".
---

# Inicializar preferencias

Instala el sistema de preferencias del usuario: un archivo `.claude/preferencias/PREFERENCIAS.md` con dos secciones — **Base** (del harness, versionada; el leveleo la actualiza) y **Adaptaciones de este repo** (del user; el leveleo nunca la toca) — **importado vía `@` desde CLAUDE.md**, así está en contexto en toda sesión sin depender de que el agente lo busque (las preferencias son reglas de conducta: inline, no índice+fetch). Textos en [PLANTILLA.md](PLANTILLA.md).

Por qué por-repo y no global de máquina: el user trabaja en varias computadoras y sincroniza por git — el repo es su unidad de sincronización. La duplicación entre repos es deliberada; el versionado de la Base la vuelve actualizable.

## Estructura objetivo

```
.claude/
├── CLAUDE.md              # sección "Preferencias (siempre cargadas)" con el @import + el lint + "Descripción del proyecto"
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

## Migración desde el esquema viejo (bloques inline en CLAUDE.md)

Si CLAUDE.md tiene las secciones "Preferencias de comunicación" y/o "Principios de trabajo":

1. Comparar contra PLANTILLA §Bases anteriores. Verbatim iguales → eliminarlas de CLAUDE.md y reemplazar por el import (sin preguntar; reportar). Con diferencias → las diferencias van a **Adaptaciones** de PREFERENCIAS.md; reportar qué se movió.
2. Crear `PREFERENCIAS.md` con la Base actual + las Adaptaciones detectadas.

## Workflow

1. **Asegurar `.claude/CLAUDE.md`.** Si no existe, arrancarlo con **"Descripción del proyecto"** (1 a 3 párrafos inferidos del repo; si está vacío o es ambiguo, **preguntar** — no inventar). Si existe, no reescribirlo.
2. **Migración** (sección anterior) si hay bloques viejos.
3. **Asegurar `preferencias/PREFERENCIAS.md`** (semilla de PLANTILLA §Semilla, con la reconciliación de versiones de arriba). La Base incluye el bullet de **Terminología** (gate duro en glosario/decisiones: nada acuñado por el agente se asienta sin ratificación).
4. **Instalar el lint** `.claude/preferencias/lint-preferencias/lint-preferencias.js` con el contenido EXACTO de [PLANTILLA.md](PLANTILLA.md) §Script. Va en **su propia carpeta** co-ubicado con el subsistema (`.claude/preferencias/lint-preferencias/`), nunca suelto. Es un script Node sin dependencias ni red que chequea (estructural, no semántico): que `PREFERENCIAS.md` tenga las secciones `## Base` y `## Adaptaciones` y no esté vacío, y que `CLAUDE.md` lo importe con `@preferencias/PREFERENCIAS.md`.
5. **Asegurar en CLAUDE.md la sección "Preferencias (siempre cargadas)"** con el `@import` **y el paso de lint** al tocar las preferencias (PLANTILLA §Sección). Si existe una sección equivalente sin el paso de lint, agregárselo.
6. **Reportar** en los tres baldes. Correr el lint (`node .claude/preferencias/lint-preferencias/lint-preferencias.js`) → debe dar limpio. **No hacer commit** salvo pedido explícito.
