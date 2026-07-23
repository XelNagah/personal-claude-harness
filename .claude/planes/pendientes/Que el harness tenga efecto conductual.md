# Que el harness tenga efecto conductual

**Estado: En curso · Creado 26-07-21.** Origen: el usuario, sobre por qué los agentes no usan los subsistemas — *"que los agentes me discutan dónde va cada cosa, que inventen mecanismos por fuera, que no guarden conocimientos, que usen y registren terminología farlopa. Que el harness del repo empiece a tener efecto en el comportamiento. Si no, es todo al divino botón."*

## El problema

El harness está construido y verde, y **no gobierna la conducta**. Los siete subsistemas existen, los ocho lints pasan, y aun así el agente crea cosas por afuera, discute dónde va cada una y acuña términos que ya fueron vetados.

Medido sobre 18 conversaciones reales del repo `Agente-Coordinador` (~6.400 eventos, 15 MB, cinco análisis independientes), **entre un cuarto y la mitad de los turnos del usuario se van en ubicar cosas**:

| Sesión | Turnos del usuario | Gastados en demarcación |
|---|---|---|
| 16-17/07/2026 (nace `conocimiento`) | ~70 | ~16 (¼) |
| 19-20/07/2026 (nace `herramientas`) | ~34 | ~11 (⅓) |
| 21/07/2026 | ~27 | 13 son corrección, no pedido (casi ½) |

## Diagnóstico

La parte **general** —cómo falla un agente ante una regla escrita, con la evidencia— está asentada aparte, porque es saber reutilizable fuera de este repo:
👉 [`conocimiento/modos-de-falla-ante-reglas-escritas.md`](../../conocimiento/modos-de-falla-ante-reglas-escritas.md)

Lo que sigue es lo **específico de este harness**.

### El punto ciego: nada mira lo que quedó afuera

Confirmado por tres vías independientes:

1. **Código.** En los 8 lints, la raíz de barrido es siempre el directorio del propio subsistema. `repoRoot` aparece únicamente para *resolver* referencias, nunca para *recorrer*.
2. **Nivelador.** Su chequeo de la raíz del repo fue literalmente `ls -1 AGENTS.md CLAUDE.md` — preguntó por los dos archivos que espera encontrar; nunca listó la carpeta.
3. **Reporte.** *"Nivelado completo… prácticamente la implementación de referencia del harness. Nada que agregar, nada divergente"* — dicho sobre un repo con `conocimiento/` vacío, la lista de comandos fuera de todo subsistema, y cuatro artefactos sin rutear en la raíz (`fichas/`, `tools/`, `sessions.json`, `contenedores/`).

**No es que el control tolere lo de afuera: es que mira solamente adentro y vuelve orgulloso.** Hueco adicional: los `SKILL.md` no están cubiertos por ningún lint de terminología — un término vetado sobrevivió ahí.

### Los criterios se acordaron y se perdieron

La arqueología rescató **24 reglas generales de demarcación** enunciadas y aceptadas en conversación. Llegaron a un registro **dos**. Las otras 22 se dijeron, se aplicaron y se evaporaron — por eso las mismas discusiones vuelven cada semana.

Se ordenan en **cinco ejes**. Ninguno fue inventado en el análisis; todos salen textuales de los transcripts:

| Eje | Pregunta que responde | Origen textual |
|---|---|---|
| **1. De quién es** | ¿harness/agente o producto? | *"Es parte del harness e ingeniería de contexto de cada repo, pero no del proyecto en sí"* · *"**Es un servicio, no un producto.** Distinto sería si el propósito es diseñar una página web"* |
| **2. Qué relación tiene el agente con la cosa** | ¿la **lee**, la **sabe** o la **ejecuta**? | *"son lo que el agente **lee**, no lo que **sabe**"* · *"son lo que **se ejecuta**, no lo que el agente…"* |
| **3. Cambia o está fijo** | ¿estado vivo o veredicto? | *"`sessions.json` es estado vivo… es **runtime, no fuente**"* · *"memoria = estado en curso que **cambia**; decisión = elección estructural que se toma **una vez**"* |
| **4. Es invocable por sí mismo** | dentro de herramientas: ¿fila o tripa? | *"sus tripas no son filas"* · *"el **Comando es la forma de llamarla**"* |
| **5. Sustantivo o verbo** | glosario o memoria de comandos | *"Glosario = los sustantivos (qué **son**). Memoria de comandos = los verbos (qué **hacés**)"* |

