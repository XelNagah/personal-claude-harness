# pantalla-bienvenida

Herramienta local de este repo (tipo `script`). Emite la **Pantalla de bienvenida** del Agente Multipropósito (glosario): un bloque de estado con Título + Propósito (de la **Identidad del Agente**) + métricas de cada subsistema (entradas) + estado de lint. Pensada para correr al arrancar la sesión (hook `SessionStart`) y también a mano.

Es la **pasada A** (Herramienta local) del plan `Pantalla de bienvenida del Agente Multipropósito`; el núcleo está pensado para promoverse después a funcionalidad distribuible (B) sin rediseño.

## Cómo se invoca

```bash
node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js
node .claude/herramientas/pantalla-bienvenida/pantalla-bienvenida.js --sin-lint   # rápido, no corre los lints
```

En `settings.json` está enganchada a un hook `SessionStart`: su salida entra al contexto del agente y se ve en el transcript.

## Cómo funciona

- **Descubrimiento dinámico (Postura 2):** un subsistema es un dir hijo de `.claude/` con su lint co-ubicado `.claude/<D>/lint-<D>/lint-<D>.js` (decisión 0008). Sumar un subsistema con su lint lo hace aparecer solo, sin tocar este script.
- **Conteo de entradas:** genérico — filas de tabla si el índice es una tabla, si no bullets con link. Nombre del índice por prioridad (`INDICE.md` · `MEMORIA.md` · `PLANES.md` · `PREFERENCIAS.md`).
- **Enriquecimientos baratos:** `planes` desglosa los estados vivos; `preferencias` muestra versión de Base + cantidad de adaptaciones. El sustantivo por subsistema (memorias, términos…) es cosmético; los desconocidos caen a "entradas".
- **Lint:** corre cada `lint-<D>` (sin `--quiet`: ese flag da exit ≠ 0 en algunos lints artesanales) y suma los `(N)` de la salida, igual que `control-cierre`.
- **Identidad:** lee `.claude/identidad.md` (Título + Propósito). Tolerante a indefinido → muestra `<sin definir>`.

## Techo (verificado)

Un `SessionStart` hook **no pinta un banner** propio como el logo del CLI: lo máximo es un bloque de texto en el transcript (`additionalContext`). `sessionTitle` en el header queda pendiente de sumar.

## Límites de la pasada A

- No es distribuible todavía (vive solo en este repo).
- `sessionTitle` no seteado aún.
- El conteo genérico depende de la forma del índice; la evolución (Postura 3, auto-reporte por subsistema) coincide con el plan `Subsistemas que explican cómo funcionan y su estado`.
