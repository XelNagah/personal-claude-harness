# Convención de commits Antes/Ahora al harness

**Estado: Ejecutado · Creado 26-07-20 · Cerrado 26-07-20.** Sube al harness una convención de mensajes de commit que hoy vive solo en un repo consumidor (`sicape-backend`, archivo `commit_format.md`) y es estrictamente más rica que la que el harness instala.

## Contexto

`funcionalidades/estilo-commits/skills/inicializar-estilo-commits/PLANTILLA.md` instala una memoria que fija **dos** cosas: commits en español y sin `Co-Authored-By` ni atribución a la IA. **Nada sobre la forma del mensaje.**

Lo que se incorpora es la estructura del mensaje con cuerpo **Antes/Ahora**. No es una preferencia estética: obliga a nombrar el delta funcional observable en lugar del recorrido interno de la implementación. Eso es lo que hace legible un historial meses después, y aplica a cualquier Propósito — contabilidad, análisis de mudanza o prueba de modelos se benefician igual.

## Decisiones tomadas en el análisis

Todas ratificadas por el usuario en la sesión del 26-07-20.

### 1. Reparto: todo a la memoria, la Base no se toca

El contenido entero va a `feedback_estilo_commits.md`. `PREFERENCIAS.md` queda intacta.

**Consecuencia:** se caen del alcance el bump a Base v4, la entrada en `§Bases anteriores`, la regla de reconciliación asociada y todo cambio a `preferencias-trabajo`.

Se evaluó subir el bullet de "sin co-autoría" a la Base, porque debe pisar un default del agente anfitrión (Claude Code inyecta `Co-Authored-By: Claude …` en su system prompt) y una instrucción que compite con el anfitrión conviene que esté siempre en contexto. Se descartó: el plan pendiente [Separar mecánica del harness de criterio del autor](Separar%20mecanica%20del%20harness%20de%20criterio%20del%20autor.md) ya señala "commits en español" como criterio personal que contamina la Base — sumar más iría en contra de lo que ese plan quiere resolver.

### 2. La línea de `MEMORIA.md` se reescribe para nombrar el disparador

`MEMORIA.md` está siempre en contexto, pero solo con la línea de índice; el cuerpo se lee únicamente si el agente sigue el puntero. Hoy esa línea dice *"commits en español, sin co-autoría de IA"*. Si el formato entra al cuerpo y la línea no cambia, **el agente que va a commitear nunca se entera de que existe un formato** y redacta como siempre.

Es la misma clase de falla registrada tres veces en pendientes ([Hook de preferencias en punto de acción](Hook%20de%20preferencias%20en%20punto%20de%20accion.md), [Control de ratificación para decisiones](Control%20de%20ratificacion%20para%20decisiones.md), [Chequear el plan escrito contra la sabiduría del repo](Chequear%20el%20plan%20escrito%20contra%20la%20sabiduria%20del%20repo.md)): regla escrita que no dispara en el punto de acción.

### 3. Sin tipos: el título es `<Área>: <Resumen>`

El pedido original traía tipos (`Fix`, `Docs`, `Maintenance`, `Add`, `Test`…). Se sacan: son vocabulario de repo de software y el harness es multipropósito — un repo de contabilidad no tiene `Test` ni `Fix`. El área sí generaliza.

**Consecuencia:** también cambia la práctica de **este** repo, que hoy commitea con título a secas (`Unificar la resolucion de refs en los cinco lints de subsistema`), sin área ni cuerpo.

### 4. Sin lint nuevo

El mismo hecho está escrito en tres lugares (`description` del frontmatter, línea de `MEMORIA.md`, cuerpo de la memoria) y los tres quedan viejos si se toca uno solo. Se evaluó un lint que vigile la sincronía y se descartó por falta de lugar coherente: `estilo-commits` **no es un subsistema** (es una memoria dentro de `memoria-local`), así que no tiene carpeta propia en `.claude/` donde co-ubicar un lint sin romper la decisión 0008, y meter conocimiento de commits dentro de `lint-memoria` acoplaría `memoria-local` a `estilo-commits`.

Se actualizan los tres textos a mano y se acepta el hueco.

### 5. Nivelar sobre una convención preexistente: detectar, reportar, preguntar

