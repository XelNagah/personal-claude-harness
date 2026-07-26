# Agente Multipropósito — AMP

Setup estándar para agentes de código de **propósito general**. Vos le decís al repo **qué querés lograr** (llevar la contabilidad, analizar dónde mudarte, probar modelos de IA) y el agente construye ese dominio **sesión a sesión**: aprende algo, lo persiste fuera de la memoria efímera del chat, y por eso la próxima vez arranca más capaz. El mismo setup sirve a cualquier propósito.

Se instala sobre un **repo vacío** o sobre uno que **ya tenga cosas** — es idempotente y reconciliable: inspecciona lo que hay, agrega lo que falta y no pisa lo que difiere.

## Ejemplos

El propósito lo ponés vos. Tres reales:

- **Contable** — un agente que lleva las cuentas en GnuCash (por MCP) y sincroniza los archivos por Dropbox. Su glosario son las cuentas y categorías; sus decisiones, los criterios de imputación.
- **Modelos de IA** — un agente que baja modelos, los prueba y anota qué anduvo. Su conocimiento son los benchmarks; sus planes, la cola de experimentos.
- **Mudanza** — un agente que analiza casas para elegir dónde mudarse. Su glosario son los barrios y criterios; sus decisiones, los descartes y por qué.

Mismo harness, tres dominios. Lo que cambia es lo que se acumula adentro.

## Qué te da

