# Que conocimiento tenga Índice del Agente Multipropósito

**Estado: Ejecutado · Creado 31/07/2026 · Cerrado 01/08/2026.**

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
conocimiento `Base-0001` —evitar el mismo dato escrito en varios lugares— multiplicado
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

**Medido el 31/07/2026.** Dos correcciones a lo de arriba:

1. **En este repo no se suman ocho filas: se mudan.** Las ocho páginas candidatas ya están en el
   índice; se recodifican de `Local-` a `Base-` y cambian de archivo. Lo único nuevo es el encabezado
   del segundo Índice — unos 500 bytes, tomando `SUBSISTEMAS-LOCAL.md` como referencia. El "de 15 a
   23" describe al repo **destino**, que hoy tiene cero filas.
2. **El presupuesto ya no bloquea.** Estaba en 47.8 KB de 48 (margen: 200 bytes). Se recortaron las
   once descripciones del índice que excedían la convención de una línea —trabajo que correspondía
   igual, el desarrollo ya estaba en cada página— y quedó en **45.3 KB**. Con la Preferencia Base-0016
   asentada el mismo día, **45.9 KB**: 2.1 KB libres.

Lo que sigue sin decidirse es la curaduría: cuántas de las ocho suben.

### 3. La mecánica

- Recodificar: `Base-NNNN` para las páginas del Agente Multipropósito, `Local-NNNN` para las del repo.
  Los códigos actuales son todos `Local-` y algunos cambiarían de prefijo.
- Las páginas Base tienen que viajar en `base/conocimiento/`, y `sincronizar-base` llevarlas.
- El manifiesto declara los dos Índices y sus dos líneas de importación (decisión 0042).
- `lint-conocimiento` tiene que entender los dos orígenes.
- ~~Revisar si el `lint-harness` necesita el chequeo hermano del de citas a decisiones (dec. 0024)~~
  **Hecho el 31/07/2026.** `lint-harness` tiene la sección `ENLACES DE LO QUE VIAJA A ALGO QUE NO
  VIAJA`, generalizada a cualquier enlace relativo y no solo a los de `conocimiento/` (medido: 23
  enlaces resuelven y 1 no, así que generalizar no trae ruido). **Su único hallazgo es el enlace de
  este plan**, así que el repo queda con el control de cierre en 1 hasta que esto se ejecute — es a
  propósito: el defecto pasó de invisible a medido.

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

## Notas de implementación

Ejecutado el 01/08/2026. Los tres criterios de cierre se cumplen: la **Decisión Local-0048** asienta el
criterio, `lint-harness` ya no reporta el enlace de `TERMINOLOGIA-FARLOPA.md`, y las páginas viajan.

**La curaduría dio tres, no ocho.** El criterio que el plan traía —*"sigue siendo cierta en un repo
cuyo Propósito no es construir un harness"*— era de **verdad** y no separaba: casi toda la sabiduría
sobre agentes sigue siendo cierta en cualquier lado. El criterio que quedó pregunta **por el
beneficiario**: sube lo que le sirve al Agente Desplegado a hacer bien su trabajo —le explica cómo
funciona algo que va a usar, le evita perderse, o es una regla útil para cualquier propósito—, y lo
que este repo aprendió *construyendo y propagando* el Agente Multipropósito se queda como
documentación del proyecto. Con eso pasan tres páginas: *Evitar el mismo dato escrito en varios
lugares*, *Buscar con acentos en Windows devuelve cero aunque haya coincidencias* y *Terminología
farlopa*.

**Las páginas se reescribieron, no se mudaron.** Dos de las tres pasaban el criterio por su tesis pero
tenían el cuerpo lleno de la historia de este repo —los cuatro lints, el marketplace, citas a
decisiones propias—. Se escribieron de nuevo sin eso y las versiones anteriores se borraron: conservar
las dos habría sido el defecto que la primera de ellas describe. Antes de borrar se rescató a
`controles-que-no-avisan.md` lo único que no vivía en ningún otro lado (la prueba terminada que quedó
en la carpeta temporal).

**El presupuesto de contexto no bloqueó.** El plan temía sumar ocho filas; en este repo las páginas se
**mudan** de archivo, así que lo único nuevo es el encabezado del segundo Índice. Se recortaron además
las once descripciones del Índice que excedían la convención de una línea.

**Dos defectos encontrados y arreglados en el camino**, ninguno previsto por el plan:

- `lint-conocimiento` guardaba **un** Índice por carpeta, así que el segundo tapaba al primero y
  reclamaba las doce páginas del tapado.
- El nivelador habría **pisado el Índice de conocimiento de cada repo instalado**, con sus páginas
  adentro: `INDICE.md` cambió de origen y pasó a viajar como mecanismo. Se sumó a `INDICES_PARTIDOS`,
  que emite el renombre `partir por origen` antes de reemplazar.

Los dos con su caso en el banco, verificados rompiendo cada condición por separado.
