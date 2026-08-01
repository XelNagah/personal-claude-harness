# Unificar el parseo de frontmatter en vez de replicarlo a mano

**Estado: Ejecutado · Creado 31/07/2026 · Cerrado 01/08/2026.**

## De qué se trata

El parseo del frontmatter de los `.md` está escrito a mano, con un regex propio, **replicado en trece piezas de código** del repo. No hay una función compartida ni una biblioteca: cada lector tiene su copia.

Este plan evalúa reemplazar esas trece copias por **una biblioteca del ecosistema** o por **una función única compartida**, y decidir cuál corresponde.

## Qué lo motiva

El 30 y 31 de julio de 2026 se arregló el defecto de la marca de orden de bytes (conocimiento `Local-0015`): un `.md` guardado con U+FEFF deja de matchear `^---` y pierde todo lo que declaraba de sí mismo, sin emitir señal.

El arreglo costó lo que cuesta un defecto en código duplicado:

- **Hubo que taparlo en los doce lectores a la vez.** Taparlo en uno solo no es una mejora parcial: es una divergencia.
- **Hay un control dedicado solo a que las copias no diverjan.** `lint-harness` exige que el fragmento sea idéntico **carácter a carácter** entre lints. Ese control existe únicamente porque el fragmento está duplicado.
- **La biblioteca del ecosistema ya lo tenía tapado.** `gray-matter` —la biblioteca de frontmatter de Node— trae `strip-bom` adentro desde hace años. El defecto se pagó entero por escribir el parseo a mano.

Es el caso que motivó la Preferencia Base-0015 (*Buscar una solución existente antes de escribir una propia*), asentada el 31/07/2026.

## Lo que hay que resolver

### 1. ¿Por qué se duplicó? (verificar antes de deshacerlo)

Hipótesis a confirmar: **cada lint es hoy un archivo autónomo**. Se copia solo, viaja solo en `base/`, y se corre solo con `node <archivo>`. Un módulo compartido introduce una dependencia entre archivos que viajan, y `sincronizar-base` tendría que llevarlo y `amp:inicializar` instalarlo en la ubicación correcta de cada repo destino.

Si la duplicación fue el precio deliberado de esa autonomía, la decisión cambia. **No deshacer antes de saberlo.**

### 2. Biblioteca o función propia compartida

| Opción | Gana | Cuesta |
|---|---|---|
| **Biblioteca** (`gray-matter` o equivalente) | El mantenimiento lo hace otro; los defectos de esta clase ya están tapados y los futuros también | Dependencia real: cada repo que instale el Agente Multipropósito necesita resolverla. Hoy los scripts corren con Node pelado, sin `node_modules` |
| **Función única propia** | Sin dependencia externa; sigue corriendo con Node pelado | El mantenimiento sigue siendo nuestro; solo elimina la duplicación, no la clase de defecto |

El compromiso central: **este repo se instala en repos de otros**. Una dependencia nueva no la paga este repo, la paga cada consumidor. Eso no descarta la biblioteca, pero pesa.

### 3. Node no está decidido, pero tiene una razón

Verificado el 31/07/2026: **ninguna de las 45 decisiones asentadas menciona Node ni la ausencia de bibliotecas.** Es un supuesto arrastrado, no una decisión.

La razón real, aunque no esté escrita: **Claude Code y Codex CLI corren sobre Node**, así que quien tiene el agente tiene Node garantizado. Con Python u otro lenguaje, cada consumidor necesitaría instalarlo aparte.

Sigue en pie, y probablemente amerite asentarse como decisión — **pero es independiente de este plan**: el lenguaje no es la causa del problema. La marca de orden de bytes está en el archivo, y cualquier lenguaje que lo lea la recibe (Python le dedicó el códec `utf-8-sig` justamente por esto).

## Alcance

**Adentro:** el parseo de frontmatter y sus trece copias; qué pasa con el control de divergencia de `lint-harness` si la duplicación desaparece; cómo viaja la solución en `base/` y cómo la instala `amp:inicializar`.

**Afuera:** cambiar de lenguaje; revisar otras duplicaciones de código del repo; el control de U+FEFF de `lint-harness`, que ya está escrito y queda igual —detecta el carácter literal colado en el código, que ninguna biblioteca puede prevenir—.

