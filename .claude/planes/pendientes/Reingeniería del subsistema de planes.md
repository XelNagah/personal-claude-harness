# Reingeniería del subsistema de planes

**Estado: Nuevo · Creado 26-07-27.** Origen: `Partir las mega-skills en habilidades de un verbo`.

## Propósito

Definir y distribuir un contrato completo de planes que funcione dentro de cada Agente Multipropósito, sin requerir ningún mecanismo externo para crear, analizar, explicar, priorizar, pausar, retomar, diferir, cerrar o descartar planes.

El contrato debe llegar a instalaciones nuevas y existentes. Cada repositorio puede actualizarse y verificarse de forma independiente, preservando su aprendizaje local.

## Contrato de estados

Un plan está en exactamente uno de estos estados:

| Estado | Sentido | Terminal |
|--------|---------|----------|
| Nuevo | El plan fue registrado, pero todavía no fue analizado. | no |
| Análisis | Se delimita, contrasta o ajusta el plan antes de dejarlo listo para ejecutar. | no |
| Listo | El plan está analizado y suficientemente definido para iniciar su ejecución. | no |
| En curso | El plan está siendo ejecutado. El contrato no impone cómo se realiza esa ejecución. | no |
| En pausa | El análisis o la ejecución se interrumpieron temporalmente con intención de retomarlos. | no |
| Diferido | El plan se pospone deliberadamente para revisarlo más adelante. | no |
| Ejecutado | El plan terminó satisfactoriamente. | sí |
| Descartado | El plan no se realizará; el motivo queda asentado. | sí |

Los planes no terminales viven en `planes/pendientes/`; los ejecutados, en `planes/ejecutados/`; y los descartados, en `planes/descartados/`.

### Transiciones y datos obligatorios

- `Nuevo` → `Análisis`, `Diferido` o `Descartado`.
- `Análisis` → `Listo`, `En pausa`, `Diferido` o `Descartado`.
- `Listo` → `Análisis`, `En curso`, `Diferido` o `Descartado`.
- `En curso` → `En pausa`, `Diferido`, `Ejecutado` o `Descartado`.
- `En pausa` conserva obligatoriamente `estado_a_retomar`, cuyo único valor válido es `Análisis` o `En curso`.
- Al retomar `En pausa`, el plan vuelve exactamente al valor de `estado_a_retomar` y ese dato se elimina.
- `Diferido` vuelve siempre a `Análisis`; nunca vuelve directo a `Listo` ni a `En curso`.
- Al pasar a `Diferido`, se elimina cualquier `estado_a_retomar`.
- `Ejecutado` y `Descartado` son terminales.
- `Descartado` exige motivo; `Ejecutado`, notas de implementación.

`estado_a_retomar` vive en el archivo del plan, no en `PLANES.md`: es un dato transitorio del plan pausado. El registro conserva estado, fechas, origen y notas.

## Familia de habilidades

La familia `amp-planes` se organiza por verbos. Cada habilidad consulta el contrato del subsistema en vez de duplicarlo.

| Habilidad | Responsabilidad |
|-----------|-----------------|
| `amp-planes:crear` | Registra un plan en `Nuevo`: documento, fila de `PLANES.md` y enlaces consistentes. |
| `amp-planes:analizar` | Trabaja sobre un plan persistido; reutiliza `amp:planificar` y lo mueve por `Análisis` hasta `Listo` si corresponde. |
| `amp-planes:explicar` | Solo lectura. Da contexto progresivo de alto a bajo nivel, sin volcar el texto completo de entrada. |
| `amp-planes:priorizar` | Solo lectura. Ordena planes vivos y fundamenta una prioridad sugerida. |
| `amp-planes:sugerir-siguiente-plan` | Solo lectura. Reutiliza `priorizar` y propone una única próxima acción. |
| `amp-planes:pausar` | Lleva `Análisis` o `En curso` a `En pausa` y guarda `estado_a_retomar`. |
| `amp-planes:retomar` | Vuelve un plan pausado a `estado_a_retomar` y limpia ese campo. |
| `amp-planes:diferir` | Lleva un plan vivo a `Diferido`; acepta `suspender` como alias. |
| `amp-planes:cerrar` | Cierra un plan como `Ejecutado`, con fecha y notas de implementación. |
| `amp-planes:descartar` | Cierra un plan como `Descartado`, con fecha y motivo obligatorio. |

### Priorizar y sugerir el siguiente plan

`amp-planes:priorizar` usa estos criterios, en orden:

1. Desbloqueo de dependencias.
2. Urgencia o fecha explícita.
3. Valor para el propósito del agente.
4. Esfuerzo, riesgo y grado de definición.

Marca evidencia faltante en lugar de inventar certeza. No persiste prioridades ni modifica planes.

`amp-planes:sugerir-siguiente-plan` propone una sola próxima acción: ejecutar un plan `Listo`, analizar un plan pendiente o abrir una funcionalidad conveniente para planificar. Explica la evidencia y qué dato podría cambiar la sugerencia.

## Alcance de implementación

1. Actualizar `ESTADOS.md`, `PLANES.md`, el README y el manifiesto del subsistema para describir el mismo contrato.

2. Actualizar la plantilla de planes y `lint-planes` para validar:

   - estados, transiciones y carpeta;
   - enlace, fechas y terminalidad;
   - presencia de `estado_a_retomar` solo en `En pausa`, con valor permitido;
   - ausencia de ese dato en `Diferido` y estados terminales;
   - notas de implementación en `Ejecutado`;
   - motivo en `Descartado`.

3. Retirar la habilidad `ciclo-de-plan` y reemplazarla por las habilidades de esta familia, excepto `amp-planes:ejecutar`.

4. Actualizar instalación, nivelado, catálogo de funcionalidades, registros, documentación y controles textuales para distribuir el contrato completo.

5. Actualizar repositorios existentes de forma individual:

   - conservar sin reinterpretar `Nuevo`, `En curso`, `Diferido`, `Ejecutado` y `Descartado`;
   - no asignar retrospectivamente `Análisis` o `Listo` sin evidencia explícita;
   - no inventar `estado_a_retomar`;
   - reportar como divergencia cualquier variante local no equivalente, sin pisarla;
   - informar `agregado`, `ya estaba` y `divergente`.

6. Verificar transiciones válidas e inválidas, pausa y reanudación, diferimiento, cierres, instalación nueva y actualización de un repositorio existente.

## Relación con planes existentes

`Habilidad de ejecucion de planes.md` sigue vigente como plan dependiente posterior. Al cerrarse este contrato, evolucionará a `amp-planes:ejecutar`: ejecutará el cuerpo de un plan `Listo`, acumulará comportamiento básico de ejecución y respetará `En curso`, `En pausa` y los cierres.

No redefinirá estados, transiciones, plantilla ni lint. El cierre de aprendizaje continúa siendo una responsabilidad separada.

## Criterios de cierre

- Los ocho estados y sus transiciones tienen una fuente de verdad única.
- Las habilidades, documentación, instalación y lint aplican el mismo contrato.
- `En curso` no presupone una forma particular de ejecución.
- `En pausa` es el único estado con `estado_a_retomar`.
- Todo plan diferido vuelve a `Análisis`.
- `priorizar` y `sugerir-siguiente-plan` son consultas sin efectos sobre los planes.
- Una instalación nueva y una actualización independiente terminan con el lint verde.
