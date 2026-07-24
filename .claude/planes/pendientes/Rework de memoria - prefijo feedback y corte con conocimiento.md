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

## Cruces

- `Revisar cada subsistema — sentido, disparador y skill de operación` — menciona "el corte memoria↔conocimiento escrito de un solo lado".
- `Subsistema de Registros genérico como parte de Conocimiento` — dónde viven documentos vs hechos.
- Se cruza con `Separar origen Base y aprendido en los subsistemas`: las `feedback_<sub>` son memorias de **Base** (las siembra el harness), lo aprendido es del repo — mismo eje de origen.

Correr por `planificar`.
