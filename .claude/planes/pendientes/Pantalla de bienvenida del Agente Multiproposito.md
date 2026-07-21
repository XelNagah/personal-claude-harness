# Pantalla de bienvenida del Agente Multipropósito

**Estado:** En curso. Diseñado con `planificar` (26-07-20). Pasada A ejecutada (26-07-20). **Corrección de raíz + refinamiento visual (26-07-21):** ver sección "Corrección de mecanismo" abajo. Sigue vivo por la distribución (pasada B).

## Qué es

Al arrancar una sesión, el Agente Multipropósito emite una **Pantalla de bienvenida** (glosario): un bloque de estado con el Título + Propósito del repo y métricas de cada subsistema (cuántas memorias, planes por estado, términos de glosario, decisiones, herramientas, páginas de conocimiento) + estado de lint. Análogo en intención al logo de Claude Code, con el techo de abajo.

## Decisiones de diseño (acordadas)

- **Alcance A→B.** Pasada 1 = **Herramienta local** de este repo (`.claude/herramientas/`), no distribuible. Diseñar el núcleo portable para promoverlo después a **funcionalidad/plugin distribuible** (B) que viaje a todo repo consumidor, sin rediseño (solo traslado: marketplace + orquestador + junctions dobles + hook doble Claude/Codex).
- **Disparo/forma.** Un **script** = núcleo (arma y emite el bloque), enganchado a un **SessionStart hook** que lo manda como `additionalContext` + setea `sessionTitle` (Título del repo al header). El mismo script invocable a mano (tipo `/estado`) para no depender solo del arranque.
- **Techo real (corregido 26-07-21 — la versión previa era falsa):** un SessionStart hook **no pinta un banner** propio como el logo del CLI. El stdout crudo y `additionalContext` van **solo al modelo** (invisibles al usuario) — la premisa anterior ("full-visible en el transcript vía `additionalContext`") era **incorrecta**, y por eso la pasada A no mostraba nada. El único campo que **sí** pinta la terminal del usuario es **`systemMessage`** (JSON de salida del hook). Verificado online + en vivo. Dispara en `startup`/`resume`/`clear`/`compact`; corre en cada arranque → tiene que ser **rápido**.
- **Agregación = Postura 2 (descubrimiento dinámico).** El script camina `.claude/*/` como `control-cierre` camina los `lint-*/`, y de cada subsistema saca su cuenta + estado de lint. **Reuso fuerte:** `control-cierre` ya descubre y corre cada lint contando hallazgos (`countFindings`); el dashboard es casi *"control-cierre + una cuenta por índice + un título"*, capa de presentación sobre la misma lógica. Cero edición al sumar subsistemas.
- **Título/Propósito:** los lee de la **Identidad del Agente** (`.claude/identidad.md`, plan aparte). Tolerante a indefinido → muestra `<sin definir>` hasta que exista.

## Esqueleto acordado (DUMMY)

```
┌─────────────────────────────────────────────┐   [DUMMY]
│  <nombre-del-repo>                            │
│  Propósito: <una línea>                       │
├─────────────────────────────────────────────┤
│  Subsistemas: 7          Lint: ✔ 0 hallazgos  │
│  · memoria         8 memorias                 │
│  · planes         24  (3 nuevos·1 en curso)   │
│  · glosario       22 términos                 │
│  · decisiones     11 vigentes                 │
│  · herramientas    6                          │
│  · conocimiento    0 páginas                  │
│  · preferencias   Base v3 · 1 adaptación      │
└─────────────────────────────────────────────┘
```

## Corrección de mecanismo (26-07-21)

La pasada A emitía el bloque por `additionalContext` → solo lo veía el modelo, nunca el usuario (`/clear` no mostraba nada). Investigación (online + prueba en vivo) y arreglo:

- **Mecanismo correcto: `systemMessage`.** Único campo del JSON de un SessionStart hook que se pinta en la terminal del **usuario**. Decisión 0012.
- **Cross-agente:** Claude Code (CLI, no VS Code), Codex y Gemini soportan `systemMessage` al arrancar. **Cursor no** (solo `additional_context`, va al modelo) → degrada sin caja. En Claude Code el stdout crudo del hook se veía hasta v2.1.15 y lo mandaron a contexto en v2.1.37+ (regresión #24425).
- **Herramienta:** `pantalla-bienvenida.js` ganó el flag **`--hook`** (emite `{"systemMessage": "\n" + caja}`, sin cerca ``` porque los backticks saldrían literales; con salto inicial para separarse del prefijo `SessionStart:… says:` que antepone el CLI). Sin flag sigue emitiendo la caja con cerca ``` para `/info` y corridas a mano. `settings.json` pasa `--hook`.
- **Caja de ancho automático:** se dimensiona al renglón más largo (piso 74, techo de envoltura 82) → no se desarma cuando una métrica gana dígitos.
- **Métrica de planes por carpeta:** `N (P pendientes · E ejecutados · D descartados)`, derivada de `ESTADOS.md` (no hardcodea estados → respeta 0005); la suma = total. Glosario: concepto *Pendiente*.

**Falta de la pasada B (sin cambios):** distribución como plugin, hook doble Claude/Codex(/Gemini), `sessionTitle` al header, decidir `source`.

## Relación con otros planes

- **Materializa la mitad "estado dinámico" de `Subsistemas que explican cómo funcionan y su estado`** (índice + lint). La **Postura 3** (auto-reporte por manifiesto) de la agregación es la evolución natural en B y **es** ese plan pendiente — no es deuda, es escalón futuro.
- **Marca "AMP":** el prefijo de marca del harness está gated por el plan #2 (renombre a Agentes Multi Propósito). Pasada 1 muestra Título + Propósito del repo; la marca se suma cuando caiga el renombre.
- **Depende de** `Identidad del Agente` para el título (pero arranca sin ella, mostrando `<sin definir>`).

## Abierto (para la ejecución)

- **Regla de conteo por forma de índice:** memoria = lista de bullets; herramientas/glosario/decisiones/planes = tablas; conocimiento = páginas. El conteo genérico tiene que aguantar ambas formas (o degradar a "N entradas" contando líneas de tabla/bullet).
- **¿En qué `source` dispara?** ¿Solo `startup`/`clear`, o también `resume`/`compact`? Compact es mitad de sesión → quizás ruidoso.
- **Candidato a decisión** al ejecutar: formalizar que el Agente emite Pantalla de bienvenida y que existe la Identidad como dato estructural.
