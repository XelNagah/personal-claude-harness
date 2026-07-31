# Unificar el parseo de frontmatter en vez de replicarlo a mano

**Estado: Nuevo · Creado 31/07/2026.**

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

## Cómo se sabe que terminó

- Hay una decisión asentada sobre biblioteca vs función propia, con el motivo.
- El parseo vive en un solo lugar, o está escrito por qué sigue duplicado.
- El control de divergencia entre copias se retiró, o se justificó por qué sigue haciendo falta.
