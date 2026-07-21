# ejecutar-control-cierre

Corre **todos los chequeos del repo de una pasada** y resume el resultado. Es el control que se pasa antes de cerrar una tarea o publicar: reemplaza correr ~10 comandos a mano.

```bash
node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js
```

## Qué corre

1. **Todos los lints de subsistema**, descubiertos dinámicamente (no hardcodeados): cualquier `.claude/**/lint-*/lint-*.js` — hoy: conocimiento, decisiones, glosario, harness, herramientas, memoria, planes, preferencias. Un subsistema nuevo con su lint co-ubicado (decisión 0008) entra solo.
2. **`claude plugin validate .`** — validación del marketplace. Si el CLI no está disponible, lo reporta como `NO DISPONIBLE` (no como error).

## Salida

Tabla chequeo → `OK` / `N HALLAZGO(S)` / `ERROR`. La salida completa se muestra **solo** de los chequeos que no están verdes. Si todo pasa: `TODO VERDE.`

## Cómo cuenta hallazgos

Heurística sobre el formato común de la familia de lints: suma los `(N)` finales de las líneas de categoría (`[1] LINKS ROTOS (2):` → 2). Un lint nuevo que respete ese formato se cuenta bien sin tocar este script.

Sin `process.exit(1)`: reporta, no frena (decisión 0003, capa mecánica).
