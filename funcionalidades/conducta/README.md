# Conducta

Instala el subsistema **conducta**: asegura comportamientos del tipo **"cuando hagas X, asegurate de Y"** atando **momentos** del flujo a **acciones**. La regla no vive cargada al arranque —donde se recita y no se obedece (conocimiento `modos-de-falla-ante-reglas-escritas`)— sino que un **hook repartidor** la entrega en el momento en que hace falta. Modelo en la decisión 0021 (control de terminología en dos niveles, decisión 0025).

> **Subsistema de acumulación** — índice + entradas + lint del harness ([cómo aprende](../../README.md#cómo-aprende)). Acá el "índice" es un registro de reglas que **no se carga en contexto**: lo consume el hook, no el arranque.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md                              # línea @.claude/conducta/MANIFIESTO.md en "Subsistemas" (CLAUDE.md = adaptador)
├── .claude/settings.json                  # cableado del hook: UserPromptSubmit + PreToolUse Write|Edit (merge, sin pisar)
├── .codex/hooks.json                      # cableado Codex: solo UserPromptSubmit (paridad del momento `cada turno`)
├── .claude/conducta/
│   ├── MANIFIESTO.md                      # manifiesto de subsistema (siempre en contexto; NO importa índice)
│   ├── INDICE.md                          # registro de reglas: Reglas Base + Reglas del Propósito
│   ├── MOMENTOS.md                        # vocabulario de momentos (evento de hook + condición sin juicio)
│   ├── establecer-conducta/
│   │   ├── establecer-conducta.js         # hook repartidor (lee el registro vivo, emite additionalContext)
│   │   └── README.md
│   └── lint-conducta/
│       ├── lint-conducta.js               # lint del registro contra el vocabulario (sin LLM, sin red)
│       └── README.md
└── .claude/memoria/
    └── feedback_conducta.md               # la convención, como memoria (+ índice)
```

## Idea: momentos → acciones, entregadas por un hook

- **Un momento** es un **evento de hook + una condición que la máquina evalúa sin juicio** (decisión 0021): `cada turno` (`UserPromptSubmit`), `al escribir` (`PreToolUse` sobre un `.md` bajo `.claude/`), `al cerrar tarea` (`Stop`, aún sin repartidor). Viven en `MOMENTOS.md`, agente-agnósticos: cada agente declara con qué mecanismo realiza cada uno.
- **Una acción** tiene tres clases: `inyectar` (el agente lee un texto y actúa con su juicio) · `correr` (una Herramienta lo resuelve sin juicio) · `bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible).
- **El registro de reglas (`INDICE.md`) NO se carga en contexto.** Ese es el punto: una regla cargada al inicio se recita, no se obedece. El **hook repartidor** `establecer-conducta` lee el registro **vivo** en cada momento y entrega solo la regla que corresponde, cerca del punto de acción. Agregar o cambiar una regla **no toca el hook**.
- **Base vs Propósito (decisión 0027):** el registro se parte en dos secciones — `## Reglas Base` (las manda el harness; el nivelador `amp-actualizar` las reemplaza enteras) y `## Reglas del Propósito` (las suma cada repo; el nivelador no las toca). Molde de `PREFERENCIAS.md` (Base/Adaptaciones).
- **Base instalada:** respetar las preferencias cargadas, no acuñar terminología, preguntar antes de redefinir/remover algo canónico (momento `cada turno`) y contrastar lo escrito contra la sabiduría del repo (momento `al escribir`).

## Gobernanza

Toda regla nueva que toque terminología o decisiones pasa por el usuario (decisiones 0004/0016): el agente propone; ratificar es potestad del usuario. En el flujo normal el agente **no** consulta el registro a mano — lo entrega el hook; se edita solo para **agregar, modificar o dar de baja** una regla.

## Dependencias

`memoria-local` (la convención se persiste como una memoria tipada e indexada).

## Paridad entre agentes

`cada turno` (`UserPromptSubmit` + `additionalContext`) tiene paridad plena Claude Code ↔ Codex. `al escribir` es **Claude-first**: el `PreToolUse` de Codex intercepta solo Bash (decisión 0021), así que ese momento no es realizable ahí sin desviar por Bash — degradación explícita, documentada en `MOMENTOS.md`, no rota en silencio.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill de instalación (Claude Code) | [`skills/inicializar-conducta/SKILL.md`](skills/inicializar-conducta/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-conducta/PLANTILLA.md) |

> Skills de **operación** (gestión del registro de reglas): ninguna aún — las entrega el hook repartidor. Las de gestión quedan pendientes (plan de construcción del subsistema).
