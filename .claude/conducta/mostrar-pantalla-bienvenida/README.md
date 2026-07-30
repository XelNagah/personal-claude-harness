# mostrar-pantalla-bienvenida

Script del subsistema `conducta`. Emite la **Pantalla de bienvenida** del Agente Multipropósito: un bloque de estado con Título + Propósito (de la **Identidad del Agente**) + métricas de cada subsistema (entradas) + estado de lint.

Es lo que corre la **Regla Base `correr`** del momento `al arrancar la sesión`: al iniciar la sesión, el hook repartidor `establecer-conducta` lo ejecuta y reenvía su salida. La skill `amp:info` muestra la misma pantalla a demanda. Por eso vive co-ubicado con `conducta` (como el repartidor y el lint) y no en el registro de Herramientas: es infra de una Regla Base, no una tool del Propósito.

## Cómo se invoca

```bash
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --sin-lint   # rápido, no corre los lints
node .claude/conducta/mostrar-pantalla-bienvenida/mostrar-pantalla-bienvenida.js --hook       # para el repartidor: emite {"systemMessage": <caja>}
```

En `settings.json` el `SessionStart` llama al repartidor `establecer-conducta`, que lee el registro de reglas, encuentra la regla `correr` de la bienvenida y ejecuta este script con `--hook`, reenviando su stdout.

## Cómo funciona

- **Descubrimiento dinámico:** un subsistema es un dir hijo de `.claude/` con su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js`. Sumar un subsistema con su lint lo hace aparecer solo, sin tocar este script.
- **Conteo de entradas:** genérico — filas de tabla si el índice es una tabla, si no bullets con link. Nombre del índice por prioridad (`INDICE.md` · `MEMORIA.md` · `PLANES.md` · `PREFERENCIAS.md`).
- **Enriquecimientos baratos:** `planes` desglosa los estados vivos; `preferencias` desglosa las del Agente Multipropósito y las del repo. El sustantivo por subsistema (memorias, términos…) es cosmético; los desconocidos caen a "entradas".
- **Lint:** corre cada `lint-<D>` (sin `--quiet`: ese flag da exit ≠ 0 en algunos lints artesanales) y suma los `(N)` de la salida, igual que `ejecutar-control-cierre`.
- **Identidad:** lee `.claude/identidad.md` (Título + Propósito). Tolerante a indefinido → muestra `<sin definir>`.

## Emisión (verificado)

Un `SessionStart` hook **no muestra un banner** propio como el logo del CLI. El único campo que se muestra en la terminal del usuario es `systemMessage`; el stdout crudo iría a `additionalContext`, que solo ve el modelo. Por eso `--hook` emite `{"systemMessage": <caja>}`. Sin `--hook`, la caja va envuelta en cerca de código para el transcript (skill `amp:info` y corridas a mano).
