# Reingeniería del subsistema de planes

**Estado: En curso · Creado 26-07-27.** Origen: `Partir las mega-skills en habilidades de un verbo`.

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
| `amp-planes:crear-plan` | Registra un plan en `Nuevo`: documento, fila de `PLANES.md` y enlaces consistentes. |
| `amp-planes:analizar-plan` | Trabaja sobre un plan persistido; reutiliza `amp:planificar` y lo mueve por `Análisis` hasta `Listo` si corresponde. |
| `amp-planes:explicar-plan` | Solo lectura. Da contexto progresivo de alto a bajo nivel, sin volcar el texto completo de entrada. |
| `amp-planes:priorizar-planes` | Solo lectura. Ordena planes vivos y fundamenta una prioridad sugerida. |
| `amp-planes:sugerir-siguiente-plan` | Solo lectura. Reutiliza `priorizar-planes` y propone una única próxima acción. |
| `amp-planes:pausar-plan` | Lleva `Análisis` o `En curso` a `En pausa` y guarda `estado_a_retomar`. |
| `amp-planes:retomar-plan` | Vuelve un plan pausado a `estado_a_retomar` y limpia ese campo. |
| `amp-planes:diferir-plan` | Lleva un plan vivo a `Diferido`; acepta `suspender-plan` como alias. |
| `amp-planes:cerrar-plan` | Cierra un plan como `Ejecutado`, con fecha y notas de implementación. |
| `amp-planes:descartar-plan` | Cierra un plan como `Descartado`, con fecha y motivo obligatorio. |

### El formato de salida de `amp-planes:explicar-plan`

`explicar` termina en una pregunta al usuario, así que su salida no es un resumen
libre: tiene una forma fija, orientada a que el usuario pueda decidir sin releer
nada. Es texto plano en la terminal; no depende de ninguna superficie gráfica.

El orden es fijo y no se altera:

1. **La pregunta, en una línea y sin jerga.** Es el título.
2. **Qué estábamos haciendo.** Reencuadre de alto nivel, siempre, aunque el usuario
   esté presente: después de diez minutos de trabajo el contexto está en la terminal
   y no en su cabeza, y releer la terminal hacia arriba cuesta lo mismo que llegar
   en frío. Este punto no se saltea por estar en una sesión viva.
3. **Por qué importa.** Una línea: qué se traba si esto no se decide.
4. **La recomendación, en una línea, ANTES de las opciones.** Si va después, el
   usuario se come el análisis entero y llega tarde a lo que importa.
5. **Las opciones**, cada una con un ejemplo concreto de cómo queda —del repo, nunca
   en abstracto— y la recomendada marcada. **Siempre se incluye "Otro"**: puede que
   ninguna opción le cierre al usuario.
6. **Consecuencias encadenadas**, una por opción, con la forma `si A ⇒ resultado ⇒
   pero costo`. Es lo que permite comparar sin reconstruir el razonamiento.
7. **Qué dicen los registros** y por qué no alcanzan para cerrar. Va al final: es lo
   único que el usuario puede saltear.

Regla que ordena todo lo anterior: **lo que no hace falta para decidir, no va.**
El desarrollo vive en el documento del plan, y `explicar` enlaza en vez de volcarlo.

Se consulta **una decisión por vez**, en línea con las **Preferencias Recomendadas**
«Pedir una decisión por vez, con contexto y recomendación» y «Dar ejemplos concretos
de cada postura».

Este formato no se inventa acá: está validado en uso real en el Agente Coordinador,
donde se iteró con el usuario hasta esta forma y se usó para resolver decisiones
concretas. Lo que sube es el subconjunto necesario para decidir, sin los campos de
seguimiento ni la superficie gráfica de aquella implementación, que son propios de
ese repo y no del subsistema de planes.

### Priorizar y sugerir el siguiente plan

`amp-planes:priorizar-planes` usa estos criterios, en orden:

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

3. Retirar la habilidad `ciclo-de-plan` y reemplazarla por las habilidades de esta familia, excepto `amp-planes:ejecutar-plan`.

