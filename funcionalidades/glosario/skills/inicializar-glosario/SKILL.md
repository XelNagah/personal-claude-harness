---
name: inicializar-glosario
description: Instala el glosario del dominio del usuario en el repo actual (.claude/glosario/INDICE.md tabla + páginas de detalle + lint + memoria + sección en AGENTS.md). Conceptos con términos por estado (alias, propuestos, vetados); el agente solo propone, el usuario ratifica y veta; detalle propio para lo complejo. Depende de memoria-local. Use when el usuario dice "inicializar glosario", "armá el glosario", "glosario del dominio".
---

# Inicializar glosario del dominio

Instala un glosario del dominio: una **tabla** de conceptos (nombre canónico, definición, y sus **términos por estado**: alias, propuestos, vetados) donde los conceptos complejos apuntan a una **página de detalle** propia. Se consulta al planificar/analizar para mantener coherencia semántica. Si parte ya existe, **extender sin pisar**.

**Depende de `memoria-local`**: la convención se guarda como memoria. Si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

## Estructura objetivo

```
├── AGENTS.md          # (raíz) línea @.claude/glosario/MANIFIESTO.md en la sección "Subsistemas"; CLAUDE.md = adaptador
├── .claude/glosario/
│   ├── MANIFIESTO.md  # manifiesto de subsistema (siempre en contexto; NO importa índice — a demanda)
│   ├── INDICE.md    # tabla: Concepto | Definición | Alias | Propuestos | Vetados | Detalle
│   ├── <nombre>.md    # página de detalle, solo para conceptos complejos
│   └── lint-glosario/
│       └── lint-glosario.js
└── memoria/
    └── feedback_glosario.md
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo `INDICE.md` ni una página de detalle (pueden tener conceptos cargados).
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo lo que falte.
- **Detectar equivalentes.** Puede haber ya un glosario con otro nombre (un `CONTEXT.md`, un `glosario.md` suelto). Buscar por tema. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar si migrar.
- **Reportar al final** en tres grupos: `agregado` / `ya estaba` / `divergente`.

## Concepto de la funcionalidad

- **Términos por estado (un solo eje).** Cada concepto tiene un nombre canónico y sus términos repartidos en tres columnas: `Alias` (formas válidas, ratificadas, para mapear "birra/chela = cerveza"), `Propuestos` (sugeridos por el agente, sin usar hasta ratificar) y `Vetados` (prohibidos; el reemplazo es el canónico de la propia fila). Los alias válidos se **registran**; los términos confusos o ajenos se **vetan**. El lint caza colisiones de alias, contradicciones (alias en una fila y vetado en otra) y apariciones de vetados en el texto vivo.
- **El agente propone; el usuario ratifica y veta (decisión 0004).** El agente **nunca** escribe en `Alias` ni en `Vetados`: solo *propone* en `Propuestos`. Ratificar y vetar son potestad del usuario. El agente **nunca usa** un término que esté en `Propuestos` o en `Vetados`, ni en texto plano, memorias, planes o código. Preferir las palabras del usuario a acuñar nuevas — el glosario es un registro canónico y tiene control duro (ver preferencia de terminología).
- **Detalle bajo demanda.** Concepto simple → una fila, columna Detalle en `—`. Concepto complejo (fórmulas, ejemplos, contraejemplos, o el mapa de reemplazos de un vetado) → su fila apunta a una página `<nombre>.md` en la misma carpeta.

## Flujo de trabajo

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Asegurar `.claude/glosario/INDICE.md`** con el contenido inicial de [PLANTILLA.md](PLANTILLA.md) §Glosario (encabezado + tabla vacía). Si ya existe un glosario equivalente (ej. un `CONTEXT.md` en la raíz), **no duplicar**: reportar `divergente` y preguntar si migrar su contenido a la tabla.
3. **Instalar el lint** `.claude/glosario/lint-glosario/lint-glosario.js` con el contenido EXACTO de PLANTILLA.md §Script.
4. **Asegurar la memoria `feedback_glosario.md`** (textual de PLANTILLA.md §Memoria) y su línea en `memoria/MEMORIA.md`. Equivalente presente → no duplicar; difiere → reportar.
5. **En `AGENTS.md`** (punto de entrada en la raíz, decisión 0010; si falta, crearlo con el adaptador `CLAUDE.md` = `@AGENTS.md` como indica `inicializar-preferencias-trabajo`) cablear el subsistema por su **manifiesto** (decisiones 0017/0019):
   - **Crear `.claude/glosario/MANIFIESTO.md`** con el contenido de [PLANTILLA.md](PLANTILLA.md) §Manifiesto — va **siempre en contexto**; **no** importa el índice (se consulta al planificar/analizar), así que **no lleva línea `@…` final**.
   - **Asegurar la sección `## Subsistemas`** (PLANTILLA §Subsistemas; la crea `memoria-local`, o crearla si falta) y, dentro, la línea `@.claude/glosario/MANIFIESTO.md`.
   - **Migración (modelo viejo).** Si AGENTS.md ya tenía una sección de prosa "Glosario del proyecto", el manifiesto la reemplaza: quitarla. No reescribir el archivo entero.
6. **Reportar** en los tres grupos. Correr el lint (`node .claude/glosario/lint-glosario/lint-glosario.js`) → debe dar limpio sobre el glosario vacío. **No hacer commit** salvo pedido explícito.
