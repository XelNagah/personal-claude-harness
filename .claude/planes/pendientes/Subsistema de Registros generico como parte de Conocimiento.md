# Subsistema de Registros genérico como parte de Conocimiento

**Estado: Nuevo · Creado 26-07-23.** Traspaso desde el repo `como-uso-claude`. Surgió al construir ahí la skill `investigar-documentar` (que produce documentos de referencia): hizo falta una **casa** donde juntar esos documentos, y se resolvió provisoriamente con una subcarpeta `conocimiento/documentos-investigacion/` (índice propio + `.md`). El autor observó que ese arreglo pide un mecanismo general.

## Idea cruda del autor

> *"Cada vez me surge más la idea de incorporar un subsistema de **Registros** genérico como parte de Conocimiento. Podría crearse un **Registro de Documentos** con su índice y `.md`, y sería un buen mecanismo general. Por ahora, un conocimiento de Documentos de investigación que junte los documentos."*

Un **Registro** = una colección de entradas homogéneas con su `INDICE.md` + sus `.md` + (quizás) su lint. La idea: poder **instanciar registros nuevos** bajo `conocimiento/` sin inventar un subsistema entero cada vez. Primer caso concreto: el **Registro de Documentos de investigación** (los que produce `investigar-documentar`).

## Tensión de fondo a resolver

El harness **ya** define **Subsistema** como "área que persiste estado siguiendo el patrón índice + entradas + lint" (semántica/decisión 0002). Un "Registro genérico" es, a primera vista, **ese mismo patrón reificado** — una fábrica de casas índice+entradas dentro de un subsistema (conocimiento) en vez de un subsistema nuevo por colección. Hay que decidir si Registros:

- **(a)** es un concepto nuevo (sub-colección dentro de un subsistema), o
- **(b)** es solo la generalización del patrón de Subsistema ya existente, aplicada a `conocimiento`, y no amerita nombre propio.

## Qué resolver (a diseñar con `planificar`)

1. **¿Registro entra a la semántica** como concepto propio, y cómo se corta contra `Subsistema` y contra la subcarpeta-con-índice que ya usa `conocimiento` (decisión 0011)?
2. **Alcance:** ¿solo dentro de `conocimiento`, o un mecanismo transversal (decisiones, planes también podrían tener "registros")?
3. **Lint:** ¿cada registro trae su lint, o lo cubre el lint del subsistema anfitrión? Cruza directo con el plan **`Lint unificado parametrizable por capacidad de subsistema`** (índice-solo / índice+documento / índice+carpeta recursiva) — un Registro es justo una capacidad más.
4. **Cómo se instancia** un registro nuevo (¿skill?, ¿plantilla?, ¿a mano?) y cómo se cataloga.
5. **Migración:** los documentos de investigación existentes en `conocimiento/` de `como-uso-claude` (hooks, claude-for-chrome, hermes, etc.) hoy viven en la raíz; moverlos rompe enlaces cruzados. El Registro debería definir cómo se hace esa reunión sin romper refs.

## Relación con otros planes

- **`Lint unificado parametrizable por capacidad de subsistema`** (Nuevo) — un Registro es una capacidad parametrizable; diseñar coordinados.
- **`Afinar el concepto de Subsistema frente a Funcionalidad y plugin`** (Nuevo) — misma familia (vocabulario del patrón índice+entradas+lint); no acuñar `Registro` sin cortar contra `Subsistema`.
- **`Revisar cada subsistema - sentido, disparador y skill de operacion`** (Nuevo) — si Registros es mecanismo, entra en esa revisión.

## Correr por

`planificar` — es diseño estructural + terminología canónica (gobernada por 0004/0018): toda entrada nueva a la semántica pasa por ratificación del autor. Contexto de origen (la skill y la subcarpeta provisoria) vive en `como-uso-claude`.
