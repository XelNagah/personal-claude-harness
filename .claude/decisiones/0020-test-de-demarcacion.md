# 0020 — Test de demarcación

## Qué se decidió

Dónde va cada **Componente** del repo se decide pasándolo por **cinco ejes**. Los ejes son el test; los casos resueltos y los criterios finos viven en esta página. Ratificado el 2026-07-22.

## Por qué

Materializa el **frente A** del plan *Que el harness tenga efecto conductual*. El diagnóstico: se acordaron ~24 reglas de demarcación en conversación, sobrevivieron **2** escritas, las otras se aplicaron y se evaporaron — por eso las mismas discusiones (¿dónde va esto?) volvían cada semana y se comían entre ¼ y ½ de los turnos del usuario. La causa general está asentada en el conocimiento [`modos-de-falla-ante-reglas-escritas`](../conocimiento/modos-de-falla-ante-reglas-escritas.md). Esta decisión baja las reglas a **un registro consultable** para que no se vuelvan a perder.

Se eligió **una** decisión con los 5 ejes como test + esta página de ejemplos, y **no** 22 decisiones de grano fino: los ejes son lo estructural que se ratifica; los criterios son su aplicación. Así la ratificación es corta y el resultado es una sola cosa que se consulta entera.

## Los cinco ejes

1. **De quién es** — ¿**Producto del Propósito** o harness? Lo que el repo produce (una web, una base de inmuebles, un informe) vive en la raíz, fuera de `.claude/`, y no pertenece a ningún subsistema. El harness (`.claude/…`) es lo que gestiona el trabajo, no el trabajo.
2. **Qué relación tiene el agente con la cosa** — ¿la **lee**, la **sabe** o la **ejecuta**? Una regla que lee (preferencia, instrucción) ≠ algo que sabe del dominio (conocimiento) ≠ una capacidad que ejecuta (Herramienta).
3. **Cambia o está fijo** — ¿estado vivo o veredicto? Lo que cambia sesión a sesión va a memoria (o a un Registro volátil si es estado de máquina); una elección que se toma una vez va a decisión.
4. **Es invocable por sí mismo** — ¿lo llamás con un comando (entonces es una **fila** del registro de Herramientas) o es el **contenido interno** de una tool (su código, su estado de trabajo — no lo lista ningún índice)?
5. **Sustantivo o verbo** — ¿"qué **es** algo" (un concepto → glosario) o "qué **hacés**" (una acción repetible → Herramienta/comando)?

## Cómo se aplica

Ante *"¿dónde va X?"*, pasar X por los ejes hasta que un lugar lo reclame. Si ninguno lo reclama **y** X es Producto del Propósito → va a la raíz, es correcto que quede afuera. Si ninguno lo reclama y no es Producto → es un hueco real de cobertura (raro; documentar antes de inventar subsistema).

## Casos resueltos

- **La base de inmuebles / la web del agente inmobiliario** → Producto del Propósito (eje 1): raíz del repo, fuera de `.claude/`. Por esto el inventario de fuera-de-subsistema barre solo `.claude/`, no la raíz.
- **`sessions.json`** (estado de sesión que dos Herramientas escriben en el repo consumidor `Agente-Coordinador`) → **Registro volátil** (ejes 3 + 4): es contenido interno de la Herramienta que lo administra; esa Herramienta sí es una fila del registro, el estado en sí no. No falta un subsistema — lo efímero es una propiedad, no un Tipo ni un cajón nuevo.

## Criterios finos ya acordados

Aplicaciones de los ejes, ratificadas, que no estén ya cubiertas por otra decisión:

- **No fijar cantidades en las definiciones** del glosario (una definición dice qué es la cosa, no cuántas hay).
- **Reapuntar una referencia muerta a una viva es mantenimiento, no cambio de contenido** (no dispara ratificación ni versión).
- **No resolver el síntoma literal: alinear el caso al patrón general** (ante un pedido puntual, mirar de qué regla es un caso).

Ya cubiertos en otro lado, no se duplican acá: *no acuñar términos del dominio* (0004), *los alias/sinónimos también requieren autorización* (0018).

## Relación con otras decisiones

Se apoya en el patrón de subsistema (0002), la gobernanza de terminología (0004/0018), la definición y co-ubicación de Herramientas (0007/0008) y el modelo de carga de contexto (0017). No los contradice: los usa como los lugares a los que el test rutea.

## Página viva

La arqueología del plan *efecto conductual* rescató ~24 reglas; varias siguen sin enumerar. Esta página es su casa: se suman a medida que se ratifican, cada una pasando por el usuario (0004).
