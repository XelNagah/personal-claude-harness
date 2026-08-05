---
name: explicar-plan
description: Solo lectura. Explica un plan o una decisión pendiente de un plan en un formato fijo orientado a que el usuario decida sin releer nada — la pregunta, el reencuadre, la recomendación antes de las opciones y las consecuencias. Use when hay que presentar una decisión de un plan al usuario, o el usuario dice "explicá este plan" o "qué hay que decidir acá".
---

# Explicar un plan

Solo lectura: no cambia el estado ni el contenido del plan. Da contexto progresivo de alto a bajo nivel para que el usuario pueda decidir, sin volcar el texto completo del documento — lo que hace falta leer entero vive en el archivo del plan, y esta skill enlaza en vez de copiarlo.

Termina en **una pregunta**, así que la salida no es un resumen libre: tiene forma fija. Es texto plano en la terminal; no depende de ninguna superficie gráfica.

## El formato de salida

El orden es fijo y no se altera. **Lo que no hace falta para decidir, no va.**

1. **La pregunta, en una línea y sin jerga.** Es el título.
2. **Qué estábamos haciendo.** Reencuadre de alto nivel, siempre, aunque el usuario esté presente: después de un rato de trabajo el contexto está en la terminal y no en su cabeza. No se saltea por estar en una sesión viva.
3. **Por qué importa.** Una línea: qué se traba si esto no se decide.
4. **La recomendación, en una línea, ANTES de las opciones.** Si va después, el usuario se come el análisis entero y llega tarde a lo que importa.
5. **Las opciones**, cada una con un ejemplo concreto del repo —nunca en abstracto— y la recomendada marcada. **Siempre se incluye "Otro"**: puede que ninguna le cierre.
6. **Consecuencias encadenadas**, una por opción, con la forma `si A ⇒ resultado ⇒ pero costo`.
7. **Qué dicen los registros** y por qué no alcanzan para cerrar. Va al final: es lo único que el usuario puede saltear.

Se consulta **una decisión por vez**. El desarrollo vive en el documento del plan; esta skill lo referencia.

## Reportar

Presentar el bloque en ese orden y quedar a la espera de la decisión del usuario. No avanzar el estado del plan: eso es de otra skill (`analizar-plan`, `pausar-plan`, `cerrar-plan`, según lo que se decida).

## Reconciliación

Es solo lectura: re-correrla sobre el mismo plan no cambia nada y vuelve a producir la misma salida. Si el plan ya avanzó desde la última vez, refleja el estado nuevo.
