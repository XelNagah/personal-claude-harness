---
name: inicializar-estilo-commits
description: Instala la preferencia de estilo de commits del usuario como memoria (.claude/memoria/feedback_estilo_commits.md) — commits en español, sin co-autoría de IA. Depende de memoria-local. Use when el usuario dice "inicializar estilo de commits", "commits en español", "sin co-autoría".
---

# Inicializar estilo de commits

Instala como memoria de feedback la preferencia de commits y PRs del usuario.

**Depende de `memoria-local`**: si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero `memoria/MEMORIA.md` y los `.md` existentes. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo la entrada de índice faltante.
- **Detectar equivalentes.** La preferencia de commits puede estar ya como otra memoria (mismo tema, otro `name`). Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres grupos: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Flujo de trabajo

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Asegurar `feedback_estilo_commits.md`** (texto **textual** de [PLANTILLA.md](PLANTILLA.md)) y su línea en `memoria/MEMORIA.md`. Si ya existe esa memoria o una equivalente: no duplicar; si difiere, reportar como `divergente` y preguntar.
3. **Reportar** en los tres grupos (`agregado` / `ya estaba` / `divergente`). **No hacer commit** salvo pedido explícito.
