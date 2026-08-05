# amp-planes

Instala y opera el ciclo de planes: registro `PLANES.md`, estados configurables, carpetas `pendientes/`, `ejecutados/` y `descartados/`, README y lint.

## Skills

Una familia por verbo, cada una con sus pasos y su cierre con el lint:

- `crear-plan` — registra un plan nuevo en `Nuevo`.
- `analizar-plan` — lo lleva por `Análisis` hasta `Listo`, reutilizando `amp:planificar`.
- `explicar-plan`, `priorizar-planes`, `sugerir-siguiente-plan` — solo lectura: explican una decisión, ordenan los planes vivos y proponen la próxima acción.
- `pausar-plan`, `retomar-plan`, `diferir-plan`, `cerrar-plan`, `descartar-plan` — transicionan un plan por los estados de `ESTADOS.md`, conservando registro, archivo y referencias sincronizados.
