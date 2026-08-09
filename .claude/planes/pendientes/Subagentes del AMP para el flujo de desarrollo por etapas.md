# Plan: Subagentes del AMP para el flujo de desarrollo por etapas

**Estado: En curso · Creado 26-08-06.** Mudado desde el repo `como-uso-claude` (su Local-0003) el 26-08-06, con el contenido íntegro salvo ajustes de terminología vetada en este repo («gate de terminología» → «Control de terminología», «pieza» → «componente», «artefactos» → «archivos», «artefacto definido, no prosa suelta» → «resultado definido, no texto suelto»); las rutas relativas a `conocimiento/` referencian aquel repo.

Definir subagentes propios y **distribuirlos por el harness** a los repos AMP, para armar el flujo de desarrollo por etapas: diseño → crítica → desarrollo → tests → revisión de código → seguridad.

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

- **Cero subagentes propios.** Todo lo que aparece en `~/.claude/agents/` viene de plugins de terceros. ⚠️ **Caducó el 26-08-06**: ya son dos, los de la familia 1.
- El catálogo de roles del conocimiento (`investigador`, `test-runner`, `code-reviewer`, `depurador`, `implementador-modular`, `planificador`) está diseñado con `tools` y `model`, sin materializar.
- Todo corre al modelo de la sesión: leer 25k de logs de test se paga a precio Opus.

Disponible sin construir nada: `/code-review`, `/security-review`, `/simplify`; skills `grill-with-docs`, `analizar-con-docs`, `tdd`, `diagnose`; subagentes incorporados `Explore`, `Plan`, `general-purpose`, `fork`; y `cavecrew-investigator` / `builder` / `reviewer` del plugin caveman.

⚠️ `feature-dev`, `pr-review-toolkit`, `claude-security` y `code-modernization` están clonados en `plugins/marketplaces/` pero **no instalados** (`plugins/cache/` solo tiene `caveman` y `openai-codex`).

## Diseño: dos familias de subagente

La distinción decide dónde vive cada uno.

### Familia 1 — Agentes de subsistema

Dependen de un subsistema concreto del AMP. **Viajan con ese subsistema**, no en un paquete "agentes" aparte: `semantica` trae su skill, su lint y su agente; `conocimiento`, el suyo.

Consecuencia: si el repo no tiene `semantica` instalado, el agente nunca llega. La dependencia se resuelve por construcción, sin inventar un mecanismo de dependencias entre funcionalidades.

**Ejecutada y verificada el 26-08-06** (commit `f31495c`, publicado). Dos subagentes, los dos `model: sonnet` y `tools: [Read, Grep, Glob]` —de solo lectura por construcción—, cada uno en la carpeta `agents/` del plugin de su subsistema:

| Subagente | Plugin | Lo invoca | Devuelve |
|---|---|---|---|
| `buscador-de-terminologia` | `amp-semantica` 0.11.0 | `converger-terminologia`, paso 2 | Apariciones con archivo y línea, separadas en texto plano y código |
| `buscador-de-conocimiento` | `amp-conocimiento` 0.9.0 | `buscar-conocimiento`, paso 2 | Candidatos a página con su evidencia |

El corte quedó fijado en la Decisión Local-0060 (el Agente Multipropósito transporta subagentes, y las habilidades delegan en ellos el recorrido): **se delega traer evidencia, nunca decidir sobre ella**. La forma del nombre, en la Decisión Local-0061 (los subagentes se nombran con sustantivo de rol). `lint-harness` gana un control con dos casos: un subagente sin `model` o con el `name` cambiado sigue andando y ningún control posterior lo veía.

**Verificado en ejecución el 26-08-06**, en una sesión arrancada después de la actualización, invocando `converger-terminologia` con alcance «los planes» (los 43 `.md` de `pendientes/`). Las tres cosas que la premisa necesitaba:

1. **El recorrido corrió en el subagente**, no en el hilo principal: 41 llamadas a herramientas dentro de `buscador-de-terminologia`.
2. **Corrió al modelo declarado.** Leído de la transcripción del subagente, no inferido del frontmatter: 55 respuestas a `claude-sonnet-5`, mientras el hilo principal seguía en `claude-opus-5`. El ahorro de plata es real y es aparte del de contexto.
3. **El efecto medido** (paso 4 de los Pasos, que pedía un número real y no una estimación):

| | Caracteres |
|---|---|
| Resultados de herramienta que el subagente leyó — lo que el hilo principal **no** recibió | 119.778 |
| Reporte que volvió al hilo principal | 19.439 |
| **Ahorro de contexto principal** | **~84%** |

Los caracteres son exactos; convertirlos a tokens (≈29.900 evitados contra ≈4.860 recibidos) es aproximado, a cuatro caracteres por token.

