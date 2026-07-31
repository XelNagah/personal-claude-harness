---
origen: agente-desplegado
---

# Momentos de conducta del Agente Desplegado

Los **momentos** que este repo suma para su Propósito. El nivelador **no toca este archivo**; `MOMENTOS.md` —el del Agente Multipropósito— sí lo reemplaza entero, así que un momento propio escrito allá se pierde en la corrida siguiente. Las columnas y la convención completa están en [`MOMENTOS.md`](MOMENTOS.md).

Un momento de acá no puede repetir uno de `MOMENTOS.md`: el del Agente Multipropósito manda, y tener el mismo nombre en los dos archivos deja al de abajo pisando al de arriba en silencio, con otra disponibilidad. El `lint-conducta` lo marca.

## Cómo se agrega un momento propio

La **`Disponibilidad`** es lo que hay que mirar, y casi siempre arranca en `declarado`:

- **`declarado`** — el momento existe como vocabulario, pero **ningún repartidor lo realiza todavía**. Sus reglas van en estado `pendiente`: quedan escritas y no se entregan. El lint marca cualquier regla `vigente` colgada de un momento así, porque prometería un comportamiento que nadie ejecuta.
- **`activo`** — hay un repartidor que lo entrega. Realizar un momento nuevo es **código**, no registro: el repartidor `establecer-conducta/` traduce cada evento de hook a un momento, y esa traducción vive en su archivo. Un momento propio pasa a `activo` cuando ese código lo contempla.

Por eso declarar el momento acá es el primer paso y no el único: sirve para dejar asentado el punto del flujo y escribir sus reglas antes de que exista el mecanismo que las entregue.

Las **clases** no se extienden desde acá — no hay `CLASES-LOCAL.md` y es deliberado: están implementadas en el código del repartidor. El motivo está en [`CLASES.md`](CLASES.md).

| Momento | Qué representa | Evento de hook | Disponibilidad |
|---------|----------------|----------------|----------------|
