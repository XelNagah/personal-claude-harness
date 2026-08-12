**Estado: Ejecutado · Creado 26-08-08 · Cerrado 26-08-11.**

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

## Insumo agregado — 11/08/2026 (corrida no interactiva)

Un pedido de crear este mismo plan llegó en una corrida sin nadie del otro lado, con un dato de mecánica que este documento no tenía: el frontmatter admitiría una clave `force-for-plugin` (default `false`) que, en `true`, haría que un plugin aplique el estilo **sin que el usuario lo elija**. De ser así, resuelve mecánicamente la Decisión abierta 3 (el encendido) del lado de «imponer», en vez de «repartir la definición y dejar el encendido al usuario» que este plan ya había conversado. **Dato sin verificar en este repo** contra la documentación oficial de Anthropic ni contra `como-uso-claude` (Preferencia Base-0009: no presentarlo como confirmado) — confirmarlo al analizar el plan, junto con `keep-coding-instructions: true` fijo, ya cubierto arriba, y la convivencia con hooks de tono propios de cada repo.

## Análisis — 11/08/2026

Sesión de `analizar-plan` sobre este plan. Se cerraron cuatro cuestiones, se acordó el texto del estilo y quedaron dos decisiones grandes abiertas.

### `force-for-plugin` — verificado

Confirmado contra la doc oficial (`code.claude.com/docs/en/output-styles`, 11/08/2026): la clave existe con ese nombre exacto, default `false`, y en `true` un plugin aplica el estilo automáticamente **pisando la elección del usuario**. Es el mecanismo de «imponer». Por la Decisión Local-0053 (la Base pública no incluye elecciones personales del autor) **no es la vía** para un estilo que hoy carga idioma y registro personales; queda anotado como capacidad, no como camino elegido.

### Cuestiones cerradas

- **Idioma (Decisión abierta 4): cerrado — español, por ahora.** Todo el Agente Multipropósito está hoy en español; publicarlo en otro idioma es traducir el 100% (plan Local-0040, Diferido), y el estilo se traduce con todo lo demás en ese momento. Deja de ser una pregunta de este plan.
- **Casa propia (Decisión abierta 2): no.** Un Subsistema (glosario Local-0006) acumula estado con índice + entradas + lint; un estilo es un archivo, no un registro que crece. Encaja como Componente Base suelto, como la Pantalla de bienvenida que la Decisión Local-0030 co-ubicó con `conducta`.
- **Solo Claude Code (Decisión abierta 5): se documenta la degradación**, como la Decisión Local-0060 con los subagentes en Codex. No es decisión del usuario.
- **El corte mecanismo / criterio personal.** Solo cuatro cosas son idioma-dependientes: `name`, `description`, el «español» de la intro y la dirección del bloque *Palabras* («traducí del inglés»). El resto (~80%) es mecanismo neutral. Es el mismo reparto del saneamiento del Local-0090: el fenómeno de la Deriva Semántica es mecanismo; su aplicación a un idioma concreto es elección personal.

### El texto acordado del estilo

Reforzado respecto del original de `como-uso-claude`: la intro separa mecanismo de idioma; el bloque *Palabras* nombra el fenómeno de la Deriva Semántica por sus clases, con el test de la Preferencia Local-0010 casi textual. `keep-coding-instructions: true`, «Cómo escribís» y «Formato» quedaron intactos. Los ejemplos de términos van entre comillas invertidas (son menciones, no uso).

```markdown
---
name: Español corriente
description: Español llano, sin jerga ni anglicismos, directo y conciso
keep-coding-instructions: true
---

Hablás claro y directo: que no cueste leerte, sin relleno ni jerga decorativa. El
registro es formal y sobrio, sin coloquialismos fuertes. Escribís en español.

## Cómo escribís

- Frases cortas, párrafos cortos, una idea por frase.
- Respondés primero lo que se preguntó; el contexto va después y solo si hace falta.
- Devolvés lo necesario y nada más: sin preámbulos, sin anunciar lo que vas a hacer,
  sin cierres decorativos.
- Nada de listas largas cuando alcanza una frase.
- La brevedad recorta el relleno, nunca el razonamiento: al comparar alternativas o
  explicar una causa, encadenás las consecuencias completas. Corto no es incompleto.

## Palabras

- El enemigo son los términos ajenos que se cuelan sin que nadie los pida:
  anglicismos crudos, copias literales del inglés, falsos amigos y metáforas
  acuñadas al vuelo (`churn`, `wedge`, `dogfooding`, `staleness`). Producen
  confusión y cuestan atención; no los uses.
- El test ante una palabra de origen inglés: ¿la diría tal cual un desarrollador
  hispanohablante en una charla en español (`commit`, `deploy`, `parsear`,
  `hardcodear`, `bug`)? Vale. ¿Es metáfora o modismo del inglés? Traducila. Ante
  la duda, traducí.
- Nada de palabras inventadas ni innecesariamente raras, aunque suenen técnicas.
- Términos de código, comandos y rutas: exactos y textuales, sin traducir.

## Formato

- Sin emoji decorativo.
- Tablas y diagramas cuando explican mejor que el texto seguido: una comparación de
  varias cosas por varios ejes va en tabla; un flujo o una jerarquía, en diagrama.
- Bloques de código sin tocar.
```

