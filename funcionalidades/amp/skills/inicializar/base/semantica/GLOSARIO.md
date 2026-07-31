---
indice: Glosario del proyecto
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Alias, Propuestos, Detalle]
descripcion: la definición del concepto
---

# Glosario del proyecto

Terminología **legítima** del dominio de este repo. Una fila por concepto en la tabla de abajo:

- **Código** — `Local-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el nombre canónico del concepto.
- **Descripción** — la definición, en una o dos frases: qué ES el concepto (no qué hace).
- **Alias** — otras formas de llamarlo, todas válidas, registradas para mapear; separadas por coma. `—` si no hay.
- **Propuestos** — términos que el agente *sugiere* pero que **no se usan** hasta que el usuario los mueve a `Alias` (acá) o al registro de Terminología Farlopa (vetado). Es un buzón, no un estado de reposo. `—` si no hay.
- **Detalle** — link a una página propia `<nombre>.md` **solo si el concepto es complejo** (fórmulas, ejemplos, contraejemplos). `—` si es simple.

Solo términos **propios del dominio** (no conceptos generales de programación). Consultar al planificar y analizar. Ejemplo completo en el README de la funcionalidad `semantica`.

Los términos **vetados no viven acá**: un veto es sobre la relación término→significado (el mismo término con otro significado puede ser legítimo), así que va al registro par [`TERMINOLOGIA-FARLOPA.md`](TERMINOLOGIA-FARLOPA.md), cuya `Descripción` es el **Significado Farlopa**: el que se veta para ese término. El glosario solo lleva terminología legítima.

**Gobernanza (control del usuario):**

- Toda entrada nueva —**concepto o alias**— pasa por el usuario. El agente puede *proponer* (columna `Propuestos`), pero no asienta nada en `Alias` ni veta nada por su cuenta: ratificar y vetar son potestad del usuario. Preferir las palabras del usuario a acuñar nuevas.
- El agente **nunca usa**, ni en texto plano, memorias, planes o código, un término que esté en `Propuestos` o vetado en el registro de Terminología Farlopa.
- Los alias válidos **se registran** (mapear "birra/chela = cerveza" evita confusión); los términos confusos o ajenos al dominio **se vetan** en el registro de Terminología Farlopa (dejan de usarse y se barren del texto vivo). Vetar no borra el término del repo: lo marca para limpiar; la limpieza la guía el lint.

| Código | Nombre | Descripción | Alias | Propuestos | Detalle |
| --- | --- | --- | --- | --- | --- |
