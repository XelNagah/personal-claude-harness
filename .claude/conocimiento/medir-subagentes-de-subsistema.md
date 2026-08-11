# Medir el ahorro de contexto de un subagente de subsistema

Los **subagentes de subsistema** (Familia 1 del plan Local-0094) son los que viajan con un subsistema del harness y hacen su recorrido de volumen en su propia ventana de contexto: `buscador-de-terminologia` (semántica), `buscador-de-conocimiento` (conocimiento), `relevador-de-planes` (planes) y `relevador-de-aprendizaje` (subsistemas). Todos de solo lectura por construcción (`tools: [Read, Grep, Glob]`, `model: sonnet`). La habilidad los invoca para que las decenas de lecturas del recorrido no queden en el hilo principal.

Esta página asienta **cómo se mide** ese ahorro y **cuánto dio**, para no re-derivar el método cada vez que se agrega uno.

## El método de medición

Cada corrida de un subagente deja su propia transcripción. Medir el efecto es leerla y comparar dos volúmenes:

- **Lo evitado** — la suma de caracteres de los bloques `tool_result` de la transcripción del subagente: lo que el subagente leyó y el hilo principal **no** recibió.
- **Lo devuelto** — el largo del último texto del asistente en esa transcripción: el reporte que sí entró al hilo principal.
- **Ahorro** = `1 − devuelto / evitado`.

La conversión a tokens (≈ 4 caracteres por token) es aproximada; los caracteres son exactos.

**Dónde está la transcripción — la trampa que costó ubicar:** el archivo real es
`~/.claude/projects/<repo>/<sesión>/subagents/agent-<id>.jsonl`. Dos detalles que hacen fallar la búsqueda:

- La carpeta `subagents/` **cuelga del directorio de sesión** (un nivel por debajo del directorio de proyecto), no directamente del proyecto. Un glob `~/.claude/projects/*/subagents/agent-*.jsonl` no la encuentra; hay que recorrer recursivo.
- El archivo de tarea que expone el harness (`…/tasks/<agentId>.output`) puede quedar **vacío** (0 bytes): no es la transcripción. La transcripción es el `.jsonl` bajo `subagents/`.

Formato del `.jsonl`: una línea por evento; el objeto trae `message` con `role` y `model`, y `message.content` es un arreglo de bloques con `type` `thinking` / `tool_use` / `tool_result` / `text`. En las corridas medidas, `tool_result.content` viene como string.

## Verificar el modelo en la transcripción, no en el frontmatter

Que el frontmatter del subagente declare `model: sonnet` no prueba que haya corrido a ese modelo. La prueba real es el campo `model` de las respuestas del subagente en su `.jsonl`: en las tres corridas medidas dice `claude-sonnet-5`, mientras el hilo principal seguía en el modelo de la sesión (`claude-opus-5` en agosto 6, `claude-opus-4-8` en agosto 10 y 11). El ahorro de plata —leer volumen tonto a precio Sonnet en vez del modelo del hilo— es real y aparte del ahorro de contexto.

## Los resultados medidos

| Subagente | Fecha | Modelo (leído del `.jsonl`) | Evitado (chars) | Devuelto (chars) | Ahorro |
|---|---|---|---|---|---|
| `buscador-de-terminologia` (43 planes) | 2026-08-06 | `claude-sonnet-5` | 119.778 | 19.439 | ~84% |
| `relevador-de-planes` (49 planes vivos) | 2026-08-10 | `claude-sonnet-5` | 390.458 | 22.708 | ~94% |
| `relevador-de-aprendizaje` (todo el Aprendizaje) | 2026-08-11 | `claude-sonnet-5` | 48.511 | 5.291 | ~89% |

**Por qué el ahorro varía:** depende de cuánto lee el recorrido por cada dato que devuelve, no del subsistema. `relevador-de-planes` abre un documento entero por plan (390 KB para 49 fichas) y comprime al ~94%. `relevador-de-aprendizaje` **muestrea** —lista directorios, lee encabezados y los Índices ya cargados, sin abrir cada plan, cada página ni cada detalle— así que lee menos por dato y queda en ~89%. `buscador-de-terminologia` devuelve apariciones sueltas de un término, el dato más liviano de los tres, y queda en ~84%. Cuanto más lee por unidad de resultado, más comprime.

## El corte evidencia/decisión

El subagente **trae evidencia, nunca decide sobre ella** (Decisión Local-0060). Releva y devuelve el inventario con archivo y línea; no mueve, no prioriza, no ratifica, no reubica. La decisión —priorizar, reubicar de a un Componente de Subsistema por vez, ratificar un término— queda en el hilo principal, con el usuario. Por eso los `tools` acotados a solo lectura no son una limitación incómoda sino el diseño: el subagente no puede escribir aunque se confunda.

**Cómo se verificó:** corriendo cada subagente en una sesión arrancada **después** de instalar la versión del plugin que lo incluye (la sesión que instala el plugin lo ve `SIN CARGAR` y sigue con el viejo; medir ahí mide un subagente que no existe). Los números salen de leer la transcripción `.jsonl` de cada corrida con el método de arriba. Detalle y contexto de cada corrida en el plan Local-0094, Familia 1.

**Cuándo aplica / cuándo no:** aplica a los subagentes de subsistema, que hacen recorridos de volumen y son de solo lectura. Los **agentes de código** (Familia 2 del plan: `test-runner`, `code-reviewer`, `depurador`, `investigador`) todavía no se midieron acá y su economía es otra —dependen de que el repo tenga código—. El método de medición sí es el mismo: leer la transcripción y comparar evitado contra devuelto.