### Decisiones resueltas — 11/08/2026 (segunda sesión) · el plan pasa a Listo

Las dos decisiones que quedaban abiertas se cerraron. El reencuadre lo trajo el usuario: **el estilo no es criterio personal, es el idioma del repo**, y hoy el Agente Multipropósito entero es en español.

1. **Por qué canal viaja — resuelto: como Componente Base, igual que la Pantalla de bienvenida (Decisión Local-0030).** Se instala en todos los Agentes Multipropósito por `amp:inicializar`, **no** por el catálogo de Recomendadas.
   - **No es criterio personal bajo la Decisión Local-0053.** El texto acordado (más abajo) es español formal con voseo — el mismo registro que toda la Base: manifiestos, skills, la Pantalla de bienvenida. No hay rioplatense ni lunfardo. La premisa vieja de §*Se cruza con* («un estilo en español rioplatense es criterio personal») quedó desactivada por el texto que efectivamente se acordó.
   - **El paralelo con la Pantalla de bienvenida es exacto:** está en español, viaja entera a la Base, nadie la trató como imposición personal por estar en español, y se traduce con todo lo demás cuando llegue el plan Local-0040 (Publicar el harness en inglés). El estilo hace lo mismo: es una funcionalidad del Agente Multipropósito, que hoy **es** en español.
   - Esto **elimina** la fricción que había motivado las tres opciones (catálogo de Recomendadas / copia entre Agentes / canal nuevo): el canal ya no es el catálogo, así que no importa que el catálogo derive de un Índice y el estilo sea un archivo suelto. La dependencia con Local-0090 queda sin efecto para este plan.
   - **Tensión anotada, que no bloquea la prueba:** el bloque *Palabras* del estilo reproduce el test español/inglés de la Preferencia Local-0010, que el saneamiento del plan Local-0090 (04/08) clasificó como elección personal y sacó de la Base pública. Meter el estilo entero a la Base reintroduce ese test en lo que viaja. Pero hoy el Agente Multipropósito es 100% español: probarlo en este repo y en los del usuario (todos en español) no toca esa tensión. Se resuelve el día que se publique en inglés — que es Local-0040 (Diferido), donde hay que traducir/adaptar el estilo entero igual. No es costo de la prueba de hoy (Preferencia Local-0004, no contar como costo lo ya comprometido en todas las opciones).

2. **Parametrizar «el idioma del repo» — resuelto: «español» literal por ahora.** Para el uso diario alcanza el literal en el cuerpo del estilo; la parametrización recién paga cuando el estilo viaje a otro idioma, y ese disparador es el plan Local-0040 (Diferido), donde se traduce el Agente Multipropósito entero. Diseñar hoy la interpolación es abstracción especulativa (Preferencia Local-0006, analizar de alto a bajo nivel con cambios aditivos). Camino aditivo anotado para entonces, sin construirlo: el cuerpo dice «el idioma del repo» y el modelo lo resuelve desde la Identidad del Agente (Local-0030, sumarle idioma es aditivo), o se sustituye al instalar.

**Pendiente de asentar aparte:** la elección de canal (un estilo de respuesta viaja como Componente Base porque el idioma del Agente Multipropósito no es criterio personal mientras el producto sea monolingüe) condiciona el repo a futuro y es candidata a Decisión estructural — se propone su texto al usuario para ratificar antes de registrarla.

