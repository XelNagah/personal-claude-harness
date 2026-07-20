# Alcance de escaneo de glosario y decisiones

**Estado: Nuevo · Creado 26-07-20.**

## Origen

Se desprende de [Unificar la resolución de refs en los lints de subsistema](../ejecutados/Unificar%20la%20resolucion%20de%20refs%20en%20los%20lints%20de%20subsistema.md). Al revisar los cinco lints aparecieron **dos** ejes de inconsistencia, no uno: los candidatos de resolución (ya unificado) y el **alcance de escaneo** (esto). El usuario ratificó atacar el primero y dejar este aparte, con el análisis ya hecho.

## El hueco

`lint-glosario` y `lint-decisiones` solo leen **la columna Detalle de su `INDICE.md`**. Nunca abren el cuerpo de las páginas de detalle que ese índice referencia.

| Lint | Qué escanea |
|---|---|
| memoria | todos los `.md` del árbol del subsistema |
| conocimiento | todos los `.md` del árbol del subsistema |
| **glosario** | **solo la columna Detalle de `INDICE.md`** |
| **decisiones** | **solo la columna Detalle de `INDICE.md`** |

Consecuencia concreta: `.claude/decisiones/0010-arquitectura-multiagente.md` existe y puede tener refs adentro. Ninguna se valida. Si `glosario/harness.md` escribe `[dec. 0008](../decisiones/INDICE.md)` y mañana se renombra `decisiones/`, el link queda roto y ningún lint lo detecta — nunca. En `conocimiento/` el mismo error sí se detecta.

Es la dirección **opuesta** al bug que originó el plan padre: allá sobraban alarmas falsas, acá faltan alarmas legítimas.

## Preguntas a resolver (ninguna decidida)

1. **¿Se unifica con memoria/conocimiento?** O sea, que los dos lints recorran todo el `.md` de su carpeta y validen refs con el mismo `resolverRef` que ya comparten. Es lo coherente con el patrón de subsistema (decisión 0002), pero cambia comportamiento: repos consumidores que hoy dan verde pueden empezar a reportar refs rotas **reales** que estaban escondidas. Eso es correcto, pero es ruido al nivelar.
2. **¿Y los huérfanos?** Hoy `lint-glosario` marca huérfana toda página de `glosario/` no referenciada por la tabla. Si se pasa a escanear cuerpos, una página referenciada solo desde otra página de detalle deja de ser huérfana. ¿Se quiere ese cambio o el índice debe seguir siendo la única vía de entrada?
3. **¿Alcanza a `lint-planes`?** No entró al análisis del plan padre. Resuelve las refs de `PLANES.md` contra un mapa de disco (`enDisco`), un sexto criterio, y tampoco lee el cuerpo de los documentos de plan. Se cruza con [Estructura del documento de Plan](Estructura%20del%20documento%20de%20Plan.md), que todavía no definió qué lleva adentro un plan.

## Pasos (después de resolver lo de arriba)

1. Línea de base de los lints afectados (verificando que la salida sea de lint, no un error — ver el error de método documentado en el plan padre).
2. Aplicar el cambio de alcance acordado.
3. Comparar contra la línea de base: cada hallazgo nuevo se justifica uno por uno. Acá se **esperan** hallazgos nuevos, al revés que en el plan padre.
4. Propagar con `propagar-harness` a las plantillas de `glosario` y `decisiones` y al orquestador. Bumpear versiones.
5. Cierre con `control-cierre` verde.

## Nota

El fragmento `resolucion de refs` ya está compartido y custodiado por `lint-harness`. Este plan cambia **qué archivos se recorren**, no cómo se resuelve una ref: no debería tocar el fragmento compartido.
