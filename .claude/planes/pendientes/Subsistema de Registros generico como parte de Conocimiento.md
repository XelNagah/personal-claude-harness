# Subsistema de Registros genérico como parte de Conocimiento

**Estado: Nuevo · Creado 26-07-23.** Traspaso desde el repo `como-uso-claude`. Surgió al construir ahí la skill `investigar-documentar` (que produce documentos de referencia): hizo falta una **casa** donde juntar esos documentos, y se resolvió provisoriamente con una subcarpeta `conocimiento/documentos-investigacion/` (índice propio + `.md`). El autor observó que ese arreglo pide un mecanismo general.

## Idea cruda del autor

> *"Cada vez me surge más la idea de incorporar un subsistema de **Registros** genérico como parte de Conocimiento. Podría crearse un **Registro de Documentos** con su índice y `.md`, y sería un buen mecanismo general. Por ahora, un conocimiento de Documentos de investigación que junte los documentos."*

Un **Registro** = una colección de entradas homogéneas con su `INDICE.md` + sus `.md` + (quizás) su lint. La idea: poder **instanciar registros nuevos** bajo `conocimiento/` sin inventar un subsistema entero cada vez. Primer caso concreto: el **Registro de Documentos de investigación** (los que produce `investigar-documentar`).

## Resuelto el 29/07/2026 (sesión de `planificar`)

- **El nombre está elegido: `Registro Multipropósito`.** Nombra el carácter del mecanismo, no de quién es: sirve a cualquier propósito porque **las columnas las define quien lo usa**. Se forma igual que `Agente Multipropósito`, y en inglés sale derecho. Todavía **no se asienta en el glosario**: entra cuando el mecanismo se construya.
- **La tensión de abajo se resuelve por (a), no por (b): es un concepto propio y es opcional.** Se evaluó unificarlo con el Índice de Subsistema —que todo índice fuera un Registro— y **se descartó**: obligaría a cada subsistema a usar el mecanismo. Un subsistema puede usar **cero** Registros; su Índice sólo lista sus elementos y no está obligado a nada más.
- **Un Registro declara sus columnas en el frontmatter**, agregado del autor a la idea original. La decisión 0042 ya lo aplica a los Índices de Subsistema, así que el formato del frontmatter (`nombre`, `origen`, `columnas`) queda fijado antes de que este plan se ejecute.
- **Los Registros pueden viajar a los Agentes Desplegados.** El campo `origen` los distingue igual que a los Índices.
- **Sin identificadores numéricos.** Referirse a «el Registro 4» reabre lo que el plan `Partir los índices por origen` ya cerró: la numeración corrida se rompe cuando el Agente Multipropósito saca una entrada y el mismo número pasa a significar cosas distintas en dos repos con versiones distintas. La referencia estable es el nombre del Registro.

Queda abierto todo lo mecánico: cómo se instancia uno nuevo, dónde se cataloga, si el lint es propio o del subsistema que lo contiene, y la migración de lo existente.

## Tensión de fondo a resolver

El harness **ya** define **Subsistema** como "área que persiste estado siguiendo el patrón índice + entradas + lint" (semántica/decisión 0002). Un "Registro genérico" es, a primera vista, **ese mismo patrón reificado** — una fábrica de casas índice+entradas dentro de un subsistema (conocimiento) en vez de un subsistema nuevo por colección. Hay que decidir si Registros:

- **(a)** es un concepto nuevo (sub-colección dentro de un subsistema), o
- **(b)** es solo la generalización del patrón de Subsistema ya existente, aplicada a `conocimiento`, y no amerita nombre propio.

## Qué resolver (a diseñar con `planificar`)

1. **¿Registro entra a la semántica** como concepto propio, y cómo se corta contra `Subsistema` y contra la subcarpeta-con-índice que ya usa `conocimiento` (Decisión Local-0011, responsabilidad del índice en el Patrón recursivo)?
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