**Expectativa registrada:** el estilo es instrucción del prompt de sistema, no control duro (conocimiento Local-0024, sección 5). Es una tercera palanca sobre la Deriva Semántica, la más permanente, que se suma al Contraste automático en la conversación (Local-0062) y al bloqueo al escribir archivos (Local-0025). Baja la frecuencia; no la lleva a cero.

## Notas de implementación — 26-08-11

Distribución a la Base hecha y verde (lint-harness sin hallazgos propios, sincronizar-base al día), y la prueba en tarea larga con Opus 5 corrida y aprobada (más abajo). El plan cierra acá.

- **El estilo viaja como Componente Base.** `funcionalidades/amp/skills/inicializar/base/output-styles/espanol-corriente.md`, copia del vivo. El árbol `base/` de `amp:inicializar` lo copia sin necesidad de una lista.
- **Viene activado en el destino — corrige la inclinación previa.** La Decisión abierta 3 se había inclinado a «repartir la definición, dejar el encendido al usuario». Al ejecutar se vio que eso contradice la Decisión Local-0069 asentada («instalado igual que la Pantalla de bienvenida»): la Pantalla no se instala apagada. Por ese paralelo, `amp:inicializar` escribe la clave `outputStyle` en el `settings.json` del destino. Regla de merge: solo si falta; un `outputStyle` distinto ya presente no se pisa, se reporta divergente. Documentado en `PLANTILLA.md` §Hooks y en el `SKILL.md`.
- **Solo Claude Code.** El encendido va únicamente en `settings.json`; Codex CLI no tiene equivalente y ahí el estilo degrada a nada sin fallar (Decisión abierta 5, documentada como se preveía).
- **Poda del bloque *Palabras* (pendiente 4 del handoff): resuelta.** El texto acordado y el vivo llevan el bloque completo de cuatro líneas, no la versión podada de `como-uso-claude`.
- **Pendiente para `amp:actualizar`:** encender el estilo al poner al día un repo ya instalado (hoy solo lo hace `amp:inicializar` en instalación nueva). Sin construir; anotado.

### Prueba en tarea larga — 11/08/2026 · primer intento con Opus 4.8 (no cuenta)

Corrida con el estilo cargado (confirmado citando textual la primera línea; sin falso negativo por recarga). Tarea: priorizar los 49 planes vivos con fundamento —informe largo—, delegando el relevamiento en el subagente `relevador-de-planes`. El estilo recortó como se esperaba (cinco camadas con tablas en vez de 49 renglones de texto seguido, sin preámbulos ni cierres, razonamiento intacto).

**Pero corrió con Opus 4.8, no con Opus 5.** El plan pide probar donde «Opus 5 se va de verbosidad»: 4.8 es de por sí menos verboso, así que la corrida no aísla el efecto del estilo sobre el modelo que motivó el plan. **Queda pendiente rehacer la prueba con Opus 5** antes de dar el recorte por validado. No hay evidencia todavía de que haga falta ajustar el texto del estilo, pero tampoco de que no.

### Prueba en tarea larga — 26-08-11 · segundo intento con Opus 5 (la que cuenta)

Modelo confirmado antes de arrancar: `claude-opus-5`. Estilo confirmado cargado citando textual su primera línea, sin falso negativo por recarga. Misma tarea que el intento anterior, para que sea comparable: priorizar los 49 planes vivos con fundamento, delegando el relevamiento en cuatro corridas del subagente `relevador-de-planes`.

**Resultado: el estilo no necesita ajuste.** El informe salió sin preámbulo ni cierre decorativo, con los 49 planes agrupados en camadas con tablas en vez de 49 renglones de texto seguido, y el razonamiento encadenado donde cambiaba la conclusión —por qué los cinco planes de nomenclatura convienen juntos: el barrido se paga una sola vez y la ronda de ratificación no se reabre—. El recorte no se comió el fundamento, que era el riesgo del estilo.

**Límite declarado de esta prueba (Preferencia Base-0009).** No hubo corrida de control: falta el mismo informe producido por Opus 5 **sin** el estilo cargado. Lo verificado es que la salida cumple las reglas del estilo; que el recorte se deba al estilo y no a la forma de la tarea es **inferencia**, no medición. El usuario decidió asentar el veredicto con este límite en vez de pagar el control, porque el control cuesta otra tarea larga más el ciclo de apagar y volver a encender el estilo (que exige relanzar la CLI dos veces), y la reversión del estilo es una clave en `settings.json` — no hay costo hundido que lo justifique.
