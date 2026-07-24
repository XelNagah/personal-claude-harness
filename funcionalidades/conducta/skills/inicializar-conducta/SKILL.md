---
name: inicializar-conducta
description: Instala el subsistema conducta en el repo actual (.claude/conducta/ con registro de reglas INDICE.md —Reglas Base + Reglas del Propósito—, vocabulario MOMENTOS.md, hook repartidor establecer-conducta, lint, memoria y sección en AGENTS.md) y cablea el hook en settings.json. Las reglas "cuando hagas X, asegurate de Y" no se cargan al arranque: las entrega el hook en el momento que corresponde. Depende de memoria-local. Use when el usuario dice "inicializar conducta", "armá la conducta", "reglas de conducta", "efecto conductual".
---

# Inicializar el subsistema conducta

Instala `conducta`: reglas **"cuando hagas X, asegurate de Y"** que atan **momentos** (evento de hook + condición sin juicio) a **acciones** (`inyectar`/`correr`/`bloquear`). El aporte es que la regla **no vive cargada al arranque** —donde se recita y no se obedece (conocimiento `modos-de-falla-ante-reglas-escritas`)— sino que un **hook repartidor** la entrega en el momento en que hace falta. Modelo en las decisiones 0021 y 0025. Si parte ya existe, **extender sin pisar**.

**Depende de `memoria-local`**: la convención se guarda como memoria. Si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero la skill `inicializar-memoria-local`.

## Estructura objetivo

```
├── AGENTS.md              # (raíz) línea @.claude/conducta/MANIFIESTO.md en la sección "Subsistemas"; CLAUDE.md = adaptador
├── .claude/settings.json  # hook Claude: UserPromptSubmit + PreToolUse Write|Edit (merge, sin pisar)
├── .codex/hooks.json      # hook Codex: solo UserPromptSubmit (paridad del momento `cada turno`)
├── .claude/conducta/
│   ├── MANIFIESTO.md      # manifiesto de subsistema (siempre en contexto; NO importa índice)
│   ├── INDICE.md          # registro de reglas: ## Reglas Base + ## Reglas del Propósito
│   ├── MOMENTOS.md        # vocabulario de momentos
│   ├── establecer-conducta/
│   │   ├── establecer-conducta.js
│   │   └── README.md
│   └── lint-conducta/
│       ├── lint-conducta.js
│       └── README.md
└── memoria/
    └── feedback_conducta.md
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo `INDICE.md` (puede tener Reglas del Propósito cargadas).
- **Crear solo lo ausente.** No existe → crear. Existe → preservar; agregar solo lo que falte.
- **Separación Base / Propósito (decisión 0027).** El registro se parte en `## Reglas Base` (harness, reemplazable por el nivelador) y `## Reglas del Propósito` (del repo, intocable). Al reconciliar: la sección Base se puede poner al día contra la plantilla; la sección Propósito **no se toca**. Si el repo trae un `INDICE.md` viejo **sin** el corte en dos secciones, es reacomodo legacy: **no pisar**, reportar divergencia y preguntar antes de partir la tabla (una regla del Propósito podría quedar del lado equivocado).
- **Cableado del hook: merge, nunca pisar.** En `.claude/settings.json` sumar las entradas `UserPromptSubmit` y `PreToolUse` (matcher `Write|Edit`) que corren `establecer-conducta.js` **sin borrar hooks existentes** (p. ej. el `SessionStart` de `gestion-de-planes` o la Pantalla de bienvenida). Si la entrada ya está, no duplicar.
- **Reportar al final** en tres grupos: `agregado` / `ya estaba` / `divergente`.

## Concepto de la funcionalidad

- **Momento = evento de hook + condición sin juicio** (decisión 0021). Hoy con repartidor: `cada turno` (`UserPromptSubmit`) y `al escribir` (`PreToolUse` sobre un `.md` bajo `.claude/`). Declarado sin repartidor: `al cerrar tarea` (`Stop`) — sus reglas van en estado `pendiente` (honesto, sin entregar).
- **Acción en tres clases:** `inyectar` (texto que el agente lee y aplica con juicio), `correr` (una Herramienta sin juicio), `bloquear` (frenar; solo donde el falso positivo es imposible).
- **El registro NO se carga en contexto.** Lo entrega el hook, que lee el registro **vivo** en cada momento. Agregar o cambiar una regla **no toca el hook**.
- **Base instalada:** respetar preferencias, no acuñar terminología y preguntar antes de redefinir/remover algo canónico (momento `cada turno`); contrastar lo escrito contra la sabiduría del repo (momento `al escribir`). Más las reglas del Propósito que sume cada repo.
- **Gobernanza (decisiones 0004/0016):** toda regla que toque terminología o decisiones pasa por el usuario; el agente propone, ratificar es potestad del usuario.

## Flujo de trabajo

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Asegurar `.claude/conducta/MOMENTOS.md`** (textual de [PLANTILLA.md](PLANTILLA.md) §Momentos) y **`.claude/conducta/INDICE.md`** (§Registro: encabezado + `## Reglas Base` con las reglas Base + `## Reglas del Propósito` vacía). Si ya existe un `INDICE.md` con Reglas del Propósito, **no pisar**: poner al día solo la sección Base; reportar el resto.
3. **Instalar el hook repartidor** `.claude/conducta/establecer-conducta/establecer-conducta.js` (§Hook-script) + su `README.md` (§Hook-readme), con el contenido EXACTO de la plantilla.
4. **Instalar el lint** `.claude/conducta/lint-conducta/lint-conducta.js` (§Lint-script) + su `README.md` (§Lint-readme).
5. **Cablear el hook** (§Cableado):
   - **Claude** — merge en `.claude/settings.json`: `UserPromptSubmit` (sin matcher) + `PreToolUse` (matcher `Write|Edit`), ambos corriendo `node .claude/conducta/establecer-conducta/establecer-conducta.js`. **Sin pisar** hooks existentes.
   - **Codex** — merge en `.codex/hooks.json`: solo `UserPromptSubmit`. El momento `al escribir` es Claude-first (el `PreToolUse` de Codex intercepta solo Bash). Avisar al usuario que Codex carga hooks de proyecto solo si la capa `.codex/` está *trusted* y con `features.hooks` habilitado.
6. **Asegurar la memoria `feedback_conducta.md`** (§Memoria) y su línea en `memoria/MEMORIA.md`. Equivalente presente → no duplicar; difiere → reportar.
7. **En `AGENTS.md`** cablear el subsistema por su **manifiesto**:
   - **Crear `.claude/conducta/MANIFIESTO.md`** (§Manifiesto) — va **siempre en contexto**; **no** importa el índice (se consulta a demanda solo para gestionarlo), así que **no lleva línea `@…` final**.
   - **Asegurar la sección `## Subsistemas`** (§Subsistemas; la crea `memoria-local`, o crearla si falta) y, dentro, la línea `@.claude/conducta/MANIFIESTO.md`. No quitar las líneas de otros subsistemas.
8. **Reportar** en los tres grupos. Correr el lint (`node .claude/conducta/lint-conducta/lint-conducta.js`) → limpio. Probar el hook a mano (§Hook-readme trae los comandos). **No hacer commit** salvo pedido explícito.
