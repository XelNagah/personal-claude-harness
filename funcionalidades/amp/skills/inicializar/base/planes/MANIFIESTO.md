# Planes — manifiesto de subsistema

Los planes se persisten en este directorio (`planes/`): `pendientes/` (planes vivos: `Nuevo`, `Análisis`, `Listo`, `En curso`, `En pausa`, `Diferido`), `ejecutados/` y `descartados/` (con motivo). Nombre estable sin fecha; estado y fechas viven en el registro `PLANES.md`, y los estados disponibles (carpeta y si son terminales) en `ESTADOS.md`, con los que suma el Propósito en `ESTADOS-LOCAL.md` — configurable, que el lint lee. El flujo completo está en el `README.md` de este subsistema.

**Disparador:** el agente sabe que los planes existen; consultar `PLANES.md` a demanda cuando un plan se vuelve relevante — retomar, cerrar, o al detectar que un pendiente ya se implementó (la Pantalla de bienvenida da el conteo al arrancar). Escribir al abrir un plan o transicionarlo de estado.

**Skills:** familia por verbo — `crear-plan` y `analizar-plan` abren y afinan; `explicar-plan`, `priorizar-planes` y `sugerir-siguiente-plan` son de solo lectura; `pausar-plan`, `retomar-plan`, `diferir-plan`, `cerrar-plan` y `descartar-plan` transicionan por los estados de `ESTADOS.md`; instalación con `amp:inicializar`.

**Flujo de trabajo:** multi-paso (abrir → transicionar → cerrar con lint); detalle en `README.md`.

**Índices:** `PLANES.md` (Agente Desplegado). **No se carga siempre** (es el registro más pesado del repo); se consulta a demanda, no en cada arranque. Al cerrar una tarea que tocó planes, correr el lint desde la raíz del repo:

```bash
node .claude/planes/lint-planes/lint-planes.js
```
