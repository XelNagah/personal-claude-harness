# Rework de memoria — prefijo feedback y corte con conocimiento

**Estado: Nuevo · Creado 26-07-24.** Idea de Javier 26-07-24, en la sesión del plan de distribución marketplace. Registrado para no olvidarlo; sin diseñar.

## La molestia

- El prefijo **`feedback_`** antepuesto a **todas** las memorias molesta. No todas son feedback (el frontmatter ya tiene `metadata.type` ∈ `user | feedback | project | reference`), pero el nombre de archivo dice `feedback_` igual.
- Esas memorias **parecen un listado de subsistemas** (`feedback_flujo_planes`, `feedback_semantica`, `feedback_decisiones`, `feedback_herramientas`…): son punteros al comportamiento de cada subsistema, no hechos sueltos.
- El **resto** de lo que podría ir en memoria **se confunde con el Conocimiento**. El corte memoria↔conocimiento hoy está escrito de un solo lado (el MANIFIESTO de conocimiento tiene la prueba "¿seguiría siendo cierto si este repo no existiera?"; memoria no tiene el corte simétrico).

## A analizar

- ¿El prefijo `feedback_` tiene sentido o es residuo? ¿El nombre de archivo debería reflejar el `type` del frontmatter, o ninguno?
- ¿Por qué las memorias-de-subsistema parecen un índice de subsistemas? ¿Deberían vivir de otra forma (parte del MANIFIESTO de cada subsistema, en vez de una memoria `feedback_<sub>`)?
- El corte memoria↔conocimiento, escrito por ambos lados.

## De dónde viene el enredo (Javier, 26-07-25)

**Memoria fue el primer subsistema que existió**, así que los agentes de esa época guardaban **todo** ahí. Lo que hoy cuelga de memoria no es un diseño: es **legacy** de cuando no había dónde más ponerlo. Con eso, las dos molestias de arriba dejan de ser dos problemas y pasan a ser el mismo residuo visto por dos lados.

**Dirección que quiere el autor:** sacar de memoria lo que es conocimiento, y que lo que queda —el índice de subsistemas que memoria de hecho ya es— **se transforme en un subsistema `subsistemas`**, con su `SUBSISTEMAS.md` y su `INDICE.md`. Es dirección, no diseño cerrado: hay que analizar qué sobrevive como memoria genuina.

## Evidencia medida (26-07-25, sobre tres repos)

La memoria está partida en dos poblaciones, y la partición es la misma en los tres:

- **8 memorias Base, idénticas en los tres repos**, que describen subsistemas: `feedback_flujo_planes`, `feedback_semantica`, `feedback_decisiones`, `feedback_conducta`, `feedback_herramientas`, `feedback_estilo_commits`, `feedback_base_conocimiento`, `feedback_archivo_de_estado`. Duplican lo que ya dice el `MANIFIESTO.md` de cada subsistema, que además está **siempre en contexto**.
- **Memorias del Propósito**, y varias **son conocimiento mal ubicado**: en Impresión3d, `k1c-network`, `machines`, `orcaslicer-cli-headless`, `gear-ring-petg-print-in-place` pasan la prueba de pertenencia sin dudar (la red de una impresora K1C sigue siendo cierta sin el repo).

**Lo que sobrevive como memoria genuina** son hechos del proyecto que no son conocimiento general: en el Coordinador, `project_piloto_contable_dockerizado`, `feedback_permisos_escritura_agentes`. O sea memoria adelgaza mucho; no desaparece.

⚠️ **Lo que este rework NO resuelve:** el solapamiento entre subsistema y skill. Aun con memoria arreglada, cada subsistema sigue teniendo su skill viajando por plugin (`amp-semantica` trae `converger-terminologia`), así que "subsistemas" nunca va a nombrar *solo* archivos. Ese corte es otro: archivos ↔ skills (decisión 0034).

## Cruces

- `Revisar cada subsistema — sentido, disparador y skill de operación` — menciona "el corte memoria↔conocimiento escrito de un solo lado".
- `Subsistema de Registros genérico como parte de Conocimiento` — dónde viven documentos vs hechos.
- Se cruza con `Separar origen Base y aprendido en los subsistemas`: las `feedback_<sub>` son memorias de **Base** (las siembra el harness), lo aprendido es del repo — mismo eje de origen.

Correr por `planificar`.
