# Estructura del documento de Plan

**Estado: Nuevo · Creado 26-07-19.** Tenemos un sistema completo para **administrar** planes (ciclo, estados, carpetas, registro `PLANES.md`, lint, hook de sesión) pero **ni una palabra sobre qué ES un Plan ni qué estructura interna tiene**. El documento del plan es hoy texto plano libre. Falta definir el subsistema por dentro, no solo su ciclo.

## El hueco

La funcionalidad `gestion-de-planes` define a fondo el **ciclo** (ver `ESTADOS.md`, `PLANES.md`, `lint-planes`, la memoria `feedback_flujo_planes.md`). Pero el **documento** que vive en `pendientes/`/`ejecutados/`/`descartados/` no tiene forma definida. Contraste con los otros subsistemas, que sí tienen esquema:

- **memoria** → frontmatter tipado (`name`, `description`, `metadata.type`).
- **glosario / decisiones** → columnas fijas de tabla.
- **conocimiento** → índice de punteros + páginas.
- **planes** → **el registro** tiene columnas fijas, pero **el documento del plan no tiene nada**.

## Estructura implícita que ya existe (a formalizar o descartar)

Hoy hay reglas sueltas sobre el documento, sin estar declaradas como "estructura de un plan":

- **La sección `Notas de implementación`** — obligatoria en `ejecutados/` (el `lint-planes` la exige; sin ella, hallazgo).
- **La sección `Estado`** — para el artefacto de estado de exploraciones multi-variable (memoria `feedback_artefacto_estado.md`), cuando el plan la necesita.
- **Forma de facto** que usan los planes recientes: título, una línea "Estado: X · Creado AA-MM-DD" al tope, luego secciones libres (Objetivo / Planteo, preguntas abiertas, depende de).

## Qué hay que definir (para cuando se retome)

- **Concepto de "Plan".** ¿Qué es un plan en este repo? Candidato a entrada de glosario (el término es del usuario, no acuñado — pasa el control). Distinguir del **registro** (`PLANES.md`) y del **estado**.
- **Esqueleto del documento.** ¿Qué secciones tiene un plan? Mínimo probable: encabezado (título + estado/fecha), el problema/objetivo, el enfoque, lo que queda abierto, dependencias/origen, y la sección de notas de implementación al cerrar. ¿Obligatorias o sugeridas? Hay **un solo tipo de plan**: todos se hacen para ejecutarse; `Diferido`/`Nuevo` son estados del ciclo, no clases distintas de documento.
- **Plantilla vs. guía libre.** ¿Se impone una `PLANTILLA` (como memoria) o se deja una guía flexible? Riesgo de rigidez: un plan es más heterogéneo que una memoria.
- **¿El lint chequea la estructura?** Hoy solo exige la sección de notas de implementación en ejecutados. ¿Se amplía a más secciones, o la estructura del documento queda como convención no-lintada? (La decisión 0003 pone lint mecánico obligatorio para subsistemas que persisten estado — pero el documento del plan es contenido, no integridad estructural del índice.)

## Ejes de diseño / choques

- **Terminología (decisión 0004):** "Plan", "Registro", "Estado" son del usuario, no acuñados — OK. Cuidado con inventar nombres de secciones raros.
- **No rigidizar de más (preferencia: minimizar sustractivo, no sobreingeniería):** el ciclo ya funciona sin esto. Definir estructura debe ayudar, no meter fricción a crear un plan rápido.

## Impacto de propagación
Si se define plantilla/esquema, toca: `funcionalidades/gestion-de-planes/` (PLANTILLA + prompt + skill), el orquestador `setup-completo` (textual), posible entrada de glosario, y quizá `lint-planes` si se chequea estructura.

## Correr por
`planificar` — es diseño estructural del subsistema. Probable entrada de glosario ("Plan") y quizá decisión (si se impone plantilla).
