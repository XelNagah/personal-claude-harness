---
indice: Decisiones del proyecto
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Fecha, Estado, Detalle]
descripcion: qué se decidió y por qué
---

# Decisiones del proyecto

Registro de las decisiones **estructurales al propósito del repo**: las que definen cómo es o qué hace el repo en lo esencial, o que eligen un camino entre varios de forma que **condiciona el trabajo futuro**. **No** van las operativas triviales o efímeras ("busqué X en internet", "usé tal flag"). Ante la duda: ¿esto condiciona el repo a futuro? Sí → va.

Una fila por decisión:

- **Código** — `Local-NNNN`, referencia estable. Se asigna al crear la entrada y no se reusa. En lo que queda escrito no va solo: se dice `Decisión Local-NNNN`.
- **Nombre** — de qué trata la decisión, en una frase corta. Único en el registro.
- **Descripción** — qué se decidió y por qué. Si requiere conceptualización mayor, la frase queda acá y el desarrollo va al `Detalle`.
- **Fecha** — `AAAA-MM-DD`.
- **Estado** — `vigente` o `reemplazada por NNNN`. Para revertir no se borra: se agrega una nueva y se marca la vieja.
- **Detalle** — link a `NNNN-nombre.md` **solo si la decisión requiere conceptualización mayor** (contexto, alternativas, consecuencias); `—` si es simple. El nombre del archivo conserva el número sin prefijo: no es el código, es un nombre corto legible.

Las filas van en **orden ascendente por Código**.

| Código | Nombre | Descripción | Fecha | Estado | Detalle |
|---|---|---|---|---|---|