Cómo se reproduce la medición: la transcripción de cada subagente queda en `~/.claude/projects/<repo>/<sesión>/subagents/agent-<id>.jsonl`. El modelo sale del campo `model` de cada respuesta; el volumen, de sumar los bloques `tool_result`.

**Los que siguen en esta familia.** Salieron de buscar en las habilidades del repo los verbos de recorrido (`recorr`, `barr`, `inventar`, «el repo entero», «decenas de»). Descontadas las dos ya hechas y `amp:actualizar`, quedan cuatro, en orden de conveniencia:

| Habilidad | Por qué | Reparo |
|---|---|---|
| `priorizar-planes` | Abre los 43 planes vivos; más volumen que el de terminología. `sugerir-siguiente-plan` la reutiliza, así que un subagente sirve a dos habilidades | — |
| `reubicar-aprendizaje` | Recorre el Aprendizaje entero antes de conversar | — |
| `amp:planificar` | Busca qué dicen semántica, decisiones y conocimiento sobre el tema | **No se delega entera**: el diseño necesita la conversación con el usuario, y delegarlo lo ciega. Solo la búsqueda |
| `registrar-conocimiento` | Recorre para no duplicar una página ya asentada | Recorrido más liviano; el que menos gana |

`amp:actualizar` sigue **afuera a propósito**, y la medición del 26-08-06 no lo cambia: es el único candidato que **escribe** archivos del harness, corre pocas veces por repo, y el ahorro por corrida no compensa darle escritura a un subagente. Vuelve a la mesa solo si alguna de las cuatro de arriba muestra que el corte de solo lectura estorba.

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
| Revisión de código | `code-reviewer` (opus, read-only) | Lente fresca sin las racionalizaciones del que escribió. |
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

El plan arrancó ordenado al revés de como se ejecutó: los pasos originales daban por sentado que la familia 2 iba primero y la familia 1 después. Salió al revés, porque la familia 2 quedó trabada en dos puntos abiertos y la familia 1 no dependía de ninguno. Quedan separados por familia.

### Hechos

- ✅ **Escribir los dos primeros subagentes de la familia 1** (`buscador-de-terminologia`, `buscador-de-conocimiento`), con el corte de solo lectura y el `model` declarado — 26-08-06, commit `f31495c`.
- ✅ **Medir el efecto**, que era lo único que validaba la premisa — 26-08-06. Los números están arriba, en la familia 1. Con esto los del conocimiento dejan de ser ilustrativos.

### Familia 1 — se puede seguir sin desbloquear nada

1. **Escribir el subagente de `priorizar-planes`**, el próximo de la tabla de arriba. Mismo corte de solo lectura, mismo `model: sonnet`, sustantivo de rol por la Decisión Local-0061. Sirve además a `sugerir-siguiente-plan`, que la reutiliza.
2. Medirlo igual que a los dos primeros, y seguir con `reubicar-aprendizaje`.
3. Bajar al conocimiento [`subagentes-agentes-codigo.md`](../../conocimiento/subagentes-agentes-codigo.md) lo aprendido de la familia 1: la medición, cómo se lee la transcripción del subagente para verificar modelo y volumen, y el corte evidencia/decisión. Cierra el hueco «diseñado y sin ejecutar» para esta mitad.

### Familia 2 — bloqueada, necesita al usuario

4. **Ratificar el punto abierto 2** (tipos propios contra plugins oficiales) y **resolver el 1** (instalación condicional). Sin esto no arranca.
5. Escribir los cuatro archivos de tipo en el harness, con las preferencias del Agente Multipropósito embebidas en cada prompt.
6. Instalar en un Agente con Propósito de código real y probar: `test-runner` sobre la suite, `code-reviewer` sobre un cambio chico. Candidato: `beatsaber-overlay` — **no** este repo.
7. Medir el efecto con el mismo método del paso 2 y registrar el resultado en el conocimiento.

## Fuera de alcance

- Los subagentes de dominio por repo (§6 del conocimiento).
- La herramienta Workflow y cualquier orquestación automática de punta a punta.
- Delegar escritura en repos sensibles (contable, salud, sucesión, impresion3d): ahí rige el protocolo de confirmación de escrituras del Agente-Coordinador — el subagente propone, el usuario ratifica.

## Verificación

- Los cuatro tipos aparecen listados como disponibles en un AMP de código, y **no** en uno de análisis.
- `code-reviewer` intenta escribir en una prueba y **falla** por `tools` acotadas — si no puede fallar, la prueba no prueba nada.
- La medición del paso 4 arroja un número real de tokens del hilo principal, no una estimación.
