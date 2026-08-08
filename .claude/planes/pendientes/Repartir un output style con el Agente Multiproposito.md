**Estado: Nuevo · Creado 26-08-08.**

# Repartir un output style con el Agente Multipropósito

Llevar a la Base los **output styles** de Claude Code —la funcionalidad que reemplaza el tono por defecto del agente— para que un estilo que baja la jerga y la verbosidad viaje a cada Agente Desplegado, en vez de vivir suelto en un repo.

Origen: el repo `D:\Proyectos\analisis\como-uso-claude`, que escribió y probó el estilo **«Español corriente»** los días 07 y 08/08/2026. Este plan es la generalización, conversada ahí y traída acá porque la decisión es del Agente Multipropósito.

> **Nombre a ratificar.** «Output style» es el nombre de la funcionalidad en Claude Code. Si al ejecutar se quiere un canónico en español, lo ratifica el usuario con `converger-terminologia` (Preferencia Base-0010, no acuñar términos del dominio).

## El problema

Opus 5 escribe largo y con jerga. La palanca no es cambiar de modelo: Claude Code tiene una funcionalidad —el output style— que **reemplaza** el tono por defecto del agente con un texto propio. El estilo «Español corriente» ya existe, ya está activo en un repo y ya se verificó que carga.

Hoy ese estilo es un archivo suelto de un solo repo. Cada Agente Desplegado que lo quiera tiene que copiarlo a mano, y ninguna corrida del actualizador lo pone al día. Es exactamente la forma que la Base ya sabe manejar: un `.md` que el actualizador reparte con respaldo.

## Lo ya verificado — no re-averiguar

Medido en `como-uso-claude` el 07 y 08/08/2026. Todo está asentado en su página de conocimiento Local-0024 (*Bajar la jerga y la verbosidad del agente con un output style*), en `.claude/conocimiento/output-styles-claude-code.md` de ese repo.

| Hecho | Consecuencia para este plan |
|---|---|
| La clave `outputStyle` del `settings.json` **de proyecto** se honra | El encendido puede viajar en git, sin `/config` a mano por máquina |
| No recarga en vivo: `/clear` **no** alcanza, hace falta **proceso nuevo** | Cualquier prueba sin relanzar la CLI da un falso negativo |
| El valor tiene que coincidir exacto con el `name` del frontmatter, con mayúsculas y acentos | `"Español corriente"`, no una variante |
| `keep-coding-instructions` viene en `false`, y con ese valor el estilo **reemplaza** las instrucciones de ingeniería de Claude Code | Para un estilo de tono va siempre en `true`, o el agente se degrada sin avisar |
| El estilo **no** alcanza a los subagentes ni a lo que el agente escribe en archivos | No sirve como control de terminología: eso lo sigue haciendo el hook `detectar-terminologia-vetada` del subsistema `conducta`. No confundir los roles |
| `/output-style` ya no existe (obsoleto en 2.1.73, removido en 2.1.91) | Se activa por `/config` → *Output style* o por la clave en `settings.json` |
| Un plugin que inyecta tono en cada vuelta convive con el estilo y ensucia la evaluación | Al probar tono, apagar primero cualquier inyector de tono |

## Decisiones abiertas

Ninguna está resuelta; son el trabajo de este plan.

1. **Dónde escribe el actualizador.** `.claude/output-styles/` de cada Agente Desplegado —encaja con lo que el actualizador ya hace— o `~/.claude/output-styles/` global, más simple pero el actualizador hoy no toca el home del usuario.
2. **Partición Base/Propósito**, como en todos los subsistemas: los estilos que el actualizador pisa frente a los que cada repo suma. Y si esto amerita una casa propia o alcanza con una carpeta repartida.
3. **¿Se reparte también el encendido?** Repartir el archivo solo agrega un archivo; escribir `outputStyle` en el `settings.json` **cambia el comportamiento** del repo sin que el usuario lo pida. Lo prudente conversado: repartir la definición, dejar el encendido al usuario.
4. **El idioma está fijo en español.** El texto arranca con «Hablás en español corriente»; si el harness se publica en inglés eso no se sostiene. Falta resolver cómo se expresa «el idioma del usuario» dentro del estilo, o si son dos estilos distintos.
5. **Queda solo para Claude Code.** Codex CLI no tiene equivalente, así que rompe la simetría multi-agente del harness. Documentar la degradación, como ya se hace con Codex sin subagentes.

## El estilo que se generaliza

`.claude/output-styles/espanol-corriente.md` de `como-uso-claude`. Frontmatter `name`, `description`, `keep-coding-instructions: true`, y tres bloques: *Cómo escribís*, *Palabras*, *Formato*. Tres ajustes ya aplicados y conversados, que conviene no deshacer al portarlo:

- **Tablas y diagramas habilitados en positivo.** La versión original los restringía; al usuario le suman. Se dejó una línea explícita que los nombra porque el resto del estilo empuja a acortar y sin ella se podarían.
- **Registro formal.** Salieron los coloquialismos fuertes del texto de ejemplo original.
- **La brevedad recorta el relleno, nunca el razonamiento.** Sin esa línea, «una idea por frase» choca con la Preferencia Base-0001 (dar ejemplos concretos de cada postura), que pide encadenar consecuencias.

El bloque *Palabras* quedó podado a dos líneas porque en ese repo el test del anglicismo ya llega por la Preferencia Base-0010 y por el hook de cada turno. **Al subirlo a la Base hay que revisar esa poda**: va a correr en repos sin ese hook.

## A resolver al ejecutar

- **Cómo se prueba un estilo** sin gastar una sesión: el ciclo exige proceso nuevo, así que no hay iteración rápida. Definir el procedimiento mínimo (citar textual la primera línea confirma que está cargado; un texto ausente se nota como ausente).
- **Qué pasa al actualizar** si el usuario editó el estilo repartido: respaldo, como el resto de la Base.
- **Falta la prueba en tarea larga.** El estilo se probó en turnos cortos y en el arranque de una sesión de análisis; lo que decide es un informe comparativo o una investigación con varias fuentes, donde Opus 5 se va de verbosidad. Sin eso, no hay evidencia de que el recorte alcance.

## Se cruza con

- Plan Local-0040 (Publicar el harness en inglés) — bloquea la decisión abierta 4: el idioma del estilo es parte de esa migración.
- Plan Local-0090 (Preparar el Agente Multipropósito público y replicar Componentes de Subsistema) — un estilo en español rioplatense es criterio personal, no Base pública; el corte que ese plan está definiendo decide de qué lado cae.
- Subsistema `semántica` y el hook `detectar-terminologia-vetada` de `conducta` — roles distintos, no reemplazo: el estilo actúa sobre lo que el agente le dice al usuario, el hook sobre lo que escribe en archivos.
- Página de conocimiento Local-0024 de `como-uso-claude` (*Bajar la jerga y la verbosidad del agente con un output style*) — la mecánica completa; leerla antes de arrancar.

## Origen del hallazgo

Video de Ray Amjad, *Opus 5 Is Exhausting. Anthropic Reveals The Fix.* (`https://www.youtube.com/watch?v=szjakRcw7V0`). El capítulo 03:49 propone escribir el estilo sobre **ASD-STE100**, el inglés técnico simplificado de la documentación aeronáutica: sin explorar, y es una idea aprovechable para la versión en inglés.
