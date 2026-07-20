# Banco de pruebas conductual de mecanismos

**Estado: Nuevo · Creado 26-07-20.** Desprendido de [Convención de commits Antes/Ahora al harness](../ejecutados/Convencion%20de%20commits%20Antes-Ahora%20al%20harness.md).

## El problema

El harness acumula reglas escritas —preferencias, memorias, controles en skills— y **nada verifica que el agente efectivamente las aplique**. Los lints chequean que el texto esté donde debe; ninguno chequea que el texto haya cambiado la conducta.

La consecuencia ya está registrada cuatro veces, siempre igual: una regla existe, está bien escrita, y no dispara en el punto de acción.

- [Hook de preferencias en punto de acción](Hook%20de%20preferencias%20en%20punto%20de%20accion.md) — preferencia de comunicación violada en el turno 2, con contexto fresco.
- [Control de ratificación para decisiones](Control%20de%20ratificacion%20para%20decisiones.md) — el agente afirmó "Decisiones tomadas" por elecciones que el usuario nunca hizo.
- [Chequear el plan escrito contra la sabiduría del repo](Chequear%20el%20plan%20escrito%20contra%20la%20sabiduria%20del%20repo.md) — el agente acuñó `acote` ocho veces; se detectó porque el usuario preguntó.
- **La convención de commits misma** — todo el diseño de esa decisión (poner el formato en la línea de índice y no solo en el cuerpo de la memoria) descansa en una hipótesis conductual **no medida**: que una línea de índice que nombra el formato hace que el agente abra la memoria antes de commitear.

Los tres primeros se anotaron como incidentes y se propusieron mecanismos distintos para cada uno. El cuarto muestra el patrón: **se están tomando decisiones de diseño sobre cómo se comporta el agente, argumentándolas en vez de probándolas.**

## Qué es (y qué no)

Un banco de pruebas que corre un agente de verdad sobre un repo preparado y evalúa el artefacto que produce.

```
fixture:  repo temporal con el harness instalado + un diff staged
prompt:   "commiteá esto"          (sin decir nada del formato)
assert:   título ~ /^[^:]+: /  ∧  cuerpo ~ /Antes,.*Ahora,/  ∧  ¬/Co-Authored-By/
corridas: N por variante, con `claude -p` (y `codex exec` para paridad)
variantes: A = línea de índice rica · B = línea pobre · C = la regla en la Base
```

Si A da 9/10 y B da 2/10, la decisión del plan padre queda **probada**. Si empatan, la línea de índice rica no sirve y hay que volver a discutir el reparto.

**No es un lint.** El resultado es una tasa, no verde/rojo. Una corrida sola no prueba nada; el criterio de aceptación tiene que ser un umbral sobre N corridas, y hay que decidir qué se hace cuando el umbral falla (¿frena un commit? ¿solo informa?).

**Es una tercera capa.** La decisión 0003 define dos: mecánica (lints `.js`, sin LLM) y semántica (contradicciones y duplicación, con LLM sobre texto, "hoy informal, pendiente de formalizar"). Ésta corre al agente y evalúa el artefacto producido. Si el plan avanza, amerita decisión estructural nueva.

## Por qué el estilo de commits es el primer caso

El artefacto es un string corto con marcadores verificables por regex (`Antes,`, `Ahora,`, el prefijo de área, la ausencia del trailer). Barato, determinista de evaluar, sin LLM juez.

Los otros tres incidentes producen prosa difusa —un plan, una pregunta al usuario, un término acuñado en medio de un documento— y ahí el assert necesita un LLM que juzgue, lo que multiplica costo y mete varianza en el propio evaluador. Conviene construir el banco contra el caso barato y recién después ver si estira.

## Preguntas abiertas

- **¿Cuánto cuesta?** Cada corrida es una llamada real al modelo. N=10 × 3 variantes × 2 agentes = 60 sesiones por experimento. Falta estimar tiempo y tokens antes de comprometerse.
- **¿Dónde vive?** Es una Herramienta del Propósito de este repo (autorar el harness), tipo `script`, junto a `lint-harness`. Pero no corre en el control de cierre: es lento y caro. ¿Se invoca a mano? ¿Solo al tocar un mecanismo?
- **¿Qué fixture?** ¿Se instala el harness de verdad con `inicializar-custom` (lento, pero prueba la instalación además del mecanismo) o se arma el `.claude/` a mano (rápido, pero puede divergir de lo que la skill realmente instala)?
- **¿Mide el turno 1 o la deriva?** El incidente de `Hook de preferencias` fue en el turno 2 con contexto fresco, o sea que el turno 1 solo no alcanza. Una sesión larga es mucho más cara de simular.
- **¿Qué se hace con un resultado malo?** Si A y B empatan, ¿se revierte el diseño ya commiteado o se acepta y se busca otro mecanismo (hook, control en skill)? Conviene decidirlo **antes** de correr el experimento, para no racionalizar el resultado después.
