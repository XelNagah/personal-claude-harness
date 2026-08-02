# 0026 — Subsistema semántica, con dos registros pares

Elaboración de la decisión. Lo que se decidió está en su fila del registro; acá van las alternativas
descartadas, los criterios que la sostienen y lo que quedó diferido.

## Por qué dos registros y no uno

Lo vetado es la **relación término→significado**, no el término ni el significado sueltos, así que un
término vetado en un sentido puede ser legítimo en otro. Un solo registro con una columna
"¿legítimo?" obligaba a que cada fila hablara de las dos cosas a la vez. Con dos registros pares,
cada uno afirma una relación y ninguno tiene que negar la otra.

El modelo y sus ejemplos los documenta el subsistema, en el encabezado de
[`TERMINOLOGIA-FARLOPA.md`](../semantica/TERMINOLOGIA-FARLOPA.md). No se repiten acá: escritos en dos
lugares divergen, y de hecho divergieron —el ejemplo de `plomería` decía una cosa en esta decisión y
otra en el registro— hasta que se sacó de acá el 02/08/2026.

## Lo que se evaluó y se descartó

- **Una columna de lector en el registro.** El criterio de qué es farlopa es relativo al lector, y el
  lector de referencia es el usuario del Propósito de cada repo: `hook` o `deploy` son transparentes
  en un repo técnico y son farlopa en uno contable. Como ese lector es el mismo para todo el registro
  de un repo, la columna habría repetido el mismo valor en cada fila. **El registro se calibra por
  repo**, y con eso alcanza.
- **Canonizar cada significado vetado como concepto del glosario.** Se descartó como automatismo:
  vetar y canonizar son decisiones independientes, y el valor por omisión es no canonizar — el
  glosario no es un diccionario. El criterio de qué merece entrar se resuelve en el plan `Criterio de
  pertenencia al glosario`. **Caso testigo `tripa`:** se queda en Terminología Farlopa con su
  reemplazo y no gana concepto propio.

## El grafo latente

Glosario y Terminología Farlopa son dos tipos de arista —`significa` y `vetado`— sobre el mismo grafo
término↔significado. Se asienta como norte, no como construcción: **no se arma ninguna base de
grafos**.

## Diferido

- La arista de procedencia farlopa→concepto, que es parte del grafo latente.
- Una habilidad que resuelva los términos de `Propuestos` hacia `Alias` o hacia el veto. Hoy esa
  resolución es a mano.

## Nota de traducción

El nombre en inglés del registro es *Farlop Terminology*. Es una broma deliberada y se deja marcada,
para que la publicación en inglés y `converger-terminologia` no la "corrijan".

## Ejecución

El rebautizo tuvo el tamaño del de `scripts` a `herramientas`: funcionalidad, plugin, orquestador,
nivelador, `lint-glosario` a `lint-semantica`, y el prefijo `glosario:` a `semantica:` que fija la
Decisión Local-0013 (segmentación de skills por prefijo de plugin).
