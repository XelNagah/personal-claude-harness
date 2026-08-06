# Plan: Subagentes del AMP para el flujo de desarrollo por etapas

**Estado: Nuevo · Creado 26-08-06.** Mudado desde el repo `como-uso-claude` (su Local-0003) el 26-08-06, con el contenido íntegro salvo ajustes de terminología vetada en este repo («gate de terminología» → «Control de terminología», «pieza» → «componente», «artefactos» → «archivos», «artefacto definido, no prosa suelta» → «resultado definido, no texto suelto»); las rutas relativas a `conocimiento/` referencian aquel repo.

Definir subagentes propios y **distribuirlos por el harness** a los repos AMP, para armar el flujo de desarrollo por etapas: diseño → crítica → desarrollo → tests → code review → seguridad.

Baja a ejecución el conocimiento [`subagentes-agentes-codigo.md`](../../conocimiento/subagentes-agentes-codigo.md), que tiene el diseño completo y sin ejecutar.

Origen: pregunta del usuario del 2026-07-31 — *"¿qué sabemos sobre ejecutar un flujo de agentes por etapas? ¿se usan subagentes? ¿cómo lo aprovecho?"*.

## De qué componente estamos hablando

El AMP hoy transporta **skills**, hooks y scripts. Este plan agrega el componente que todavía no usa: **subagentes**. No cambia nada de lo existente.

| | Skill | Subagente |
|---|---|---|
| Dónde corre | En el contexto del agente principal | En **su propia** ventana de contexto |
| Qué deja | Instrucciones cargadas; sigue el principal | Un reporte; lo que leyó y razonó no entra al contexto principal |
| Archivo | `skills/<nombre>/SKILL.md` | `agents/<nombre>.md` |
| Quién lo invoca | El usuario (`/nombre`) o el modelo, por su `description` | Siempre el agente principal, con la herramienta Agent |

Ejemplo del `test-runner`: el usuario pide "corré los tests", el principal lanza el subagente, y al contexto principal entran 30 líneas de fallas en vez de 25k de logs.

## Por qué va por el harness y no a nivel usuario

Los subagentes del AMP son **archivos dependientes de subsistemas**: su prompt referencia `semantica/`, `decisiones/`, `memoria/`. En un repo sin AMP apuntan a carpetas que no existen. Misma dependencia que tiene una skill — no es una propiedad del formato, es del contenido.

⇒ Van donde van las skills: en el plugin del harness, en la carpeta `agents/`. Un nivel usuario (`~/.claude/agents/`) los pondría en repos que no son AMP, donde no tienen sentido.

Mecanismo verificado el 2026-07-31: el plugin `caveman` instalado en esta PC transporta `plugins/caveman/agents/` y `plugins/caveman/skills/` en el mismo paquete. Un plugin lleva ambas cosas; el harness ya usa una de las dos.

## Qué existe hoy

Verificado el 2026-07-31:

- **Cero subagentes propios.** Todo lo que aparece en `~/.claude/agents/` viene de plugins de terceros.
- El catálogo de roles del conocimiento (`investigador`, `test-runner`, `code-reviewer`, `depurador`, `implementador-modular`, `planificador`) está diseñado con `tools` y `model`, sin materializar.
- Todo corre al modelo de la sesión: leer 25k de logs de test se paga a precio Opus.

Disponible sin construir nada: `/code-review`, `/security-review`, `/simplify`; skills `grill-with-docs`, `analizar-con-docs`, `tdd`, `diagnose`; subagentes incorporados `Explore`, `Plan`, `general-purpose`, `fork`; y `cavecrew-investigator` / `builder` / `reviewer` del plugin caveman.

⚠️ `feature-dev`, `pr-review-toolkit`, `claude-security` y `code-modernization` están clonados en `plugins/marketplaces/` pero **no instalados** (`plugins/cache/` solo tiene `caveman` y `openai-codex`).

## Diseño: dos familias de subagente

La distinción decide dónde vive cada uno.

### Familia 1 — Agentes de subsistema

Dependen de un subsistema concreto del AMP. **Viajan con ese subsistema**, no en un paquete "agentes" aparte: `semantica` trae su skill, su lint y su agente; `conocimiento`, el suyo.

Consecuencia: si el repo no tiene `semantica` instalado, el agente nunca llega. La dependencia se resuelve por construcción, sin inventar un mecanismo de dependencias entre funcionalidades.

Ninguno definido todavía — esta familia se puebla cuando un subsistema lo pida.

### Familia 2 — Agentes de trabajo de código

No dependen de ningún subsistema: dependen de que **el repo tenga código**. Son los cuatro del catálogo:

| Tipo | `tools` | `model` | Qué devuelve |
|---|---|---|---|
| `investigador` | Read, Grep, Glob, Bash | sonnet | Hallazgos con `archivo:línea` y fuente. Nunca volcados de archivo. |
| `test-runner` | Bash, Read | **haiku** | `pass`/`fail` + solo las fallas (traza + `archivo:línea`). Nunca los logs completos. No arregla nada. |
| `code-reviewer` | Read, Grep, Glob | opus | Hallazgos con puntaje de confianza; solo reporta ≥ 80. **Read-only por diseño**: no puede escribir aunque se confunda. |
| `depurador` | Read, Grep, Glob, Bash | opus | Causa raíz + arreglo propuesto. No aplica el arreglo. |

