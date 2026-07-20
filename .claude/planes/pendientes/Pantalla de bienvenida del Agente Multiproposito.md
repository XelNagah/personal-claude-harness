# Pantalla de bienvenida del Agente Multipropósito

**Estado:** Nuevo. Diseñado con `planificar` (26-07-20). Entendimiento compartido alcanzado; listo para ejecutar la pasada A.

## Qué es

Al arrancar una sesión, el Agente Multipropósito emite una **Pantalla de bienvenida** (glosario): un bloque de estado con el Título + Propósito del repo y métricas de cada subsistema (cuántas memorias, planes por estado, términos de glosario, decisiones, herramientas, páginas de conocimiento) + estado de lint. Análogo en intención al logo de Claude Code, con el techo de abajo.

## Decisiones de diseño (acordadas)

- **Alcance A→B.** Pasada 1 = **Herramienta local** de este repo (`.claude/herramientas/`), no distribuible. Diseñar el núcleo portable para promoverlo después a **funcionalidad/plugin distribuible** (B) que viaje a todo repo consumidor, sin rediseño (solo traslado: marketplace + orquestador + junctions dobles + hook doble Claude/Codex).
- **Disparo/forma.** Un **script** = núcleo (arma y emite el bloque), enganchado a un **SessionStart hook** que lo manda como `additionalContext` + setea `sessionTitle` (Título del repo al header). El mismo script invocable a mano (tipo `/estado`) para no depender solo del arranque.
- **Techo real (verificado, claude-code-guide 26-07-20):** un SessionStart hook **no pinta un banner** propio como el logo del CLI (ese banner es exclusivo del CLI, sin punto de extensión). Lo máximo: (a) bloque de texto full-visible en el transcript vía `additionalContext`, y (b) `sessionTitle` en el header. Dispara en `startup`/`resume`/`clear`/`compact`; corre en cada arranque → tiene que ser **rápido**.
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

## Relación con otros planes

- **Materializa la mitad "estado dinámico" de `Subsistemas que explican cómo funcionan y su estado`** (índice + lint). La **Postura 3** (auto-reporte por manifiesto) de la agregación es la evolución natural en B y **es** ese plan pendiente — no es deuda, es escalón futuro.
- **Marca "AMP":** el prefijo de marca del harness está gated por el plan #2 (renombre a Agentes Multi Propósito). Pasada 1 muestra Título + Propósito del repo; la marca se suma cuando caiga el renombre.
- **Depende de** `Identidad del Agente` para el título (pero arranca sin ella, mostrando `<sin definir>`).

## Abierto (para la ejecución)

- **Regla de conteo por forma de índice:** memoria = lista de bullets; herramientas/glosario/decisiones/planes = tablas; conocimiento = páginas. El conteo genérico tiene que aguantar ambas formas (o degradar a "N entradas" contando líneas de tabla/bullet).
- **¿En qué `source` dispara?** ¿Solo `startup`/`clear`, o también `resume`/`compact`? Compact es mitad de sesión → quizás ruidoso.
- **Candidato a decisión** al ejecutar: formalizar que el Agente emite Pantalla de bienvenida y que existe la Identidad como dato estructural.
