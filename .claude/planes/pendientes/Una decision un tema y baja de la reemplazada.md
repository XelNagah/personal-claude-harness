# Una decisión, un tema — y baja de la reemplazada

**Estado: Nuevo · Creado 26-07-26.** Origen: conversación del 26/07/2026 al asentar la Decisión Local-0035 (el Agente Multipropósito se instala con alcance local), que modifica una cláusula de la Local-0029 (empaquetado en un plugin por subsistema).

## El problema

Para saber **qué rige hoy** sobre el alcance de instalación hay que leer tres filas encadenadas: **0013 → 0029 → 0035**. La convención actual dice que la decisión vieja no se edita ni se borra, y eso preserva el porqué —sin él, la próxima sesión lee "project = install for all collaborators", le suena razonable y vuelve a decidir lo mismo—, pero **el costo de lectura crece con cada modificación** y lo paga cada consulta.

Hoy la fila vieja queda `vigente` con una nota entre paréntesis: o sea, **marcada como vigente algo que en parte ya no rige**.

## La dirección acordada

- **Una decisión = un tema.**
- Al modificar, la decisión nueva **reenuncia el tema entero**, no solo el delta.
- La vieja pasa a **`reemplazada por NNNN`** (el estado ya existe en el registro).
- Para saber qué rige, **leer las `vigente` alcanza**.

## Lo que lo traba, y hay que resolver primero

La regla **solo funciona si cada decisión es de un tema**. La 0029 decide cuatro cosas a la vez —empaquetado en 7 plugins, bundle por dependencias, alcance, y consolidación de los 10 `inicializar-<sub>` en uno—, así que no se la puede dar de baja sin arrastrar tres decisiones que siguen vigentes. **La baja parcial no existe.**

Primer paso concreto: partir la 0029 en sus cuatro temas y dar de baja solo el de alcance (que la 0035 ya reenuncia completo).

## Alcance

Cambia la convención del subsistema `decisiones` para todos los casos, no solo este: toca `amp-decisiones:registrar-decision`, el `MANIFIESTO.md`, `lint-decisiones` (que hoy valida `reemplazada por NNNN`) y la memoria `feedback_decisiones.md`. Amerita su propia decisión asentada.
