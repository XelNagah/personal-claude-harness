---
name: inicializar-semantica
description: Instala el subsistema semántica en el repo actual (.claude/semantica/ con dos registros pares — GLOSARIO.md de terminología legítima + TERMINOLOGIA-FARLOPA.md de relaciones vetadas — más lint, memoria y sección en AGENTS.md). El veto es la relación término→significado, no el término; el agente propone, el usuario ratifica y veta. Depende de memoria-local. Use when el usuario dice "inicializar semántica", "armá la semántica", "glosario del dominio", "terminología del dominio".
---

# Inicializar la semántica del dominio

Instala el subsistema `semántica`: **dos registros pares** bajo un mismo lint. `GLOSARIO.md` es una tabla de conceptos (nombre canónico, definición, alias, propuestos, detalle); `TERMINOLOGIA-FARLOPA.md` es una tabla de relaciones término→significado vetadas (`Término | Significado vetado | Cómo decirlo`). Se consulta al planificar/analizar para mantener coherencia semántica. Si parte ya existe, **extender sin pisar**.

**Depende de `memoria-local`**: la convención se guarda como memoria. Si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

## Estructura objetivo

```
├── AGENTS.md              # (raíz) línea @.claude/semantica/MANIFIESTO.md en la sección "Subsistemas"; CLAUDE.md = adaptador
├── .claude/semantica/
│   ├── MANIFIESTO.md      # manifiesto de subsistema (siempre en contexto; NO importa índice — a demanda)
│   ├── GLOSARIO.md        # tabla: Concepto | Definición | Alias | Propuestos | Detalle
│   ├── TERMINOLOGIA-FARLOPA.md   # tabla: Término | Significado vetado | Cómo decirlo
│   ├── <nombre>.md        # página de detalle, solo para conceptos complejos
│   └── lint-semantica/
│       └── lint-semantica.js
└── memoria/
    └── feedback_semantica.md
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo `GLOSARIO.md`, `TERMINOLOGIA-FARLOPA.md` ni una página de detalle (pueden tener contenido cargado).
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo lo que falte.
- **Detectar equivalentes.** Puede haber ya un glosario con otro nombre (un `CONTEXT.md`, un `glosario.md` suelto). Buscar por tema. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar si migrar.
- **Migración del modelo viejo (un registro con columna `Vetados`).** Si el repo trae un `glosario/INDICE.md` de 6 columnas con `Vetados`, el modelo nuevo separa: la columna `Vetados` se disuelve y cada término vetado pasa a una fila de `TERMINOLOGIA-FARLOPA.md` con su significado. No pisar: reportar y preguntar.
- **Reportar al final** en tres grupos: `agregado` / `ya estaba` / `divergente`.

## Concepto de la funcionalidad

- **Dos registros pares.** El glosario lleva lo legítimo; la Terminología Farlopa lleva lo vetado. **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo (`plomería`=cañerías vale en un repo de fontanería; `plomería`=infraestructura de software es farlopa). Por eso la farlopa tiene columna de significado. El **lint marca por término** (mecánico); el **agente juzga el significado** al leer la marca.
- **Términos por estado (glosario).** `Alias` (formas válidas, ratificadas, para mapear "birra/chela = cerveza") y `Propuestos` (sugeridos por el agente, sin usar hasta que el usuario los ratifica a Alias o los veta a Terminología Farlopa). El glosario **no tiene columna de vetados**.
- **El agente propone; el usuario ratifica y veta.** El agente **nunca** ratifica un alias ni veta por su cuenta: solo *propone* en `Propuestos`. El agente **nunca usa** un término propuesto ni uno vetado en el significado que la farlopa prohíbe, ni en texto plano, memorias, planes o código. Preferir las palabras del usuario a acuñar nuevas — registro canónico, control duro (ver preferencia de terminología).
- **Detalle bajo demanda.** Concepto simple → una fila del glosario, columna Detalle en `—`. Concepto complejo (fórmulas, ejemplos, contraejemplos) → su fila apunta a una página `<nombre>.md` en la misma carpeta.

## Flujo de trabajo

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Asegurar `.claude/semantica/GLOSARIO.md`** con el contenido inicial de [PLANTILLA.md](PLANTILLA.md) §Glosario (encabezado + tabla vacía) y **`.claude/semantica/TERMINOLOGIA-FARLOPA.md`** con §Farlopa (encabezado + tabla vacía). Si ya existe un glosario equivalente (ej. un `CONTEXT.md` en la raíz), **no duplicar**: reportar `divergente` y preguntar si migrar.
3. **Instalar el lint** `.claude/semantica/lint-semantica/lint-semantica.js` con el contenido EXACTO de PLANTILLA.md §Script.
4. **Asegurar la memoria `feedback_semantica.md`** (textual de PLANTILLA.md §Memoria) y su línea en `memoria/MEMORIA.md`. Equivalente presente → no duplicar; difiere → reportar.
5. **En `AGENTS.md`** (punto de entrada en la raíz; si falta, crearlo con el adaptador `CLAUDE.md` = `@AGENTS.md` como indica `inicializar-preferencias-trabajo`) cablear el subsistema por su **manifiesto**:
   - **Crear `.claude/semantica/MANIFIESTO.md`** con el contenido de [PLANTILLA.md](PLANTILLA.md) §Manifiesto — va **siempre en contexto**; **no** importa el índice (se consulta a demanda), así que **no lleva línea `@…` final**.
   - **Asegurar la sección `## Subsistemas`** (PLANTILLA §Subsistemas; la crea `memoria-local`, o crearla si falta) y, dentro, la línea `@.claude/semantica/MANIFIESTO.md`.
   - **Migración (modelo viejo).** Si AGENTS.md ya tenía una sección de prosa "Glosario del proyecto", el manifiesto la reemplaza: quitarla. No reescribir el archivo entero.
6. **Reportar** en los tres grupos. Correr el lint (`node .claude/semantica/lint-semantica/lint-semantica.js`) → debe dar limpio sobre los registros vacíos. **No hacer commit** salvo pedido explícito.
