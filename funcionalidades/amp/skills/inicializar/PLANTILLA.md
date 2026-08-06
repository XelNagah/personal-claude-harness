# Plantilla del setup completo

Lo que `amp:inicializar` **no puede copiar**: los pedazos que se suman a un archivo del repo destino sin pisarlo, los moldes con marcadores, y las notas de reconciliación que necesitan juicio.

**Los Componentes de Subsistema completos no están acá: son archivos de verdad**, en [`base/`](base/), con el mismo árbol que van a ocupar en el destino. `base/planes/lint-planes/lint-planes.js` se instala en `.claude/planes/lint-planes/lint-planes.js`. La estructura dice a dónde va cada uno, así que no hay ninguna lista que mantener al día — y no hay dos copias del mismo texto que puedan separarse en silencio.

---

## §Subsistemas — bloque `## Subsistemas` en `AGENTS.md`

Reemplaza el viejo "Mapa del repo" **y** las secciones de texto plano por-subsistema. La primera funcionalidad de subsistema que se instala crea la sección; cada una la asegura y agrega su propia línea `@.claude/<sub>/MANIFIESTO.md`. Cada manifiesto lista sus Índices y declara si se cargan (incluyendo o no su línea de importación), así que la carga de datos ya no se decide acá.

```markdown
## Subsistemas (manifiestos siempre cargados)

Cada subsistema tiene un **Manifiesto** (`.claude/<sub>/MANIFIESTO.md`): una descripción breve —qué es, cómo se usa, cuándo consultarlo— que va **siempre en contexto** y que **lista sus Índices de Subsistema con el origen de cada uno** y declara si se cargan, incluyendo —o no— su línea de importación. Lo que se carga siempre es el manifiesto, no necesariamente el índice.

Un subsistema tiene **uno o más Índices**: hay dos cuando su contenido viene de dos orígenes, y cada archivo lo declara en su frontmatter (`indice`, `origen`, `columnas`). El `origen` —`agente-multiproposito` o `agente-desplegado`— es lo que decide el trato del actualizador, no el nombre del archivo: el sufijo `-LOCAL` solo distingue dos archivos que conviven.

Si tu agente no expande imports, **leé estos manifiestos al inicio de la sesión** (y, si el manifiesto importa sus índices, esos índices también).

@.claude/subsistemas/MANIFIESTO.md
@.claude/preferencias/MANIFIESTO.md
@.claude/planes/MANIFIESTO.md
@.claude/conocimiento/MANIFIESTO.md
@.claude/semantica/MANIFIESTO.md
@.claude/decisiones/MANIFIESTO.md
@.claude/herramientas/MANIFIESTO.md
@.claude/conducta/MANIFIESTO.md
```

(La ruta del `@import` es relativa al archivo que importa — `AGENTS.md` está en la raíz, por eso el prefijo `.claude/`. `preferencias` **no tiene sección propia**: entra por esta lista como los otros siete, y su manifiesto importa sus dos Índices, que sí se cargan siempre. Las reglas del subsistema `conducta` las reparte su hook en cada momento —no se recitan desde el índice—, por eso su manifiesto va en esta lista pero su registro no se carga.)

---

## §Hooks — merge en `.claude/settings.json` y `.codex/hooks.json`

**Registro doble**: el mismo script se registra en los dos formatos, y Claude Code y Codex CLI ejecutan idéntico chequeo. **Merge, nunca pisar:** sumar estas entradas a las que ya existan; si la entrada ya está, no duplicar. En particular el `SessionStart` del repartidor de conducta —que corre la Pantalla de bienvenida— se mergea con el `SessionStart` del lint de planes bajo el mismo evento, sin pisarlo: quedan las dos entradas en la misma lista.

Con `--quiet` el lint de planes solo imprime cuando hay hallazgos: sesión limpia, hook silencioso. Es el disparador mecánico del ciclo — sin él, mover planes vuelve a depender de acordarse.