## Estado

**01/08/2026 — la hipótesis del punto 1 quedó verificada. No se tocó código todavía.**

### Lo que se midió

| Qué se midió | Resultado |
|---|---|
| `require` relativos a otro archivo del repo | **0**, en los 82 `require` de todo el repo |
| Módulos requeridos | solo la biblioteca nativa: `path` (82), `fs` (79), `child_process` (42), `os` (8), `crypto` (1) |
| Copias del parseo | **13**, confirmadas: 9 lints, 2 hooks, `sincronizar-base` y `amp-actualizar` |

### La respuesta al punto 1

**La autonomía es real, pero no fue una decisión: es un supuesto arrastrado.** Ninguna decisión asentada la ampara. La Decisión Local-0047 prohíbe dependencias **externas** —sin `package.json` ni `node_modules`—, y un módulo **propio** compartido (`.claude/comun/frontmatter.js`) no la viola. Es el mismo caso que Node antes de que Local-0047 lo asentara.

Lo que sí cambia la decisión es que **las trece copias no son un solo caso**. Se parten en cuatro grupos con costos distintos:

- **Los 9 lints de `.claude/`** — viajan en `base/` con el mismo árbol y se instalan copiando ese árbol entero. Un módulo compartido les serviría: `require` relativo al archivo resuelve igual en el destino. Costo: copiarlo a `base/` a mano la primera vez, nada más.
- **Los 2 hooks** (`establecer-conducta`, `mostrar-pantalla-bienvenida`) — mismo caso, y el costo de latencia es despreciable: el gasto dominante es arrancar el intérprete (conocimiento Local-0005), y un `require` más no arranca otro.
- **`amp-actualizar.js`** — **acá la autonomía sí es forzosa.** Corre desde la carpeta del plugin instalado (`node <ruta-de-esta-skill>/amp-actualizar.js`), fuera del repo destino, apuntándolo por argumento o `cwd`. No puede requerir un módulo del `.claude/` del destino: es justo el que está por instalar o nivelar. Su copia se queda suelta, o el módulo viaja adentro del plugin.
- **`sincronizar-base` y `lint-harness`** — Herramientas locales de este repo, no viajan. Sin restricción.

**Conclusión: la duplicación no era el precio deliberado de la autonomía, salvo en `amp-actualizar`.** Doce de las trece copias pueden compartir; una no.

### Hallazgo colateral: el control de divergencia estaba medio muerto — **ya reparado el 01/08/2026**

`lint-harness` vigila cuatro fragmentos por comentario ancla. Contando las muestras que junta de verdad:

| Fragmento | Muestras | Controla |
|---|---|---|
| `indices por frontmatter` | 8 | sí |
| `resolucion de refs` | 3 | sí |
| `atribucion por ancestro` | **1** | **no** — con una muestra, `hashes.size > 1` es imposible |
| `raiz del repo` | **0** | **no** — ningún archivo tenía ya el comentario ancla |

Es el modo de falla del conocimiento Local-0013: valida sobre un conjunto vacío y contesta en verde. El banco de `lint-harness` pasaba igual, porque **el control de divergencia no tenía ningún caso** — el otro modo de falla del mismo conocimiento, «nadie lo probó nunca».

**Reparado el mismo día, antes de seguir con este plan:**

- `raiz del repo` se **reapuntó**, no se retiró: la función seguía viva. Los lints habían migrado de deducir la raíz desde `__dirname` a derivarla de la carpeta que miran, al aplicar el conocimiento Local-0008; el ancla quedó buscando el patrón viejo. Hoy el fragmento compartido es el bloque `repoDe`, idéntico en los cuatro lints que lo tienen.
- `atribucion por ancestro` se **retiró**: nació para los dos lints que recorren subárbol y uno era `lint-memoria`, que se fue con su generación. Con un solo consumidor no hay nada que uniformar.
- Se agregó `MUESTRAS_MINIMAS`: un fragmento declarado que junta menos de dos muestras es hallazgo. Recorre los **declarados**, no los que juntaron muestras, porque el que juntó cero ni siquiera llegaba al registro.
- El banco ganó dos casos, uno por control, verificados rompiéndolos de a uno.

