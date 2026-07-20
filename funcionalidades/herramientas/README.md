# Gestión de Herramientas

Instala la convención de **Herramientas** del repo: las *tools* que el propósito del repo requiere y el agente invoca para tareas repetibles — tipos `script`, `skill` local, `MCP` local — listadas en un registro-tabla con un lint. Ordena el **cementerio de tools** — esa carpeta llena de archivos sueltos sin saber qué son, de dónde salieron ni cómo se usan. Mismo patrón que glosario/decisiones.

> **Subsistema de acumulación** — sigue el patrón índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el índice es `herramientas/INDICE.md` y cada entrada es una tool (un `script` abre su carpeta `<tool>/`; una `skill`/`MCP` se linkea donde vive).
>
> **Ojo — los lints de subsistema NO son Herramientas.** Son infra del Patrón de cada subsistema y viven con su subsistema (`<repo>/<sub>/lint-<sub>/`). Este subsistema cataloga solo las tools de dominio que sirven al propósito.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md                          # sección "Herramientas del proyecto" (CLAUDE.md = adaptador)
├── .claude/herramientas/
│   ├── INDICE.md                      # tabla: Herramienta | Tipo | Qué hace | Cómo se invoca | Estado
│   ├── <tool>/                        # una tool tipo script
│   │   ├── README.md                  # ficha del tool
│   │   └── ...                        # el código
│   └── lint-herramientas/
│       ├── README.md
│       └── lint-herramientas.js       # lint mecánico (sin LLM, sin red)
└── .claude/memoria/
    └── feedback_herramientas.md       # la convención, como memoria (+ índice)
```

## Idea

Cada tool en el registro con su **Tipo**. Un `script` vive en su carpeta `<tool>/` con README; una `skill` en `<repo>/skills/`; un `MCP` en `.mcp.json`. El `INDICE.md` es la tabla escaneable que los ordena a todos.

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [scraper-precios](scraper-precios/) | script | Baja precios de la competencia | `node scraper-precios/run.js` | vigente |
| [cerrar-balance](../skills/cerrar-balance/) | skill | Cierra el balance mensual | skill `cerrar-balance` (la dispara el modelo) | vigente |
| gnucash | mcp | Acceso a la contabilidad gnucash | server MCP en `.mcp.json`; expone tool-calls `gnucash_*` | experimental |

- **Del Propósito:** ahí puede vivir cualquier cosa que el agente necesite para cumplir el propósito del repo — scrapers, generadores, skills de dominio, un MCP dedicado.
- **Ficha por tool:** un `script` carga el detalle en su `<tool>/README.md` (uso, args, deps, quién lo referencia por ruta, origen); una `skill`/`MCP` se describe con su descriptor nativo. La tabla queda liviana.
- **`Estado`** marca el cruft: un `obsoleto` es candidato a depurar. Si no se sabe qué hace un script viejo, se marca obsoleto y se reporta — no se inventa propósito.
- **Lint** — README por herramienta local, registro completo, ninguna fila colgada, y **refs por ruta de lint en `settings` resuelven** (el bug de pre-autorización que rompe mover algo referenciado por ruta).

Otras memorias, planes o conocimiento referencian estas tools por su ruta explicando cómo usarlas en su contexto.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-herramientas/SKILL.md`](skills/inicializar-herramientas/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-herramientas/PLANTILLA.md) |
