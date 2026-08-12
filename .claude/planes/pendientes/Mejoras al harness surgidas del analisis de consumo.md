**Estado: Nuevo · Creado 26-08-10.**

# Mejoras al harness surgidas del análisis de consumo (semana 08-03→08-10)

## De dónde sale

Del repo de análisis «Cómo uso Claude Code» (`D:\Proyectos\analisis\como-uso-claude`), seguimiento de consumo de tokens del 10/08/2026. Las tres acciones son diferibles, no urgentes, y comparten el mismo origen y el mismo próximo punto de verificación.

Contexto de la semana medida (08-03→08-10): el costo bajó 31% respecto de la semana anterior gracias a la higiene de sesión (`/clear`, contexto por sesión a la mitad, sesiones zombis muertas). Lo que quedó sin mejorar es el volumen de trabajo en Opus: Opus 5 + Opus 4.8 concentran el 88% del costo.

## Acción A — Delegar a modelos baratos las corridas mecánicas de flota

El mecanismo de subagentes con modelo declarado existe desde el 06/08/2026, pero las corridas mecánicas de flota siguen mayormente en Opus. En la semana medida, `amp:actualizar` corrió ~27 veces mayormente en Opus; sonnet+haiku fueron solo el 3,7% de los turnos y el 2% del costo. Falta que las corridas mecánicas (`amp:actualizar`, barridos de `converger-terminologia`, `buscar-conocimiento`) usen un modelo barato por defecto.

**Verificación:** en el próximo seguimiento de consumo, sonnet+haiku superan el 10% de los turnos, o las corridas de `amp:actualizar` aparecen en un subagente con modelo barato.

## Acción B — Endurecer el aviso de contexto pesado ante una ráfaga

El patrón caro nuevo es la ráfaga: una sesión hizo 269 turnos en 45 minutos (255k de contexto máximo, ~$106 equivalentes en Opus) y siguió ~100 turnos después del primer aviso de contexto pesado, porque el aviso pide cortar «en un punto natural» que en una ráfaga no llega nunca.

Propuesta a afinar en el análisis: a partir del segundo escalón (~200k estimados), el aviso pide el corte en el **punto de corte siguiente**, no en un punto natural.

**Verificación:** una sesión de prueba que infle contexto recibe el aviso escalado a partir del segundo escalón; en el próximo seguimiento de consumo, ninguna sesión sigue más de ~100 turnos después del primer aviso.

## Acción C — Correr `converger-terminologia` sin invocación manual

Hoy la deriva semántica se corrige porque el usuario invoca la habilidad a mano; lo pidió dos veces el 06/08/2026 («que eso ya arranque así desde el principio»). Falta diseñar la regla de conducta que corra el barrido de terminología antes de asentar nombres nuevos en registros, sin que el usuario invoque nada.

**Verificación:** en una sesión limpia, proponer un término inventado para un registro; el control lo intercepta sin invocación del usuario.