Con esos cinco ejes, los casos que se discutieron durante semanas se resuelven sin discusión — salvo **uno**: `sessions.json`, el estado vivo de una Herramienta, que **ningún subsistema acepta**. Es un hueco real de cobertura, no un error de ruteo.

Otros criterios sueltos, ya acordados y sin asentar: *los sinónimos también requieren autorización del usuario, no solo los conceptos* · *no fijar cantidades en las definiciones* · *reapuntar una referencia muerta a una viva es mantenimiento, no cambio de contenido* · *no resolver el síntoma literal, alinear el caso al patrón general*.

⚠️ **Ninguno de estos criterios se asienta sin tu ratificación** (decisión 0004, control duro). Están acá como propuesta ordenada, no como decisión tomada.

### El costo no es el criterio

Medido con precios reales de Opus 4.8 ($5/M entrada, $25/M salida; lectura de cache ~0,1×):

| | Costo |
|---|---|
| Re-inyectar una línea de ruteo (~70 tokens) en una sesión de 60 turnos | **≈ US$ 0,09** |
| Un solo debate de demarcación (~10 intercambios) | **≈ US$ 0,50** |

Ambas cifras son ruido. **La decisión no es económica**: lo que se paga caro son los turnos del usuario. El debate de la lista de comandos costó cinco intervenciones y terminó en *"deja de discutirme"*.

## Los tres frentes

**A — Asentar los criterios.** Ratificar los cinco ejes y los 22 criterios, uno por uno, y bajarlos a `decisiones/` y `glosario/`. Sin esto no hay contra qué chequear, y las discusiones se reabren solas (pasó: una se reabrió a las ocho horas).

**B — Cerrar el punto ciego.** Que el control barra la raíz del repo y reporte lo no ruteado; que el nivelador liste de verdad; que los `SKILL.md` entren al alcance del lint de terminología. Es mecánico y barato, y **no se puede desobedecer porque es un programa**. Versión mínima útil: inventariar sin juzgar — *"estas cuatro cosas están fuera de todo subsistema"* no necesita los criterios de A para servir.

**C — El mecanismo en el punto de acción.** Re-inyección en el punto de acción en vez de texto cargado al arranque. **Se diseña ahora** (no se espera): separar *solucionar* (construir el mecanismo, con la cabeza) de *verificar* (que efectivamente cambie la conducta, que sí lleva medición). Evidencia local en vivo de que funciona: el hook de caveman (`UserPromptSubmit`) se re-inyectó cada turno de la sesión del 22/07 y **se pegó** — hubo que anularlo a mano. El diseño es un mapa **{clase de regla → punto de acción → tipo de hook}**: cada turno (`UserPromptSubmit` → preferencias, no acuñar términos) · antes de escribir/crear (`PreToolUse` sobre `Write`/`Edit` → demarcación 0020) · antes de afirmar/preguntar (`PreToolUse` sobre `AskUserQuestion` → ratificación). Ese mapa es la resolución **única** que absorbe `Hook de preferencias`, `Control de ratificación` y `Chequear el plan escrito`.

**Actualización 22/07 (tarde):** el chequeo de capacidades de hooks corrigió una premisa del mapa — `PreToolUse` **no inyecta contexto, solo bloquea**; el recordatorio antes de actuar solo existe vía `UserPromptSubmit`. El diseño maduró a un **subsistema propio, `conducta`** (decisión 0021): ata momentos del flujo a acciones (inyectar/correr/bloquear) por un hook repartidor que lee un registro compartido, viene con **Base instalada** y se apoya en los otros subsistemas. Construcción en su plan propio: `Construir el subsistema conducta`.

### Ya ejecutado (21/07/2026): B mínimo — inventario sin rutear

Primera pieza del frente B. Herramienta `inventariar-componentes-sueltos` (`.claude/herramientas/inventariar-componentes-sueltos/`): barre `.claude/` y lista los componentes (archivos y carpetas) que no son subsistema (por el criterio de lint co-ubicado de `pantalla-bienvenida`, decisión 0008) ni infra conocida. **Inventaría, no juzga.** Corre suelta (no cableada a `control-cierre`: eso ya sería veredicto) y acepta una ruta para apuntarla a un consumidor a mano.

Alcance **opción A** (acordada 21/07/2026): solo `.claude/`, no la raíz del repo. Motivo: barrer la raíz sin los criterios del frente A marca todo el Propósito real como sospechoso; `.claude/` sí es decidible hoy. Probada en verde acá (0 sin rutear) y contra un repo sucio de juguete (caza carpetas/archivos mal puestos, incluida una carpeta con nombre de subsistema pero sin su lint). Control de cierre 9/9.

