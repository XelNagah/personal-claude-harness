# Habilidad para poblar subsistemas desde un repo existente

**Estado: Diferido · Creado 26-07-18.** Surgió al aclarar que el harness se instala **también sobre repos que ya tienen cosas** ([decisión 0001](../../decisiones/INDICE.md)), no solo vacíos.

## Objetivo

Una habilidad que **recorre un repo ya poblado** (código, docs, historia) y **llena los subsistemas** con lo que ya haya: sembrar `conocimiento`, `glosario`, `decisiones`, `memoria`, `scripts` a partir del contenido existente, en vez de arrancar de cero.

## Diferencia con lo que ya existe

La idempotencia/reconciliación actual (secciones "Reconciliación" de cada skill) **migra y no pisa** lo que ya está en `.claude/`. Esto es distinto: un **barrido activo de descubrimiento** sobre el repo entero para *generar* contenido inicial de los subsistemas — inferir términos del dominio, decisiones ya tomadas (del código/commits), scripts sueltos, conocimiento disperso.

## Preguntas de diseño abiertas (para cuando se retome)

- **Alcance de la inferencia:** ¿qué puebla y desde dónde? (glosario ← nombres recurrentes del dominio; decisiones ← commits/ADRs/comentarios; scripts ← ejecutables sueltos; conocimiento ← READMEs/docs; memoria ← convenciones detectadas).
- **Confianza:** lo inferido no es fuente verificada. ¿Se marca como "propuesto, a confirmar" (respetando "cero invención")? ¿El usuario ratifica antes de asentar?
- **Costo/gatillo:** barrido caro (LLM sobre todo el repo). ¿On demand, una vez al inicializar sobre repo existente?
- **Relación con la capa semántica** (plan [Capa semántica de coherencia](Capa%20semantica%20de%20coherencia%20-%20contradicciones%20e%20incompatibilidades.md)): lo poblado debería pasar por el chequeo de contradicciones.

## Depende de
Conceptualmente, del setup base ya instalado (los subsistemas a poblar).