Caso concreto: en `sicape-backend` el archivo se llama `commit_format.md` (no `feedback_estilo_commits.md`) y es un superconjunto de lo que el harness instala. La skill debe reconocerlo **por tema** y no crear un segundo archivo. No edita sin permiso: compara, reporta como `divergente` qué falta, y pregunta. Coherente con la regla de reconciliación que rige a las diez funcionalidades.

### 6. El banco de pruebas conductual va a plan aparte

Surgió la pregunta de si se puede **probar automáticamente** que estos mecanismos disparan. Se puede, pero no con la maquinaria existente, y no entra acá. Ver "Desprendimientos".

## Entregable

### Texto nuevo de la memoria (borrador)

```
---
name: estilo-commits
description: Commits en español, sin co-autoría de IA; título <Área>: <Resumen> y cuerpo Antes/Ahora
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin
co-autoría** (`Co-Authored-By: Claude ...`) ni atribución a la IA.

Forma del mensaje:

    <Área>: <Resumen>

    Antes, <estado previo>. Ahora, <estado nuevo>.

Reglas de redacción:

- Título en una sola línea; el resumen que sigue al área arranca en mayúscula.
- El **área es el tema funcional** del cambio, no la carpeta tocada. No usar un
  área que valga para todo el repo (en un repo íntegramente backend, `Backend`
  no aporta): usar el módulo o dominio donde ocurre el cambio. Preferir las
  áreas que el historial ya usa antes de inventar una nueva.
- Si el cambio toca **más de un área funcional**, va un commit por área.
  Excepción: cuando el cambio es atómico entre áreas (separarlo deja un commit
  roto), manda la atomicidad y el título toma el área principal.
- Cuerpo de **una o dos oraciones**, funcional, orientado al comportamiento
  observable por quien usa u opera el sistema.
- Redactar para alguien que conoce el dominio funcional pero no la
  implementación. Evitar clases, métodos, handlers y demás internos salvo que
  sean imprescindibles para explicar el impacto.
- Describir el **delta final** contra el commit anterior, no el recorrido
  interno ni las decisiones descartadas durante la implementación.
- Estado previo en términos neutros: nada de "ruidoso", "malo" o calificativos
  parecidos.
- No listar archivos modificados, salvo que el cambio sea puramente técnico o
  de mantenimiento y no tenga efecto funcional que describir.

**Why:** …
**How to apply:** …
```

Dos reglas de arriba **no** venían del pedido original y se agregaron al detectar que la redacción quedaba floja:

- *"el área es el tema funcional, no la carpeta tocada"* + *"un commit por área"* — sin esto, un cambio que toca tres carpetas no tiene área determinada y cada sesión elige distinto.
- *"una o dos oraciones"* en vez de *"cuerpo breve"* — "breve" es opinable y no frena la deriva hacia cuerpos que narran el recorrido.

### Archivos a tocar

| Archivo | Cambio |
|---|---|
| `.claude/memoria/feedback_estilo_commits.md` | cuerpo nuevo + `description` del frontmatter |
| `.claude/memoria/MEMORIA.md` | línea de índice que nombra el formato |
| `funcionalidades/estilo-commits/skills/inicializar-estilo-commits/PLANTILLA.md` | la memoria que instala |
| `funcionalidades/estilo-commits/skills/inicializar-estilo-commits/SKILL.md` | paso 2: caso de convención preexistente nombrado explícitamente |
| `funcionalidades/setup-completo/skills/inicializar-custom/PLANTILLA.md` | §`feedback_estilo_commits.md` (~línea 142), textual |
| `funcionalidades/estilo-commits/.claude-plugin/plugin.json` | `0.4.0` → `0.5.0` |
| `funcionalidades/setup-completo/.claude-plugin/plugin.json` | `0.4.1` → `0.5.0` |

### Pasos

1. Reescribir la memoria local y su línea en `MEMORIA.md`.
2. Actualizar la `PLANTILLA.md` de `estilo-commits`.
3. Agregar al `SKILL.md` de `estilo-commits` el caso de reconciliación nombrado (decisión 5).
4. Propagar al orquestador con la skill `propagar-harness` (subagente fresco para la copia, verificación carácter a carácter de los embebidos).
5. Subir las dos versiones de plugin.
6. Control de cierre: `node .claude/herramientas/control-cierre/control-cierre.js` + `node .claude/herramientas/lint-harness/lint-harness.js`.
7. Commitear con el formato nuevo (es la primera prueba real de la convención).

## Cuidados de implementación

