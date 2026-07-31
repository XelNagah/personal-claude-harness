# Que conocimiento tenga Índice del Agente Multipropósito

**Estado: Nuevo · Creado 31/07/2026.**

## De qué se trata

`conocimiento` tiene **un solo Índice**, de origen `agente-desplegado`. El Agente Multipropósito no
aporta ninguna página, así que todo lo que este repo aprendió sobre **trabajar con agentes** muere
acá y no llega a ningún Agente con Propósito.

Este plan evalúa partir el subsistema en dos Índices —`INDICE.md` (Agente Multipropósito) e
`INDICE-LOCAL.md` (Agente Desplegado)—, como ya lo están `subsistemas`, `preferencias`,
`herramientas` y `conducta`.

## Qué lo motiva

### El síntoma que lo destapó

Un Agente Desplegado reportó el 31/07/2026 que `TERMINOLOGIA-FARLOPA.md` —que viaja hasta el
separador de su tabla— apunta a `../conocimiento/terminologia-farlopa.md`, una página que **no
viaja**. Enlace roto en cada repo instalado.

**Y lo resolvió escribiendo la página en su conocimiento local.** Ahí está el costo real: cada repo
que instale el Agente Multipropósito va a reescribir la misma página, cada uno con un agente distinto
y un contexto distinto, y todas van a decir cosas parecidas pero no iguales. Es el defecto del
conocimiento `Local-0014` —el mismo dato en dos lugares, sin nada que los sincronice— multiplicado
por cada consumidor.

El enlace roto no es un enlace mal puesto: es un registro Base queriendo apuntar a un conocimiento
Base que todavía no existe.

### Por qué el criterio actual no aguanta para conocimiento

La decisión 0042 dice que hay dos Índices cuando el contenido viene de dos orígenes. Hoy:

| Con contenido del Agente Multipropósito | Sin él |
|---|---|
| `subsistemas`, `preferencias`, `herramientas`, `conducta`, y `planes` (vía `ESTADOS.md`) | `conocimiento`, `semantica`, `decisiones` |

Para `semantica` y `decisiones` la premisa aguanta: el vocabulario y las decisiones son del dominio de
cada repo. **Para `conocimiento` no**, porque buena parte de lo que hay acá no es sobre este repo: es
sabiduría sobre trabajar con agentes, que vale igual en cualquier Agente con Propósito.

### La distinción que hay que sostener

**La mecánica ya viaja.** Los `MANIFIESTO.md` y `README.md` de cada subsistema explican cómo funciona
el Agente Multipropósito y llegan a cada desplegado. No falta documentación.

Lo que no viaja es la **sabiduría**: los modos de falla, las trampas ya pagadas, el porqué de cada
forma. Ese es el contenido de este plan, y es otra cosa que documentar la mecánica.

## Lo que hay que resolver

### 1. La curaduría, página por página

Relevado el 31/07/2026 sobre las 15 páginas del índice. **Ocho parecen universales:**

- Modos de falla ante reglas escritas
- Terminología farlopa
- Cambiar la forma de un registro rompe a sus lectores
- Controles que dejan de controlar sin avisar
- El mismo dato en dos lugares
- El repo que un script describe
- La marca de orden de bytes tapa el frontmatter
- grep y acentos en Windows

**Seis parecen propias del Propósito de este repo** —hooks de Claude Code, hooks de Codex CLI,
latencia de hooks, despliegue de plugins, proyectos similares al harness, replicar Hermes— y se
quedarían.

Es una lista de trabajo, no una decisión tomada: cada página se juzga al subirla. El criterio a
acordar es qué hace universal a una página; la primera aproximación es **si sigue siendo cierta en un
repo cuyo Propósito no tiene nada que ver con construir un harness**.

### 2. El costo de contexto

El Índice de conocimiento **se carga siempre**. Sumar ocho filas Base lo lleva de 15 a 23 en todo repo
instalado, incluido uno recién inicializado que todavía no aprendió nada propio. Hay que decidir si
ese precio se paga entero o si la Base arranca con menos.

### 3. La mecánica

- Recodificar: `Base-NNNN` para las páginas del Agente Multipropósito, `Local-NNNN` para las del repo.
  Los códigos actuales son todos `Local-` y algunos cambiarían de prefijo.
- Las páginas Base tienen que viajar en `base/conocimiento/`, y `sincronizar-base` llevarlas.
- El manifiesto declara los dos Índices y sus dos líneas de importación (decisión 0042).
- `lint-conocimiento` tiene que entender los dos orígenes.
- Revisar si el `lint-harness` necesita el chequeo hermano del de citas a decisiones (dec. 0024): hoy
  **nada detecta** una referencia a conocimiento que no viaja, y por eso el enlace roto lo encontró
  una persona y no un control.

## Alcance

**Adentro:** partir `conocimiento` en dos Índices; la curaduría de las 15 páginas actuales; que las
páginas Base viajen; el control que caza referencias a conocimiento que no viaja.

**Afuera:** hacer lo mismo con `semantica` y `decisiones` —ahí la premisa de origen único sigue en
pie—; escribir páginas de conocimiento nuevas.

## Cómo se sabe que terminó

- Hay una decisión asentada que extiende la 0042 a `conocimiento`, con el criterio de qué sube a Base.
- Un repo recién inicializado recibe las páginas Base, y el enlace de `TERMINOLOGIA-FARLOPA.md`
  resuelve sin haber tocado esa línea.
- Ningún Agente Desplegado necesita reescribir a mano una página que el Agente Multipropósito ya sabe.
