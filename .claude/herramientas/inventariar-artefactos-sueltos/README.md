# inventariar-artefactos-sueltos

Barre `.claude/` y lista los **artefactos (archivos y carpetas) que no pertenecen a ningún subsistema ni a la infra conocida**. Cierra la mitad barata del punto ciego del plan [Que el harness tenga efecto conductual](../../planes/pendientes/Que%20el%20harness%20tenga%20efecto%20conductual.md), frente B: los 8 lints solo miran adentro de su propio subsistema; nada reportaba lo que quedó afuera.

**Inventaría, no juzga.** Solo dice "esto está fuera de todo subsistema"; qué hacer con cada cosa lo decide un humano (los criterios para juzgar son el frente A, todavía sin escribir).

```bash
node .claude/herramientas/inventariar-artefactos-sueltos/inventariar-artefactos-sueltos.js            # este repo (cwd)
node .claude/herramientas/inventariar-artefactos-sueltos/inventariar-artefactos-sueltos.js <rutaRepo> # apuntar a un consumidor
node .claude/herramientas/inventariar-artefactos-sueltos/inventariar-artefactos-sueltos.js --quiet     # calla si no hay sueltos
```

## Alcance: solo `.claude/`

Opción acordada el 21/07/2026. La raíz del repo **no se toca**: en un repo consumidor está llena del Propósito real (código, datos), y separar "del proyecto" de "harness mal puesto" necesita los criterios del frente A. Barrer `.claude/` sí es decidible hoy sin ruido — ahí solo deben vivir los subsistemas + infra. Extender a la raíz espera a que A tenga criterios.

## Cómo clasifica

Cada hijo directo de `.claude/` cae en una de tres:

1. **Subsistema reconocido** — carpeta con su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js` (decisión 0008). Mismo criterio que `mostrar-pantalla-bienvenida`, una sola fuente. Una carpeta con nombre de subsistema pero **sin** su lint cae como suelta (señal de subsistema roto o a medio instalar).
2. **Infra conocida** — lista corta y estable: config de Claude Code (`settings.json`, `settings.local.json`), sus carpetas estándar (`skills`, `commands`, `agents`, `hooks`) y la Identidad del Agente (`identidad.md`). De más esconde lo mal puesto; de menos, cría falsos positivos.
3. **Artefacto suelto** — todo lo demás. Es lo que el chequeo reporta.

## Salida

Formato `[SECCIÓN] (N)` como el resto de la familia de lints (así `ejecutar-control-cierre` lo contaría bien si algún día se lo cablea — hoy corre suelto, a propósito: cablearlo ya sería emitir un veredicto, no inventariar). Con `--quiet` calla si no hay artefactos sueltos.

Sin `process.exit(1)`: reporta, no frena (decisión 0003, capa mecánica).