- **Fence anidado.** La memoria vive dentro de un bloque ```` ```markdown ```` en las dos `PLANTILLA.md`. El borrador de arriba usa indentación en vez de fence para el template para no romper el anidado; al bajarlo, verificar cómo lo resuelven las otras plantillas (`preferencias-trabajo` usa un truco de espacio de ancho cero) y ser consistente.
- **Textual.** El texto de la memoria queda duplicado en `estilo-commits` y en `setup-completo`. `lint-harness` verifica que no diverjan — no editarlo a mano en un solo lado.

## Preguntas abiertas

- **¿El Antes/Ahora aplica también a las descripciones de PR?** La memoria actual cubre commits y PRs para idioma y co-autoría. El borrador extiende el formato a ambos, pero el PR suele necesitar contexto, checklist y capturas que no entran en dos oraciones. Sin ratificar.
- **¿Se asienta el criterio de reparto como decisión estructural?** Lo que se usó para decidir el punto 1 —*va a la Base lo que debe pisar un default del anfitrión o aplicar sin que nadie abra un archivo; va a memoria lo que se consulta al producir un artefacto concreto*— hoy no está escrito en ningún lado. Es lo más reutilizable que salió de la sesión y condiciona toda alta futura de reglas al harness. Sin ratificar.

## Notas de implementación

Ejecutado el 26-07-20 en dos commits: `d46b79b` (el plan) y `a004257` (la convención). Control de cierre 9/9 verde.

**Hueco encontrado durante la propagación.** El `PLANTILLA.md` del orquestador **no tiene ninguna sección que arme las líneas de índice de `MEMORIA.md`** — ni para esta memoria ni para las otras siete. El orquestador delega el índice a la prosa del `SKILL.md` ("e indexarla"), sin texto literal. Como todo el punto de la decisión 2 es que la línea **nombre el formato**, dejarlo así hubiera hecho viajar el cuerpo sin el disparador: exactamente la falla que el plan quería evitar.

Resuelto en lo acotado: la línea de esta memoria se declaró **textual** y se embebió junto a su sección en el `PLANTILLA.md` del orquestador, más un puntero en el paso 4 del `SKILL.md`. **Queda abierto para las otras siete memorias** — sus líneas de índice se siguen redactando libres en cada instalación. Si alguna vez otra memoria necesita que su línea diga algo preciso, va a chocar con lo mismo.

**Verificación textual.** Los cuatro lugares comparados byte a byte por script: cuerpo de la memoria en fuente == orquestador == memoria viva del repo (2215 bytes), y línea de índice en fuente == orquestador == `MEMORIA.md`.

**Las dos preguntas abiertas se resolvieron por criterio, sin ratificación del usuario:**

- **PRs:** el formato aplica a commits y PRs (la memoria ya cubría ambos para idioma y co-autoría). Revisable si en la práctica el PR necesita más que dos oraciones.
- **Decisión 0011:** **no** se registró. El criterio de reparto sale de un solo caso, y asentar una decisión estructural sin ratificación rompe el control que la decisión 0004 establece. Sigue sin estar escrito en ningún lado.

## Desprendimientos

**Banco de pruebas conductual de mecanismos** — plan aparte, no abierto todavía. Probar si el agente *efectivamente* aplica una regla requiere correr un agente de verdad sobre un repo fixture y evaluar el artefacto:

```
fixture: repo temporal con el harness instalado + un diff staged
prompt:  "commiteá esto"          (sin decir nada del formato)
assert:  título ~ /^[^:]+: /  ∧  cuerpo ~ /Antes,.*Ahora,/  ∧  ¬/Co-Authored-By/
corridas: N por variante, con `claude -p` (y `codex exec` para paridad)
variantes: A = línea de índice rica · B = línea pobre · C = en la Base
```

Tres cosas a tener claras si se abre:

- **No es un lint, es una medición.** El resultado es una tasa, no verde/rojo; el criterio de aceptación es un umbral sobre N corridas.
- **Es una tercera capa.** La decisión 0003 define dos: mecánica (sin LLM) y semántica (con LLM, sobre texto). Ésta corre al agente y evalúa el artefacto producido. Si avanza, amerita decisión estructural nueva.
- **El estilo de commits es el mejor primer caso**, y por eso apareció acá: el artefacto es un string corto con marcadores verificables por regex. Los otros tres incidentes de la misma clase producen prosa difusa y necesitan un LLM juez.
