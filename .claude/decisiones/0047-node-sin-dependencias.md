# 0047 — Node sin dependencias externas

## Qué se decidió

Todo el código que el Agente Multipropósito distribuye —los lints de cada subsistema, el hook repartidor, las Herramientas, el motor del actualizador— se escribe en Node y usa solo su biblioteca nativa. No hay `package.json` ni `node_modules`, y los scripts corren con `node <archivo>` pelado, sin paso de instalación previo. Ratificado el 31/07/2026.

Son dos decisiones que se sostienen en el mismo razonamiento pero se pueden revisar por separado: **el lenguaje** y **la ausencia de bibliotecas**.

## Por qué

### El consumidor ya tiene Node, y no tuvo que elegirlo

Claude Code y Codex CLI corren sobre Node. Todo repo donde este Agente Multipropósito se instala tiene un agente, así que tiene Node garantizado sin haber decidido nada.

Con Python o cualquier otro lenguaje, cada consumidor tendría que instalarlo aparte para correr un lint que no pidió. La asimetría es el punto: **este repo se instala en repos de otros**, así que el costo de una elección técnica no lo paga quien la toma.

### Una dependencia la paga cada consumidor, no este repo

Lo mismo, un nivel más abajo. Agregar una biblioteca es gratis acá y recurrente allá: cada repo que instale el Agente Multipropósito necesita resolverla, y hoy no necesita resolver nada.

Eso **no descarta** una biblioteca para siempre; le pone el costo por escrito para que la evaluación sea honesta. Es el mismo criterio que la Preferencia Base-0015 fija en general —buscar una solución existente antes de escribir una propia, y decir qué se encontró y por qué se usa o no—, aplicado al código que se distribuye.

## Verificado

El 31/07/2026, sobre todo el código del repo: los cinco módulos en uso son **todos nativos**.

| Módulo | Usos |
|---|---|
| `path` | 80 |
| `fs` | 77 |
| `child_process` | 41 |
| `os` | 8 |
| `crypto` | 1 |

No existe `package.json` ni `node_modules` en el repo.

## Lo que esta decisión NO decide

**Si el parseo de frontmatter debe unificarse** en una función compartida o en una biblioteca del ecosistema. Eso lo evalúa el plan Local-0087, y el lenguaje no es la causa de esa duplicación: la marca de orden de bytes está en el archivo, y cualquier lenguaje que lo lea la recibe —Python le dedicó el códec `utf-8-sig` justamente por eso—.

Lo que esta decisión le aporta a ese plan es el costo del lado de la biblioteca, ya escrito, para que no haya que re-derivarlo.
