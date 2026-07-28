# Controlar terminología y preferencias en commits

**Estado: Nuevo · Creado 26-07-27.**

Los controles actuales revisan los archivos del repositorio, pero no el asunto ni el cuerpo de los commits. Por eso un mensaje puede usar terminología que el repo evita o no respetar las preferencias de escritura.

## Objetivo

Antes de crear un commit, revisar su mensaje contra la Terminología Farlopa y las preferencias aplicables a commits.

## Alcance

- Elegir un único punto de control previo al commit.
- Validar asunto y cuerpo contra los términos vetados.
- Comprobar las preferencias mecánicamente verificables: español, formato y nombres completos del dominio cuando corresponda.
- Cubrir ejemplos que deben pasar y fallar.
- Propagar el control al Agente Multipropósito publicado si forma parte de su Base.

## Resultado esperado

Un commit con un término vetado o un formato contrario a las preferencias se rechaza antes de quedar registrado; un mensaje válido continúa sin pasos extra.
