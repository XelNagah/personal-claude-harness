---
origen: agente-multiproposito
---

# Estados de planes

Define los estados disponibles para los planes de este repo y su semántica. Es la **fuente de verdad**: el lint (`lint-planes`) lee este archivo para validar la columna `Estado` de `PLANES.md` y el mapeo estado↔carpeta. Cambiar el juego de estados = editar esta tabla, no el código del lint.

> **Este archivo es del Agente Multipropósito y el nivelador lo reemplaza entero.** Los estados que suma el Propósito de un repo van en [`ESTADOS-LOCAL.md`](ESTADOS-LOCAL.md), que el nivelador no abre; escribirlos acá los pierde en la corrida siguiente, y con ellos quedan inválidos todos los planes que los usaban. El `lint-planes` lee los dos y valida que ninguno se repita.

Máquina de **un solo eje**: un plan está en exactamente **un** estado a la vez.

- **Estado** — nombre canónico (el valor que va en la columna `Estado` de `PLANES.md`).
- **Sentido** — qué significa que un plan esté en ese estado.
- **Carpeta** — subcarpeta de `planes/` donde vive el archivo del plan mientras está en ese estado.
- **Terminal** — `sí` si es un estado de cierre (el plan ya no se mueve); `no` si sigue vivo.

| Estado | Sentido | Carpeta | Terminal |
|--------|---------|---------|----------|
| Nuevo | Creado; todavía sin ejecutar. La revisión de alto nivel (con `planificar`) ocurre acá, antes de arrancar. | `pendientes/` | no |
| En curso | Se tomó el plan y se está **ejecutando**. | `pendientes/` | no |
| Diferido | Pospuesto a propósito; retomable más adelante. | `pendientes/` | no |
| Ejecutado | Terminado con éxito. | `ejecutados/` | sí |
| Descartado | Abandonado; no se hará (motivo obligatorio en el archivo del plan, en una sección `## Notas de cierre`). | `descartados/` | sí |

No hay estado de "diseño": todo plan `Nuevo` se revisa en alto nivel antes de ejecutarse, así que la revisión es parte de estar `Nuevo`, no un estado aparte. El lint vigila la antigüedad del estado **activo** (`En curso`) — un plan que se está ejecutando hace demasiado y quedó frenado (ver la constante `VIGILAR_ANTIGUEDAD` en `lint-planes.js`).

## Transiciones

```
  Nuevo ──────► En curso ──────► Ejecutado
    │              │             (terminal)
    ├──► Diferido ◄┘   (retomable → En curso)
    │
    └──► Descartado   (terminal, con motivo)
```

- `Nuevo` → En curso · Diferido · Descartado
- `En curso` → Diferido · Ejecutado · Descartado
- `Diferido` → En curso · Descartado
- `Ejecutado` — terminal
- `Descartado` — terminal

## Cómo cambiar los estados

Un estado propio del Propósito se agrega en [`ESTADOS-LOCAL.md`](ESTADOS-LOCAL.md), no acá: esta tabla la reemplaza el nivelador. Reglas que el lint espera, valgan para el archivo que valgan:

- Cada estado no-terminal debe mapear a una carpeta que exista bajo `planes/`.
- Debe haber al menos un estado terminal por carpeta de cierre.
- El valor de la columna `Estado` en `PLANES.md` debe coincidir exactamente con un `Estado` de alguno de los dos archivos.
- Un estado de `ESTADOS-LOCAL.md` no puede repetir uno de acá: el del Agente Multipropósito manda, y el mismo nombre en los dos deja al de abajo pisando al de arriba en silencio, con otra carpeta o distinta terminalidad.
