# Gestión de scripts

Instala la convención de scripts del repo: cada herramienta en su carpeta `<tool>/` con un README, listadas en un registro-tabla, con un lint. Ordena el **cementerio de scripts** — esa carpeta llena de archivos sueltos sin saber qué son, de dónde salieron ni cómo se usan. Mismo patrón que glosario/decisiones.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `scripts/INDICE.md` y cada entrada abre la carpeta `<tool>/`.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md                          # sección "Scripts del proyecto"
├── scripts/
│   ├── INDICE.md                      # tabla: Tool | Qué hace | Cómo se corre | Estado
│   ├── <tool>/
│   │   ├── README.md                  # ficha del tool
│   │   └── ...                        # el código
│   └── lint-scripts/
│       ├── README.md
│       └── lint-scripts.js            # lint mecánico (sin LLM, sin red)
└── memory/
    └── feedback_scripts.md            # la convención, como memoria (+ índice)
```

## Idea

Cada script en su carpeta `<tool>/` con README (la ficha); el `INDICE.md` es la tabla escaneável.

| Tool | Qué hace | Cómo se corre | Estado |
|------|----------|---------------|--------|
| [scraper-precios](scraper-precios/) | Baja precios de la competencia | `node scraper-precios/run.js` | vigente |
| [gen-audio](gen-audio/) | Genera TTS de los informes | `python gen-audio/main.py <txt>` | experimental |

- **Propósito general:** ahí puede vivir cualquier cosa — scrapers, generadores de audio, helpers de API, lo que el agente necesite para cumplir el propósito del repo.
- **Ficha por tool:** el `<tool>/README.md` carga el detalle (uso completo, args, dependencias, quién lo referencia por ruta, y el origen si aporta). La tabla queda liviana.
- **`Estado`** marca el cruft: un `obsoleto` es candidato a depurar. Si no se sabe qué hace un script viejo, se marca obsoleto y se reporta — no se inventa propósito.
- **Lint** — README por tool, registro completo, ninguna fila colgada, y **refs por ruta en `settings` resuelven** (el bug de pre-autorización que rompe mover un script referenciado por ruta).

Otras memorias, planes o conocimiento referencian estos scripts por su ruta explicando cómo usarlos en su contexto.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-scripts/SKILL.md`](skills/inicializar-scripts/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-scripts/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