**Nueve subsistemas** en el `.claude/` del repo. Todos siguen el mismo patrón (ver [Cómo aprende](#cómo-aprende)) y nacen vacíos:

| Subsistema | Qué acumula |
|------------|-------------|
| **memoria** | Hechos que hay que recordar entre sesiones, tipados, uno por archivo |
| **preferencias** | Cómo trabaja el agente: comunicación y principios, versionados en Base + Adaptaciones |
| **planes** | El ciclo pendientes → ejecutados / descartados, con registro y estados configurables |
| **conocimiento** | Lo que el agente **sabe** del dominio: lo que costó averiguar y va a hacer falta de nuevo |
| **semántica** | La terminología del dominio: glosario de términos legítimos + registro de los vetados |
| **decisiones** | Las decisiones estructurales, para no re-decidir ni contradecir lo ya resuelto |
| **herramientas** | Las tools que el propósito del repo requiere (script, skill local, MCP), en un registro |
| **conducta** | Reglas "cuando hagas X, asegurate de Y", que un hook entrega en el momento justo |
| **commits** | La convención de mensajes de commit del repo |

Se distribuye como **7 plugins**: el transversal `amp` más uno por cada subsistema que tenga skill de operación. Instalás `amp` y los otros seis entran solos como dependencias — una instalación por repo.

| Plugin | Skills |
|--------|--------|
| `amp` | `inicializar` (arma el `.claude/` completo) · `planificar` (analiza un plan contra lo que el repo sabe) · `info` (estado) · `actualizar` (pone al día una instalación vieja) |
| `amp-memoria` | `registrar-memoria` |
| `amp-preferencias` | `registrar-preferencia` |
| `amp-planes` | `ciclo-de-plan` |
| `amp-conocimiento` | `registrar-conocimiento` · `buscar-conocimiento` |
| `amp-semantica` | `converger-terminologia` |
| `amp-decisiones` | `registrar-decision` |

Los tres subsistemas sin skill propia (**herramientas**, **conducta**, **commits**) no tienen plugin: su estructura la escribe `amp:inicializar`.

## Cómo aprende

El corazón del harness es un **bucle de aprendizaje**: hay un propósito, el agente trabaja hacia él, aprende algo (una decisión, un término, un plan, un hecho), lo **persiste** por escrito, y por eso arranca más capaz la próxima vez — y **compone**: cada sesión suma sobre la anterior.

```mermaid
flowchart TD
    P(["PROPÓSITO<br/>lo que querés lograr"])
    W["el agente TRABAJA la sesión<br/>hacia el propósito"]
    L["APRENDE algo<br/>una decisión · un término · un plan · un hecho"]
    S["lo PERSISTE<br/>queda escrito · fuera del chat efímero"]
    C["arranca MÁS CAPAZ<br/>y compone: cada sesión suma"]
    P --> W
    W --> L
    L --> S
    S --> C
    C -->|vuelve a trabajar, sabiendo más| W
```

Para que ese "lo persiste" sea confiable, cada subsistema sigue el mismo **patrón manifiesto + índice + entradas + lint**. El **manifiesto** es una descripción breve —qué es el subsistema, cuándo consultarlo, cuándo escribirlo— que va **siempre en contexto** y que además declara si su índice se carga o no. El `INDICE.md` contiene **entradas**; cada entrada puede abrir un **documento** de detalle (opcional) o una **carpeta con su propio índice** (recursión). Un **lint mecánico** valida la coherencia — sin LLM, sin red.

```mermaid
flowchart TD
    M["MANIFIESTO.md<br/>siempre en contexto · declara si el índice se carga"]
    IDX["INDICE.md<br/>punteros · a demanda o siempre, según el manifiesto"]
    E["entradas<br/>una por tema"]
    D["documento .md<br/>el detalle · opcional"]
    F["carpeta con su índice<br/>recursión del patrón"]
    LINT[["lint mecánico"]]
    M -->|describe y declara| IDX
    IDX -->|contiene| E
    E -->|puede abrir| D
    E -->|o una| F
    LINT -.->|valida: refs · huérfanos · índice · colisiones| IDX
```

Ese modelo de carga existe por una razón concreta: si todos los índices fueran siempre a contexto, el registro de planes solo ya se comería la mitad del arranque. Lo que va siempre es la descripción liviana; el índice pesado se consulta cuando hace falta.

La integridad tiene dos capas: la **mecánica** (los lints, obligatoria para todo subsistema que persiste estado) y la **semántica** (contradicciones, duplicación, desactualización — requiere entender el significado; hoy informal).

## Cómo se usa

El camino cómodo, con Claude Code, parado en la raíz del repo a inicializar:

```shell
# 1. Registrar el marketplace (una vez)
claude plugin marketplace add XelNagah/personal-claude-harness

# 2. Instalar el plugin transversal (trae los 6 por subsistema como dependencias)
claude plugin install amp@xelnagah-harness -s project

# 3. Reiniciar la sesión y, en el repo a inicializar, invocar la skill
amp:inicializar
```

A partir de ahí, trabajás normal: al arrancar la sesión el agente ve el estado del repo y sus manifiestos, y escribe lo aprendido a medida que aparece.

📄 **[Manual de instalación completo](docs/INSTALAR.md)** — instalación de cero paso a paso, cómo actualizar un repo que ya tiene el Agente Multipropósito (incluidas las versiones con nombres de plugin viejos), instalación para Codex / Cursor / Gemini, y problemas frecuentes.

El catálogo completo de funcionalidades, dependencias y nombres de skill está en [REGISTRO.md](REGISTRO.md).

## Estructura del repo

```
├── README.md                  # este archivo
├── AGENTS.md                  # instrucciones para agentes (fuente única)
├── CLAUDE.md                  # adaptador Claude Code: @AGENTS.md
├── REGISTRO.md                # catálogo de funcionalidades
├── docs/                      # documentación para humanos
│   └── INSTALAR.md            # manual de instalación y actualización
├── .claude/                   # el propio setup, aplicado a este repo
│   ├── memoria/ preferencias/ planes/ conocimiento/ semantica/
│   ├── decisiones/ herramientas/ conducta/
│   └── ...                    # cada subsistema con su manifiesto, índice y lint
├── .claude-plugin/
│   └── marketplace.json       # catálogo del marketplace (7 plugins)
└── funcionalidades/           # cada subcarpeta = un plugin
    └── <nombre>/              # plugin.json + README + skills/<skill>/
```

El detalle de cada funcionalidad vive en su `funcionalidades/<nombre>/README.md`; el de la mecánica interna, en [`AGENTS.md`](AGENTS.md) y [REGISTRO.md](REGISTRO.md).

---

_Las dos secciones que siguen son de uso avanzado — saltalas si solo querés instalar y usar._

## Con otro agente (no Claude Code)

El harness es **multiagente**:

- **Instrucciones** — `AGENTS.md` en la raíz de cada repo instalado: lo leen nativo Codex CLI, Cursor, Gemini CLI y Copilot (estándar de la Linux Foundation). Claude Code entra por el adaptador `CLAUDE.md` (`@AGENTS.md`).
- **Skills** — `SKILL.md` usa el estándar abierto [Agent Skills](https://agentskills.io/), que esos mismos agentes leen desde `~/.agents/skills/`. En una máquina nueva: clonar este repo y correr `node .claude/herramientas/instalar-junctions/instalar-junctions.js` (crea las dos tandas de enlaces: `~/.claude/skills` y `~/.agents/skills`).

Un agente futuro que adopte cualquiera de los dos estándares queda soportado sin tocar el repo.

**Límite conocido:** el prefijo `amp:` / `amp-<sub>:` que deja visible de qué subsistema es cada skill es un mecanismo de Claude Code. Con enlaces, las skills se ven con el nombre pelado.

## Uso avanzado

- **El conjunto entra completo** — no se instalan piezas sueltas: `amp` trae los seis `amp-<sub>` por dependencias, en alcance `project`. Es a propósito — el harness aplica a los repos que lo usan, no a todos los que abras.
- **Desarrollo local (enlaces / symlinks)** — para editar las skills en vivo sin pasar por la caché de plugins, se enlazan por **junction** (NTFS) en dos tandas (`~/.claude/skills/` y `~/.agents/skills/`) hacia cada `funcionalidades/<n>/skills/<skill>`. En Linux/macOS el equivalente es `ln -s`. No mezclar enlace + plugin de la misma skill en una máquina (colisionan por nombre). Crear/reparar todo:

  ```bash
  node .claude/herramientas/instalar-junctions/instalar-junctions.js
  ```

- **Actualización automática** — el install es un `git clone` por debajo. Este repo es público, así que no hace falta autenticación; si lo forkeás en privado, exportá `GITHUB_TOKEN` con alcance `repo` para que la actualización en segundo plano funcione.
- **Mantenimiento** — cómo agregar una funcionalidad, propagar un cambio y validar el marketplace: en [REGISTRO.md](REGISTRO.md) y [`AGENTS.md`](AGENTS.md).
