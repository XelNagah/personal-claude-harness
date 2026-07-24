# Nivelador `amp-actualizar` de estructura

**Estado: Nuevo · Creado 26-07-24.** Desprendido del plan de distribución marketplace (mitad bloqueada). **Precondición resuelta:** `Separar origen Base y aprendido en los subsistemas` quedó diseñada (decisión 0027) ⇒ este plan se desbloqueó. Diseño del nivelador resuelto por `planificar` el 24/07/2026 (decisión 0028).

## Qué es

`amp-actualizar` = el **nivelador consolidado**: una sola skill que pone al día el `.claude/` de un repo que ya tiene el harness instalado, contra la plantilla nueva. Junta la idempotencia hoy repartida en las secciones "Reconciliación" de cada `inicializar-*`. Clasifica cada componente y reporta en tres grupos (`agregado` / `ya estaba` / `divergente→pregunta`), sin pisar lo divergente. Cubre el requisito duro: **actualizar los repos legacy sin romperles el comportamiento**.

## Por qué depende de la separación de origen

El problema de "cómo distingue lo que puede pisar de lo que no" se **disuelve** cuando cada subsistema separa Base (del harness) de aprendido (del repo): el nivelador reemplaza lo de Base entero y **nunca abre** lo del repo. Sin marcas invisibles dentro de archivos mixtos, sin parsear títulos. Por eso este plan espera al de separación de origen: sin esa base, el nivelador necesitaría marcadores endebles.

## Diseño resuelto (planificar 24/07/2026 → decisión 0028)

- **Una sola herramienta, dos modos:** si el repo es viejo, migra y después reconcilia; si ya está al día, solo reconcilia. Un comando, siempre el correcto.
- **Sin estado, por estructura:** compara la estructura actual contra la plantilla objetivo y converge (agrega lo ausente; aplica renombres conocidos como `glosario`→`semantica` al detectar la forma vieja). No guarda número de versión — los repos viejos no lo tienen. Idempotente.
- **Base** (lint, MANIFIESTO, estructura, cableado del hook) → **pisa sin preguntar, pero respalda** la versión vieja antes (`.claude/.respaldo-amp/<fecha>/`) y reporta al final solo lo que cambió. El respaldo es clave porque `.claude/` suele estar gitignoreado en el host (sin red de git).
- **Aprendido** (contenido del repo) → nunca se toca.
- **Reacomodo legacy** que pueda enredar contenido aprendido → **pregunta** antes (bloqueante).

## Falta para construir

- Cableado del hook de conducta en `settings.json` (instalar/actualizar el repartidor).
- El juego exacto de renombres conocidos (hoy: `glosario`→`semantica`; sumar los que aparezcan).
- Un modo previo (mostrar qué haría sin tocar nada).
- Formato del reporte de lo pisado + la ubicación del respaldo.
- Ratificar el nombre `amp-actualizar` (0016).
- Respetar 0024 (el texto distribuido no expone el registro de decisiones del harness).

## Cruces

- **Depende de:** `Separar origen Base y aprendido en los subsistemas`.
- **Hermano:** el plan de distribución marketplace (la otra mitad, no bloqueada: `plugins/`, prefijo `amp-`, `amp-inicializar`, subagentes).
- Absorbe la idempotencia de la decisión 0001; se apoya en 0024.

Correr por `planificar` al desbloquearse.
