---
name: terminologia-canonica
description: Una regla escrita con el vocabulario que prohíbe se auto-refuerza; ratificar un término no lo cambia hasta bajarlo al texto. Barrer los canónicos primero y enunciar contra la lista aprobada, no contra una lista de prohibidos.
metadata:
  type: feedback
---

Dos mecanismos por los que la terminología ajena sobrevive aunque el usuario la haya señalado. Los dos observados en este repo el 2026-07-20.

**1. Bucle de re-entrenamiento.** `PREFERENCIAS.md` enunciaba *"**Gate duro** en registros canónicos"* — la regla contra los anglicismos, escrita con un anglicismo. El glosario definía su propia convención con `<slug>.md`. La decisión 0004 repetía las dos. Cada vez que el agente releía la regla para corregirse, se re-entrenaba en el vocabulario que la regla prohíbe. Por eso describir el problema no lo frenaba.

**2. Ratificación sin ejecución.** El 2026-07-19 el usuario ratificó los reemplazos (`gate`→control, `verbatim`→textual, `levelear`→nivelar, `slug`→nombre estable, `prosa`→texto plano) y entraron al glosario. El plan que los bajaba al texto quedó en `Nuevo`. Dos días después seguían circulando 68 usos de "verbatim", 52 de "slug" y 26 de "gate" — y la percepción del usuario era *"me canso de describirlas y siguen apareciendo"*, que era exacta.

**Why:** los canónicos (`PREFERENCIAS.md`, `AGENTS.md`, glosario, decisiones) están siempre en contexto **y** se copian a cada repo nuevo. Un término que sobrevive ahí no se queda quieto: se propaga a los consumidores y vuelve al agente en cada sesión.

**How to apply:**

1. **La ratificación no está hecha hasta que el texto cambió.** Ratificar y barrer en la misma tanda, o el término sigue vivo. Si no se puede barrer en el momento, el plan queda `En curso`, no `Nuevo`.
2. **Barrer los canónicos primero**, antes que memorias, planes o funcionalidades. Es lo que corta el bucle.
3. **Enunciar la regla contra la lista aprobada, no contra una de prohibidos.** Los términos que el agente puede inventar son infinitos; el glosario es finito. La regla correcta es "si el término del dominio no está en el glosario, no se usa como establecido: se marca como propuesto y se pide ratificación".
4. **Excluir del barrido:** `planes/ejecutados/` y `descartados/` (historia congelada — reescribir el pasado falsea el registro), el glosario y el plan de veto (contienen los términos vetados como ejemplo, a propósito).
5. Al cambiar la Base de preferencias, **verificar a mano** que quedó idéntica en los tres lugares (`PREFERENCIAS.md` y las dos `PLANTILLA.md`): `lint-harness` no compara ese texto.

Relacionado: [[glosario]], [[propagacion-harness]].