**Claude Code** — `.claude/settings.json` (`SessionStart` con las dos entradas + `UserPromptSubmit` sin matcher + `PreToolUse` con matcher `Write|Edit`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);process.argv.push(p.join(d,'.claude/planes'));require(p.join(d,'.claude/planes/lint-planes/lint-planes.js'))\" lint-planes --quiet"
          },
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ]
  }
}
```

**Codex CLI** — `.codex/hooks.json` (los mismos tres eventos; el `SessionStart` del lint de planes lleva además `statusMessage`):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);process.argv.push(p.join(d,'.claude/planes'));require(p.join(d,'.claude/planes/lint-planes/lint-planes.js'))\" lint-planes --quiet",
            "statusMessage": "Chequeando el ciclo de planes"
          },
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"let f=require('fs'),p=require('path'),d=process.env.CLAUDE_PROJECT_DIR||process.cwd();while(!f.existsSync(p.join(d,'.claude'))&&p.dirname(d)!==d)d=p.dirname(d);require(p.join(d,'.claude/conducta/establecer-conducta/establecer-conducta.js'))\" establecer-conducta"
          }
        ]
      }
    ]
  }
}
```

> El matcher `Write|Edit` alcanza igual en Codex: toda edición de archivos pasa por `apply_patch`, que dispara `PreToolUse` y matchea como `apply_patch`, `Edit` o `Write`. La salvedad es el `deny`, que **hoy no frena** la escritura en Codex (bug abierto del CLI): ahí una regla `bloquear` degrada a aviso.
> En Codex el momento `al arrancar la sesión` **corre igual el repartidor** (mismo `SessionStart`), pero Codex no soporta `SessionStart` → `systemMessage` de la misma forma que Claude Code: la caja de la Pantalla de bienvenida sale solo si el agente muestra `systemMessage`; si no, degrada sin caja y la corrida no falla.
> ⚠️ Codex carga hooks de proyecto solo si la carpeta `.codex/` del repo es de **confianza** (revisar con `/hooks`) y con `features.hooks` habilitado en su config. La confianza se registra contra el texto del hook, así que **cada actualización que lo cambie lo vuelve a frenar hasta que se lo apruebe de nuevo**. Avisarle al usuario al instalar y al actualizar.

---

## §Gitignore — merge en `.gitignore`

**Merge, nunca pisar:** sumar las líneas que falten al `.gitignore` del repo; si el archivo no existe, crearlo con este contenido. Si una línea ya está, no duplicarla.

```gitignore
# Config de Claude Code propia de esta máquina
.claude/settings.local.json

# Temporales del agente: borradores, traspasos y el buzón de avisos
.claude/tmp/
```

No son preferencias de nadie: son las dos rutas donde **el mecanismo mismo escribe**. `.claude/tmp/` es el buzón donde un trabajo en segundo plano deja lo que averiguó para que el repartidor lo entregue en el turno siguiente —la Pantalla de bienvenida lo usa para el diagnóstico de plugins—, y además es el directorio de borradores que los lints excluyen de su barrido por ser material descartable. Sin estas líneas, la primera sesión del repo deja esos archivos listos para entrar en el primer commit, y los cuatro mecanismos que dan por sentado que el directorio se ignora trabajan sobre una premisa que nadie estableció.

El respaldo del actualizador **no va acá**: se escribe fuera del repo, en el temporal del sistema. Un `.claude/.respaldo-amp/` en un repo es de corridas viejas y lo levanta `amp:actualizar`, que ofrece borrarlo.

---

## §Moldes — textos con marcador, que no son archivos a instalar

Estos no se copian: los usa el agente cuando hay que crear una entrada nueva.

Página de detalle de una decisión, `.claude/decisiones/NNNN-nombre.md` (solo para las que requieren conceptualización mayor):

```markdown
# NNNN — Título corto de la decisión

**Fecha:** AAAA-MM-DD · **Estado:** vigente

Contexto: qué problema o situación la motivó.
Decisión: qué se decidió.
Alternativas: cuáles se consideraron y por qué se eligió esta.
Consecuencias: efectos no obvios (solo si los hay).
```

