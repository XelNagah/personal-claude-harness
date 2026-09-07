# 0078 — El plugin de código se habilita repo por repo

## Qué se decidió

Los cuatro subagentes de trabajo de código —`investigador`, `test-runner`, `code-reviewer` y
`depurador`— viajan en un plugin propio, separado de lo que se instala en todo Agente Desplegado.
Cada repo lo habilita si tiene código. No se construye ninguna noción de «tipo de repo».

Ratificado por el usuario el 23/08/2026, resolviendo el punto abierto 1 del plan Local-0094
(Subagentes del AMP para el flujo de desarrollo por etapas).

## Por qué no viajan con los demás

El criterio que los separa es **a quién le sirven**, no de quién son.

Los subagentes que ya existen pertenecen cada uno a un subsistema y viajan en su plugin: si el
repo no tiene `semantica`, el buscador de terminología nunca le llega (Decisión Local-0060). Los
cuatro de código no pertenecen a ningún subsistema, pero eso solo no alcanza para darles casa
propia: lo que no es de ningún subsistema y le sirve a todos ya tiene dónde vivir, que es
`.claude/common/`.

Lo que los saca de ahí es que **no le sirven a todos los repos**. `common/` viaja entero y
siempre —todo lo que tiene adentro está en lo que se instala, porque de ahí dependen los nueve
lints—, así que ponerlos ahí garantizaría lo contrario de lo que se busca: llegarían también a
los repos de análisis, que no tienen código que revisar. Y `common/` guarda módulos que otro
código requiere al arrancar; un subagente no se requiere, se invoca, y Claude Code lo descubre en
una carpeta `agents/`.

## El mecanismo ya existe

No hay que construir nada. La habilitación vive en la clave `enabledPlugins` de
`.claude/settings.local.json`, que es por repo y no se commitea (Decisión Local-0035). Verificado
en el Agente Desplegado `como-uso-claude`: esa clave lista sus diez plugins de subsistema y
coincide con lo habilitado a nivel usuario.

## Qué se descartó

Marcar cada Agente Desplegado como «de código» o «de análisis» para que el instalador decida
solo. Es un concepto nuevo, con su registro y su control, para decidir lo que ya decide esa
clave. El costo de descartarlo es que habilitar el plugin en un repo nuevo sea un paso manual
más; el precio de la alternativa era un concepto para mantener al día en cada repo, que falla en
silencio cuando queda viejo.

## Relación con la instalación completa

El plugin de código queda afuera del paquete que se instala entero, no adentro eligiéndose: la
regla de la Decisión Local-0029 no cambia.