4. Actualizar instalación, nivelado, catálogo de funcionalidades, registros, documentación y controles textuales para distribuir el contrato completo. El nivelado de un repositorio existente debe:

   - conservar sin reinterpretar `Nuevo`, `En curso`, `Diferido`, `Ejecutado` y `Descartado`;
   - no asignar retrospectivamente `Análisis` o `Listo` sin evidencia explícita;
   - no inventar `estado_a_retomar`;
   - reportar como divergencia cualquier variante local no equivalente, sin pisarla;
   - informar `agregado`, `ya estaba` y `divergente`.

5. Verificar transiciones válidas e inválidas, pausa y reanudación, diferimiento, cierres, instalación nueva y actualización de un repositorio existente, esta última contra un repositorio de prueba, nunca contra la flota de Agentes con Propósito instalados.

## Relación con planes existentes

`Habilidad de ejecucion de planes.md` sigue vigente como plan dependiente posterior. Al cerrarse este contrato, evolucionará a `amp-planes:ejecutar-plan`: ejecutará el cuerpo de un plan `Listo`, acumulará comportamiento básico de ejecución y respetará `En curso`, `En pausa` y los cierres.

No redefinirá estados, transiciones, plantilla ni lint. El cierre de aprendizaje continúa siendo una responsabilidad separada.

## Avance

### 05/08/2026 — contrato ratificado y primera versión desplegable

Sesión de análisis con `amp:planificar` + primer incremento desplegable. **El contrato de 8 estados quedó ratificado, asentado y publicable**, sin construir todavía la familia por verbo.

- **Decisiones.** Registrada la Decisión Local-0057 (Contrato de planes de ocho estados en un solo eje); la Decisión Local-0005 (estados en un solo eje) quedó `reemplazada por 0057`. El punto de fondo era que 8 estados reabría a Local-0005, que había rechazado la distinción diseño/ejecución: ahora aporta porque cada estado tiene una habilidad por verbo que lo mueve y `Listo` es la compuerta entre analizar y ejecutar.
- **Nombres.** La familia se nombra **verbo+objeto** (`crear-plan`, `analizar-plan`, `pausar-plan`…, y el futuro `ejecutar-plan`), por consistencia con los otros seis subsistemas y con la Decisión Local-0015; no verbo pelado.
- **Semántica.** El término Local-0032 (Pendiente) del glosario pasó de tres a seis no-terminales.
- **Contrato en disco.** `ESTADOS.md` reescrito a los 8 estados con transiciones y el dato `estado_a_retomar`; `PLANES.md`, `README` y `MANIFIESTO` del subsistema alineados.
- **Operable y controlado.** `ciclo-de-plan` —que ya lee los estados de `ESTADOS.md`, no los hardcodea— gana el manejo de `estado_a_retomar` al pausar/retomar; `lint-planes` lo hace cumplir (presente y válido en `En pausa`, ausente en el resto), con dos casos malos y un caso bueno en su banco.
- **Distribución.** `base/` sincronizado; `amp` 0.30.0, `amp-planes` 0.8.0. Control de cierre verde salvo el desfase de versión esperado tras subir la versión (señal de "listo para publicar").

**Diferido a incrementos siguientes** (cada uno desplegable por su cuenta):

1. **Retirar `ciclo-de-plan` y construir la familia por verbo** (paso 3). El nombre está vetado (Terminología Farlopa Local-0035) y Local-0070 lo pide; el manejo de `estado_a_retomar` que hoy vive en `ciclo-de-plan` migra a `pausar-plan`/`retomar-plan`.
2. **Validar el grafo de transiciones** en `lint-planes` (hoy documentado en `ESTADOS.md`, no forzado por el lint).
3. **Envejecimiento de `En pausa`**: hoy el lint vigila la antigüedad solo de `En curso`; un plan pausado hace meses es igual de zombi.

## Criterios de cierre

- Los ocho estados y sus transiciones tienen una fuente de verdad única.
- Las habilidades, documentación, instalación y lint aplican el mismo contrato.
- `En curso` no presupone una forma particular de ejecución.
- `En pausa` es el único estado con `estado_a_retomar`.
- Todo plan diferido vuelve a `Análisis`.
- `priorizar` y `sugerir-siguiente-plan` son consultas sin efectos sobre los planes.
- Una instalación nueva y una actualización sobre un repositorio de prueba terminan con el lint verde.
