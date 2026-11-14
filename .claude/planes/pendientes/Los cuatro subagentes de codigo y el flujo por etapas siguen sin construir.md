# Los cuatro subagentes de código y el flujo por etapas siguen sin construir

**Estado: Diferido · Creado 26-11-12.** Origen: se desprende al cerrar el plan Local-0094 ([Subagentes del AMP para el flujo de desarrollo por etapas](../ejecutados/Subagentes%20del%20AMP%20para%20el%20flujo%20de%20desarrollo%20por%20etapas.md)), que dejó hecho su núcleo y este resto.

## Qué falta

La Familia 2 del plan de origen: los cuatro subagentes de trabajo de código —`investigador`, `test-runner`, `code-reviewer` y `depurador`— y el flujo por etapas que se arma con ellos: diseño → crítica → desarrollo → tests → revisión → seguridad, con un punto de control humano entre diseño y desarrollo.

El diseño está en el plan de origen (secciones «Familia 2 — Agentes de trabajo de código», «Diseño: el flujo por etapas» y los pasos de la Familia 2). La forma de distribuirlos la fija la Decisión Local-0078: un plugin aparte que cada repo habilita en su `enabledPlugins`. Seguridad ya existe como `/security-review`, y la crítica la cubre en parte `amp:planificar`.

## Por qué está diferido

Desde que se desbloqueó, el 23/08/2026, nadie lo pidió, tampoco el repo de prueba que tiene código. Se retoma cuando un repo con código necesite el flujo.