**De B todavía falta:** (1) extender el barrido a la **raíz** del repo — espera criterios del frente A; (2) que el **nivelador liste de verdad** (hoy pregunta por los archivos que espera, no lista la carpeta); (3) que los **`SKILL.md`** entren al alcance del lint de terminología (un término vetado sobrevivió ahí); (4) **distribuir** el inventario a los 15 consumidores (hoy es instrumento de diagnóstico manual).

### Ya ejecutado (21/07/2026): el piloto de `conocimiento`

`conocimiento` estaba en **0 páginas** con lint verde. Se arregló con tres patas —skill `registrar-conocimiento`, línea de escritura en `planificar`, disparador en `AGENTS.md`— más propagación verificada por hash. Quedó en 1 página.

**Es el experimento controlado del frente C, con n=1 y costo cero:** si el número sube solo en las próximas semanas, arreglar el mecanismo cambia la conducta y vale la pena construir B y C completos. Si sigue en 1, la tesis está mal y hay que saberlo antes de gastar. El instrumento de medición ya corre en cada arranque (`/amp-info`).

El molde que dejó se aplica a los otros seis subsistemas en [Revisar cada subsistema](Revisar%20cada%20subsistema%20-%20sentido,%20disparador%20y%20skill%20de%20operacion.md).

## El juez final

[Banco de pruebas conductual](Banco%20de%20pruebas%20conductual%20de%20mecanismos.md), en la definición ampliada por el usuario el 21/07/2026: **instanciar automáticamente decenas, cientos o miles de Agentes Multipropósito con propósitos distintos y estudiar su comportamiento.** Prueba de estrés de los mecanismos.

> *"Si todos terminan inventándose herramientas fuera de los subsistemas es una garompa esto. Si más o menos va guiando a los agentes y demuestra poder utilizar los subsistemas para cumplir los propósitos dados, la cosa funciona."*

Es lo que decide si todo este esfuerzo vale la pena. Va después, pero es el criterio de aceptación de lo anterior.

## Planes que este plan absorbe o coordina

Cinco planes pendientes son **la misma falla** vista desde cinco ángulos — una regla escrita que no dispara en el punto de acción. Conviene resolver el mecanismo **una vez**, no cinco:

- `Hook de preferencias en punto de accion`
- `Control de ratificacion para decisiones`
- `Chequear el plan escrito contra la sabiduria del repo`
- `Banco de pruebas conductual de mecanismos`
- `Capa semantica de coherencia` (la capa que la decisión 0003 dejó pendiente)

## Resuelto en análisis (22/07/2026, por `planificar`)

Las cuatro preguntas abiertas quedaron contestadas:

- **Forma de asentar A (era "fila por fila vs por eje").** Se ratifican los **5 ejes** como *test de demarcación* → **decisión 0020** + página de detalle con los casos resueltos y los criterios finos como ejemplos. **No** 22 decisiones sueltas (re-correría la evaporación). Los 5 ejes: de quién es · lee/sabe/ejecuta · cambia o fijo · invocable por sí mismo · sustantivo o verbo.
- **`sessions.json` (era "¿hueco o subsistema nuevo?").** No es hueco: es un **Registro volátil** (glosario nuevo) — contenido interno de la Herramienta que lo administra; esa Herramienta es fila del registro, el estado no. Cero subsistemas nuevos. Lo efímero es una propiedad, no un Tipo.
- **Producto del Propósito (glosario nuevo).** Lo que el repo produce vive en la raíz, fuera de `.claude/`, y es correcto que quede afuera — criterio que destraba el barrido de la raíz del frente B.
- **Secuencia y espera del piloto.** A ahora (necesita al usuario presente, y ya arrancó: veto de `tripa`, 2 conceptos, `sessions.json`). B es mecánico, va después. **El piloto NO frena nada**: baja a telemetría de fondo (páginas de `conocimiento` en `/amp-info`); *solucionar* C se hace ahora, *verificar* se mide o se testea activo (`Banco de pruebas conductual`). Sin fecha fija.

## Falta

- **A:** sumar a la página 0020 los criterios finos que aún no se enumeraron (arqueología: ~24 rescatados, varios sin escribir), cada uno con ratificación.
- **B:** (1) barrido de la **raíz** — ya destrabado por *Producto del Propósito*; (2) nivelador que **liste de verdad**; (3) `SKILL.md` al alcance del lint de terminología (un vetado sobrevivió ahí — el lint del 22/07 confirmó backlog de vetados en PLANTILLAs distribuibles); (4) **distribuir** el inventario a los consumidores.
- **C:** construir el mapa de hooks (arriba).