Y el fragmento que sí controla, `indices por frontmatter`, **cubre 8 de las 13 copias**: los dos hooks, `sincronizar-base` y `amp-actualizar` quedan afuera. De hecho **ya divergen** — los hooks usan `/^---\r?\n([\s\S]*?)\r?\n---/`, sin el `(?:\r?\n|$)` del cierre que tienen los lints.

### Lo que queda por decidir

1. ~~Si el módulo compartido se hace para los doce, y dónde vive.~~ **Hecho el 01/08/2026: se hizo, y para los trece.**
2. ~~Qué pasa con `amp-actualizar`.~~ **No hacía falta la excepción** (ver abajo).
3. ~~Los dos fragmentos muertos de `lint-harness`.~~ **Hecho el 01/08/2026.** El tercero, `indices por frontmatter`, se retiró en esta tanda al vaciarse.

## Notas de implementación

**01/08/2026 — el módulo existe y las trece copias se fueron.**

**La excepción de `amp-actualizar` no existía.** El plan la daba por forzosa porque el nivelador corre fuera del repo destino. Pero `amp-actualizar.js` vive en `funcionalidades/amp/skills/actualizar/` y `base/` en `funcionalidades/amp/skills/inicializar/base/` — **el mismo plugin**. Requiere el módulo con la misma ruta relativa con la que ya resolvía `BASE` (`path.resolve(__dirname, '..', 'inicializar', 'base')`), que existe siempre que exista el plugin. Trece de trece, no doce.

**Y lo duplicado era mucho más que el parseo.** Los ocho lints de subsistema no compartían un regex de doce líneas sino un bloque anclado de **94**: `ORIGENES`, `ETIQUETA_ORIGEN`, `sinMarcaDeOrden`, `leerFrontmatter`, `cabeceraTabla`, `indicesDe` y `problemasDeIndices`. Mover solo el regex habría arreglado 12 líneas de 94 y dejado el fragmento vigilado en pie.

Quedó en `.claude/common/` (nombre elegido por estandarización), carpeta propia y no colgada de ningún subsistema, porque es justamente lo que no pertenece a uno:

- **`frontmatter.js`** — lo requieren los trece.
- **`indices.js`** — solo los ocho lints de subsistema; requiere a `frontmatter.js`.

**Un cambio de comportamiento deliberado:** las cinco copias sueltas se unificaron hacia la forma **estricta** del cierre (`(?:\r?\n|$)`). Los dos hooks y `declaraIndice` usaban la laxa, que acepta un `---` con texto pegado en la misma línea. Era la divergencia que este plan ya había detectado.

### Lo que apareció al hacerlo

- **El control que vigila que la infra Base viaje no miraba `common/`.** Salteaba *toda* carpeta de primer nivel de `.claude/`, porque la raíz de un subsistema es donde cada repo acumula sus entradas y marcarlas daba 30 hallazgos falsos. `common/` cuelga igual de primer nivel y es lo contrario: infra pura donde todo debe viajar. Verificado borrando `base/common/frontmatter.js`: **contestó en verde**. Arreglado con `INFRA_RAIZ`, con su caso en el banco.
- **El banco del módulo tampoco viajaba**, y lo encontró el control recién arreglado en su primera corrida.
- **El escape `\uFEFF` no sobrevive a ninguna herramienta de escritura** — ni a `sed`, ni a las de edición directa: queda el carácter literal o `uFEFF`. En el módulo se resolvió comparando por código de carácter (`charCodeAt(0) === 0xFEFF`), que no se puede corromper en silencio.

### Estado de los controles

18 bancos y 251 casos en verde, control de cierre en verde, 82 archivos sincronizados con `base/`.

**Lo que falta para cerrar el plan:** asentar la decisión sobre biblioteca vs. función propia (el tercer criterio de «cómo se sabe que terminó»), y decidir el tope de contexto, que la fila nueva del Índice de conocimiento pasó por 0,2 KB.

## Cómo se sabe que terminó

- Hay una decisión asentada sobre biblioteca vs función propia, con el motivo.
- El parseo vive en un solo lugar, o está escrito por qué sigue duplicado.
- El control de divergencia entre copias se retiró, o se justificó por qué sigue haciendo falta.
