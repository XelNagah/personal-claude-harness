# Las reglas que viven dentro de una habilidad no se cumplen cuando la habilidad no se invoca

**Estado: Nuevo · Creado 26-11-13.** Origen: plan Local-0129 (plan maestro), arreglo 1 del análisis de un mes de conversaciones —el de mayor impacto—. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

## El problema

Una regla escrita en los pasos de una habilidad solo actúa si la habilidad se dispara. Y las habilidades se saltean seguido: en el análisis, 42 % de las veces que correspondía una (68 de 163), y «la habilidad no se disparó» es la causa más frecuente (26 de 59 episodios firmes).

Caso que lo muestra, Impresión 3D, 06/11/2026: «Me comí un blob de la muerte. NO LO VISTE PARA PARARLO??». La regla de lanzar el vigía vivía en la habilidad de calibración, invocada en 3 de 19 sesiones. Cuando la regla pasó a conducta, se cumplió siempre.

Lo que **no** es la causa: el listado de habilidades no recorta las descripciones de las `amp*` (refutado en el mismo análisis).

## Lo que hay que resolver

1. **Inventario.** Qué reglas de «en el momento X, hacé Y» viven hoy dentro de los `SKILL.md` de la Base (y cuáles en los repos desplegados, como ejemplo) que deberían cumplirse aunque la habilidad no se invoque.
2. **Criterio de corte.** Qué regla sube a conducta y cuál se queda en la habilidad. Una regla cargada siempre se recita (conocimiento Local-0001): no todo puede subir.
3. **Entrega.** Cada regla elegida como regla de conducta con su momento y su clase (Decisión Local-0021), con `registrar-regla`.
4. **Medición.** Antes y después, con la Herramienta Local-0012 `probar-disparo-de-skills` o el banco del plan Local-0027.

## Cruces

- plan Local-0089 (Por qué las preferencias cargadas no se aplican): misma familia, pero sobre preferencias cargadas, no sobre reglas dentro de habilidades.
- plan Local-0105 (Mejoras al harness surgidas del análisis de consumo): su acción C es un caso de este plan (`converger-terminologia` como regla de conducta).
- plan Local-0027 (Banco de pruebas conductual de mecanismos): sirve para verificar.
