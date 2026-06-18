---
name: inicializar-preferencias-trabajo
description: Instala las preferencias de comunicación y los principios de trabajo del usuario en el CLAUDE.md del repo actual. Use when el usuario dice "inicializar preferencias", "agregá mis principios de trabajo", "configurá preferencias de comunicación".
---

# Inicializar preferencias de trabajo

Escribe en `.claude/CLAUDE.md` las preferencias de comunicación y los principios de trabajo del usuario.

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero `.claude/CLAUDE.md`. Nunca reescribirlo de cuajo.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente las secciones que falten, preservando el resto tal cual.
- **Detectar equivalentes.** Una sección puede estar ya con otro título o redacción. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Workflow

1. **Asegurar `.claude/CLAUDE.md`.** Si no existe, arrancarlo con un encabezado **"Descripción del proyecto"** (1 a 3 párrafos inferidos del repo; si el repo está vacío o es ambiguo, **preguntar** — no inventar). Si existe, dejarlo intacto y solo agregar abajo las secciones que falten.
2. **Agregar sección "Preferencias de comunicación"** (si no hay una equivalente) con este literal:
   > Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
3. **Agregar sección "Principios de trabajo"** (si no hay una equivalente):
   - Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
   - Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
   - Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
   - Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
4. **Reportar** en los tres baldes (`agregado` / `ya estaba` / `divergente`). **No hacer commit** salvo pedido explícito.
