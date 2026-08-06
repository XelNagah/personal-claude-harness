# Subagentes como componente distribuible del AMP

**Estado: Nuevo · Creado 26-07-25.** Origen: [Modelo de distribución y empaquetado del harness](../ejecutados/Modelo%20de%20distribucion%20y%20empaquetado%20del%20harness.md), punto 5 de "Qué se decidió (firme)" — el único de los cinco que no se ejecutó. Los otros cuatro cayeron con la Decisión Local-0029 (empaquetado en un plugin por subsistema) y el actualizador `amp:actualizar`.

## Qué se decidió (viene del plan padre, sin ejecutar)

Los **subagentes** entran como **categoría de componente nueva** del Producto, al lado de los subsistemas y las Herramientas:

- **Transversales** (investigador, corredor de tests, revisor de código): viajan en la plantilla del plugin `amp` → se escriben en `.claude/agents/` del consumidor, commiteados y ajustables por cada repo.
- **De dominio:** los escribe cada repo consumidor para su Propósito; el harness no los manda.

Análisis fuente en el conocimiento del agente `automejora` (repo `como-uso-claude`), páginas `subagentes-agentes-codigo` y `subagentes-en-harness`.

## Estado real hoy

**Nada de esto existe.** No hay `.claude/agents/` en este repo, `amp:inicializar` no lo menciona en su árbol ni en ninguna sección, y el plugin `amp` no lleva subagentes empaquetados. Lo que sí hay, y conviene mirar antes de diseñar, es **uso de subagentes por skill**: `propagar-harness` delega la copia a un subagente fresco (memoria `feedback_propagacion_harness.md`) — o sea que el harness ya usa subagentes, pero **efímeros y descriptos dentro de un `SKILL.md`**, no como componente con archivo propio.

## A resolver

- **Qué es un subagente para el Agente Multipropósito, y en qué se distingue de un subsistema y de una Herramienta.** Un subsistema es una casa de datos; una Herramienta, una tool invocable; un subagente es un ejecutor con contexto propio. La categoría nueva necesita entrar al glosario y, si define estructura, al Patrón (el Test de demarcación de 0020 aplica: ¿quién lo lee?).
- **¿Registro e índice, como todo subsistema?** Hoy el criterio del repo es que lo que existe se registra. Si hay `.claude/agents/`, ¿lleva índice y lint, o alcanza con que los archivos estén? Cruza directo con el plan del Registro genérico.
- **Cuáles son los transversales que valen el viaje.** «Investigador, corredor de tests, revisor de código» viene de la sesión fuente, no de una necesidad medida acá. Un revisor de código en un repo de contabilidad no sirve igual que en uno de software: contrastar contra el hecho de que el Agente Multipropósito es multipropósito.
- **Separación Base/aprendido (0027):** los transversales son Base (el actualizador los reemplaza enteros); los de dominio, aprendidos (nunca se tocan). Aplicar el mismo corte que ya usan `conducta` y `preferencias`.
- **¿Empaquetados en `amp` o en un plugin propio?** La decisión 0029 fijó que un subsistema sin skill de operación no tiene plugin; los subagentes no son subsistema, así que la regla no los cubre.
- **Relación con las skills que ya delegan.** Si `propagar-harness` describe su subagente en el `SKILL.md`, ¿pasa a apuntar a un subagente con archivo propio, o conviven las dos formas?

## Se cruza con

- [Subsistema de Registros genérico como parte de Conocimiento](Subsistema%20de%20Registros%20generico%20como%20parte%20de%20Conocimiento.md) — si los subagentes llevan índice, es otro Registro instanciado.
- [Afinar el concepto de Subsistema frente a Funcionalidad y plugin](Afinar%20el%20concepto%20de%20Subsistema%20frente%20a%20Funcionalidad%20y%20plugin.md) — sumar una categoría de componente sin tener afinadas las dos que ya existen invita a que se lean como sinónimos.
- [Habilidad de ejecución de planes](Habilidad%20de%20ejecucion%20de%20planes.md) — esa skill sería el consumidor más directo de un subagente transversal.

Correr por `amp:planificar` antes de construir.