Los de dominio (`ingesta`, `protocolo-tester`, `verificador-de-alerta`, `auditor-contable`) quedan fuera de este plan: se escriben a mano en el `.claude/agents/` del repo que los pida. Tabla por repo en el conocimiento.

## Diseño: el flujo por etapas

| Etapa | Dónde | Por qué |
|---|---|---|
| Diseño | Hilo principal o `Plan` | Necesita la conversación con el usuario. Delegarlo lo ciega. |
| Crítica del diseño | Subagente, contexto fresco (`grill-with-docs`) | El valor está en que **no** vio cómo se llegó ahí. |
| Desarrollo del núcleo | Hilo principal | Lo que se dirige turno a turno no se delega. |
| Módulo autocontenido | `implementador-modular`, worktree si van varios | Solo si está bien especificado y es independiente. |
| Tests / lint / build | `test-runner` (haiku) | Volumen tonto, aísla logs enormes. |
| Code review | `code-reviewer` (opus, read-only) | Lente fresca sin las racionalizaciones del que escribió. |
| Seguridad | `/security-review` | Ya existe; no hace falta tipo propio. |
| Crítica final | Verificación adversarial: N escépticos independientes prompteados para **refutar** | Filtra el hallazgo plausible pero falso. |

### Dos reglas duras

1. **Contrato entre etapas.** Cada etapa entrega un resultado definido, no texto suelto: el plan escrito en `planes/pendientes/`, la lista de hallazgos con `archivo:línea`, el `pass`/`fail` con las fallas. Sin eso, la etapa siguiente re-deriva y se pierde el trabajo de la anterior.
2. **No encadenar diseño → desarrollo automático.** El punto de control humano entre esas dos es donde se evita el trabajo tirado. Crítica, tests, review y seguridad sí se encadenan solos: son verificación, y el peor caso es ruido descartable.

## Puntos abiertos (bloquean la ejecución)

### 1. Instalación condicional para la familia 2

Los cuatro agentes de código solo tienen sentido en AMP **con código**. En `sucesion`, `inmueble` o este mismo repo, un `test-runner` es tan sin sentido como un agente de terminología en un repo sin `semantica`.

Falta definir si eso se resuelve como funcionalidad más del harness que se elige al inicializar (lo más simple y consistente con lo que ya hay), o si requiere alguna noción de tipo de repo. **No verificado desde este repo:** cómo maneja el harness hoy la instalación selectiva de funcionalidades.

### 2. Prompts propios vs. plugins oficiales

Evaluados leyendo los archivos de tipo:

- **`feature-dev/code-reviewer`** aporta una mecánica valiosa: **puntaje de confianza 0-100 con corte en 80**, con el criterio explícito de cada nivel. Ataca el modo de falla típico del review automático (el hallazgo plausible pero falso).
- **`pr-review-toolkit`** aporta lentes que el catálogo propio no tiene: `silent-failure-hunter` (catch demasiado anchos, fallbacks que tapan errores, mocks en producción) y `type-design-analyzer`.

Limitaciones de ambos: prompts en inglés sin la nomenclatura del dominio; no conocen las preferencias del AMP (cero invención, Control de terminología, verificación en el momento); alcance atado a `git diff` / PR de GitHub.

**Recomendación:** escribir los tipos propios robando el contenido de los oficiales, traducido y con las preferencias adentro. No instalarlos como están. Ratifica el usuario.

## Pasos

1. Ratificar el punto abierto 2 (propios vs. oficiales) y resolver el 1 (instalación condicional).
2. Escribir los cuatro archivos de tipo en el harness, con las preferencias del AMP embebidas en cada prompt.
3. Instalar en un AMP de código real y probar: `test-runner` sobre la suite, `code-reviewer` sobre un diff chico. Candidato: `beatsaber-overlay`.
4. **Medir el efecto**, que es lo único que valida la premisa: tokens del hilo principal con y sin subagente en la misma tarea. Sin esto, los números del conocimiento siguen siendo ilustrativos.
5. Registrar el resultado en el conocimiento — cerrar el hueco "diseñado y sin ejecutar".
6. Con la familia 2 estable, evaluar la familia 1: qué subsistema pide su propio agente.

## Fuera de alcance

- Los subagentes de dominio por repo (§6 del conocimiento).
- La herramienta Workflow y cualquier orquestación automática de punta a punta.
- Delegar escritura en repos sensibles (contable, salud, sucesión, impresion3d): ahí rige el Control de Escritura — el subagente propone, el usuario ratifica.

## Verificación

- Los cuatro tipos aparecen listados como disponibles en un AMP de código, y **no** en uno de análisis.
- `code-reviewer` intenta escribir en una prueba y **falla** por `tools` acotadas — si no puede fallar, la prueba no prueba nada.
- La medición del paso 4 arroja un número real de tokens del hilo principal, no una estimación.
