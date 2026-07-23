# Planes — manifiesto de subsistema

Los planes se persisten en este directorio (`planes/`): `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (con motivo). Nombre estable sin fecha; estado y fechas viven en el registro `PLANES.md`, y los estados disponibles (carpeta y si son terminales) en `ESTADOS.md` — configurable, que el lint lee. Ciclo completo en la memoria `feedback_flujo_planes.md`.

**Disparador:** el agente sabe que los planes existen; consultar `PLANES.md` a demanda cuando un plan se vuelve relevante — retomar, cerrar, o al detectar que un pendiente ya se implementó (la Pantalla de bienvenida da el conteo al arrancar). Escribir al abrir un plan o transicionarlo de estado.

**Skills:** `ciclo-de-plan` (abre un plan —archivo con nombre estable + fila en `PLANES.md`— y lo transiciona de estado); instalación con `inicializar-gestion-planes`.

**Flujo de trabajo:** multi-paso (abrir → transicionar → cerrar con lint); detalle en la memoria `feedback_flujo_planes.md`.

**Índice: NO se carga siempre** (`PLANES.md` es el registro más pesado del repo); se consulta a demanda, no en cada arranque. Al cerrar una tarea que tocó planes, correr el lint desde la raíz del repo:

```bash
node .claude/planes/lint-planes/lint-planes.js
```