Ficha de una Herramienta de tipo `script`, `.claude/herramientas/<tool>/README.md`:

```markdown
# <tool>

**Qué hace:** <una o dos frases>.
**Cómo se invoca:** `<comando>` <args si los hay>.
**Estado:** vigente | experimental | obsoleto.
**Referenciado por:** <settings.local.json / .gitignore / hook / otro script / nadie> — quién lo invoca por ruta.
**Dependencias:** <entorno de ejecución, libs, credenciales que necesita>.
**Origen (opcional):** <qué necesidad, plan o decisión lo generó — solo si aporta>.
**Notas (opcional):** <lo que haga falta>.
```

---

## §Formas anteriores — lo que hay que reconocer al actualizar un repo viejo

Un repo que ya tenía el Agente Multipropósito puede traer cualquiera de estas formas. Ninguna se resuelve copiando: hay que reconocer la vieja y transformarla conservando lo que el repo aprendió.

**Preferencias.** Cuatro formas conocidas, de la más vieja a la más nueva:

- Dos secciones dentro de `CLAUDE.md` — "Preferencias de comunicación" y "Principios de trabajo". Textualmente iguales a las actuales → migrar sin preguntar (borrar de `CLAUDE.md`, dejar el import); con diferencias → las diferencias van al Índice del Agente Desplegado y se reporta.
- El par de encabezados `## Base (harness vN)` / `## Adaptaciones de este repo`, con un número de versión adentro del encabezado. **Los dos se renombran sin preguntar** a `## Preferencias del Agente Multipropósito` y `## Preferencias del Agente Desplegado`, conservando el contenido de cada uno: es renombre de encabezado, no reemplazo de contenido. El número de versión **se descarta y no se traslada a ningún lado** — vive en el plugin, y un Agente Desplegado no guarda ninguno.
- Los dos orígenes como **dos secciones de un mismo archivo**. Se migra **partiendo el archivo**: la sección del Agente Desplegado pasa a `PREFERENCIAS-LOCAL.md` **con su contenido intacto**, los dos archivos estrenan frontmatter y `AGENTS.md` gana la segunda línea de importación. Si esa sección estaba vacía, el archivo nace igual, declarado y sin entradas.
- Las preferencias como **bullets de texto corrido** bajo encabezados en negrita (`**Comunicación:**`, `**Principios de trabajo:**`), con `preferencias` fuera del Patrón: sin manifiesto, sin README y con sección propia en `AGENTS.md`. Tres cambios, en este orden: **(a)** cada bullet pasa a fila con el núcleo `Código | Nombre | Descripción | Detalle` —el Código se asigna de arriba hacia abajo, y el texto entero del bullet va a `Descripción` salvo la frase que apunta a una convención aparte, que pasa a `Detalle`—; **(b)** se instalan `MANIFIESTO.md` y `README.md`; **(c)** la sección `## Preferencias` de `AGENTS.md` **se borra** y su línea `@.claude/preferencias/MANIFIESTO.md` entra en `## Subsistemas`. Los encabezados de ámbito (`Comunicación`, `Principios de trabajo`) **no sobreviven**: no eran una columna, eran agrupamiento visual.

**Punto de entrada.** Si el repo tiene secciones de texto plano por-subsistema ("## Memoria del proyecto", "## Glosario del proyecto"…) y/o el bloque "## Mapa del repo (siempre cargado)", `## Subsistemas` las **reemplaza**: al cablear cada subsistema, quitar su sección vieja y su línea `@…INDICE`/`@…MEMORIA`/`@…PLANES` del Mapa; cuando el bloque Mapa queda sin líneas de subsistema, quitar también su encabezado. La descripción del proyecto **no se toca**.

**Semántica.** Un repo con `.claude/glosario/` tiene la generación anterior: la carpeta se renombra a `.claude/semantica/` y `lint-glosario/` a `lint-semantica/`, preservando los términos; después se migran las referencias (`@.claude/glosario/MANIFIESTO.md`, el prefijo de skill `glosario:`, y toda ruta al lint renombrado).
