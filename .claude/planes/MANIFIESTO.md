# Planes — manifiesto de subsistema

Los planes se persisten en este directorio (`planes/`): `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/` y `descartados/` (con motivo). Nombre estable sin fecha; estado y fechas viven en el registro `PLANES.md`, y los estados disponibles (carpeta y si son terminales) en `ESTADOS.md` — configurable, que el lint lee. Ciclo completo en la memoria `feedback_flujo_planes.md`.

**Índice: NO se carga siempre** (decisión 0017 — `PLANES.md` es el registro más pesado del repo). El agente sabe que los planes existen; **consultar `PLANES.md` a demanda** cuando un plan se vuelve relevante (la Pantalla de bienvenida da el conteo al arrancar). Al cerrar una tarea que tocó planes, correr el lint desde la raíz del repo:

```bash
node .claude/planes/lint-planes/lint-planes.js
```
