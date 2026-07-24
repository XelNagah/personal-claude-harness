# Nivelador `amp-actualizar` de estructura

**Estado: Nuevo · Creado 26-07-24.** Desprendido del plan de distribución marketplace (mitad bloqueada). **Depende de** `Separar origen Base y aprendido en los subsistemas` — no arranca hasta que ese ejecute.

## Qué es

`amp-actualizar` = el **nivelador consolidado**: una sola skill que pone al día el `.claude/` de un repo que ya tiene el harness instalado, contra la plantilla nueva. Junta la idempotencia hoy repartida en las secciones "Reconciliación" de cada `inicializar-*`. Clasifica cada componente y reporta en tres grupos (`agregado` / `ya estaba` / `divergente→pregunta`), sin pisar lo divergente. Cubre el requisito duro: **actualizar los repos legacy sin romperles el comportamiento**.

## Por qué depende de la separación de origen

El problema de "cómo distingue lo que puede pisar de lo que no" se **disuelve** cuando cada subsistema separa Base (del harness) de aprendido (del repo): el nivelador reemplaza lo de Base entero y **nunca abre** lo del repo. Sin marcas invisibles dentro de archivos mixtos, sin parsear títulos. Por eso este plan espera al de separación de origen: sin esa base, el nivelador necesitaría marcadores endebles.

## Trabajo propio (una vez desbloqueado)

- Construir la skill `amp-inicializar`/`amp-actualizar` (nombres a ratificar, 0016).
- Migración legacy: primera corrida sobre un repo instalado antes de la separación de origen — detectar y acomodar lo de Base sin pisar lo aprendido.
- Clasificación de componentes (estructura de Base / mixto / dominio puro) y reporte en tres grupos.
- Respetar 0024 (el texto distribuido no expone el registro de decisiones del harness).

## Cruces

- **Depende de:** `Separar origen Base y aprendido en los subsistemas`.
- **Hermano:** el plan de distribución marketplace (la otra mitad, no bloqueada: `plugins/`, prefijo `amp-`, `amp-inicializar`, subagentes).
- Absorbe la idempotencia de la decisión 0001; se apoya en 0024.

Correr por `planificar` al desbloquearse.
