---
origen: agente-multiproposito
---

# Estados de planes

Define los estados disponibles para los planes de este repo y su semántica. Es la **fuente de verdad**: el lint (`lint-planes`) lee este archivo para validar la columna `Estado` de `PLANES.md` y el mapeo estado↔carpeta. Cambiar el juego de estados = editar esta tabla, no el código del lint.

> **Este archivo es del Agente Multipropósito y el actualizador lo reemplaza entero.** Los estados que suma el Propósito de un repo van en [`ESTADOS-LOCAL.md`](ESTADOS-LOCAL.md), que el actualizador no abre; escribirlos acá los pierde en la corrida siguiente, y con ellos quedan inválidos todos los planes que los usaban. El `lint-planes` lee los dos y valida que ninguno se repita.

Máquina de **un solo eje**: un plan está en exactamente **un** estado a la vez.

- **Estado** — nombre canónico (el valor que va en la columna `Estado` de `PLANES.md`).
- **Sentido** — qué significa que un plan esté en ese estado.
- **Carpeta** — subcarpeta de `planes/` donde vive el archivo del plan mientras está en ese estado.
- **Terminal** — `sí` si es un estado de cierre (el plan ya no se mueve); `no` si sigue vivo.

| Estado | Sentido | Carpeta | Terminal |
|--------|---------|---------|----------|
| Nuevo | Registrado, pero todavía sin analizar. | `pendientes/` | no |
| Análisis | Se delimita, contrasta o ajusta el plan antes de dejarlo listo para ejecutar. | `pendientes/` | no |
| Listo | Analizado y suficientemente definido para iniciar su ejecución. | `pendientes/` | no |
| En curso | Se está **ejecutando**; el contrato no impone cómo se realiza esa ejecución. | `pendientes/` | no |
| En pausa | El análisis o la ejecución se interrumpieron temporalmente con intención de retomarlos. | `pendientes/` | no |
| Diferido | Pospuesto a propósito para revisarlo más adelante. | `pendientes/` | no |
| Ejecutado | Terminado con éxito (notas de implementación obligatorias en el archivo del plan). | `ejecutados/` | sí |
| Descartado | No se hará; motivo obligatorio en el archivo del plan, en una sección `## Notas de cierre`. | `descartados/` | sí |

Los seis estados vivos comparten carpeta (`pendientes/`): lo que los distingue es la columna `Estado`, no dónde vive el archivo. El lint vigila la antigüedad del estado **activo** (`En curso`) — un plan que se está ejecutando hace demasiado y quedó frenado (ver la constante `VIGILAR_ANTIGUEDAD` en `lint-planes.js`).

## Transiciones

```
  Nuevo ──► Análisis ──► Listo ──► En curso ──► Ejecutado
    │          │  ▲        │          │        (terminal)
    │          │  └────────┘          │
    │          ▼                      ▼
    │       En pausa ────────────► (vuelve a Análisis o En curso)
    │          │
    ├──► Diferido ──► Análisis
    │
    └──► Descartado   (terminal, con motivo)
         ▲
         └── se llega desde CUALQUIER estado vivo, incluidos En pausa y Diferido
```

El **grafo autoritativo** es esta tabla —la fuente única que lee el lint—: `Desde` es un estado y `Hacia` sus destinos válidos, separados por coma (`—` si es terminal). El diagrama de arriba la ilustra; si divergen, manda la tabla.

| Desde | Hacia |
|-------|-------|
| Nuevo | Análisis, Diferido, Descartado |
| Análisis | Listo, En pausa, Diferido, Descartado |
| Listo | Análisis, En curso, Diferido, Descartado |
| En curso | En pausa, Diferido, Ejecutado, Descartado |
| En pausa | Análisis, En curso, Diferido, Descartado |
| Diferido | Análisis, Descartado |
| Ejecutado | — |
| Descartado | — |

**Un plan se puede abandonar desde cualquier estado vivo**: los seis no-terminales llegan a `Descartado`. Lo que sí queda restringido es volver al trabajo: `Diferido` vuelve siempre a `Análisis`, nunca directo a `Listo` ni a `En curso`, porque después de una postergación hay que revalidar que el plan siga vigente.

### El dato `estado_a_retomar`

`En pausa` conserva obligatoriamente `estado_a_retomar`, cuyo único valor válido es `Análisis` o `En curso`. Al retomar, el plan vuelve exactamente a ese valor y el dato se elimina. Al pasar a `Diferido` se elimina cualquier `estado_a_retomar`; los estados terminales no lo llevan.

Esos dos valores **no se declaran aparte: son los estados desde los que se llega a `En pausa`**, que la tabla de arriba ya declara (`Análisis` y `En curso` la nombran entre sus destinos). Retomar es deshacer la pausa, así que el destino de retomada es por definición el origen de la pausa, y el lint lo deriva de ahí. ⚠️ **No se deriva de la fila `En pausa`**: esa fila enumera todas sus salidas, y desde que incluye las de cierre, derivar de ahí haría pasar por válido un `estado_a_retomar: Descartado`.

Ese dato vive en el **archivo del plan**, no en `PLANES.md`: es transitorio del plan pausado. El registro conserva estado, fechas, origen y notas.

## Cómo cambiar los estados

Un estado propio del Propósito se agrega en [`ESTADOS-LOCAL.md`](ESTADOS-LOCAL.md), no acá: esta tabla la reemplaza el actualizador. Reglas que el lint espera, valgan para el archivo que valgan:

- Cada estado no-terminal debe mapear a una carpeta que exista bajo `planes/`.
- Debe haber al menos un estado terminal por carpeta de cierre.
- El valor de la columna `Estado` en `PLANES.md` debe coincidir exactamente con un `Estado` de alguno de los dos archivos.
- Un estado de `ESTADOS-LOCAL.md` no puede repetir uno de acá: el del Agente Multipropósito manda, y el mismo nombre en los dos deja al de abajo pisando al de arriba en silencio, con otra carpeta o distinta terminalidad.
