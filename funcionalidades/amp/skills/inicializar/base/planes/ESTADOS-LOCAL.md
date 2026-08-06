---
origen: agente-desplegado
---

# Estados de planes del Agente Desplegado

Los **estados** que este repo suma para su Propósito. El actualizador **no toca este archivo**; [`ESTADOS.md`](ESTADOS.md) —el del Agente Multipropósito— sí lo reemplaza entero, así que un estado propio escrito allá se pierde en la corrida siguiente y deja inválidos todos los planes que lo usaban. Las columnas y la convención completa están en [`ESTADOS.md`](ESTADOS.md).

Un estado de acá no puede repetir uno de `ESTADOS.md`: el del Agente Multipropósito manda, y tener el mismo nombre en los dos archivos deja al de abajo pisando al de arriba en silencio, con otra carpeta o distinta terminalidad. El `lint-planes` lo marca.

## Cómo se agrega un estado propio

Un estado no se agrega solo: es un nodo de la máquina de transiciones, así que hay que decir de dónde se llega y a dónde se sale.

- **`Carpeta`** — la subcarpeta de `planes/` donde vive el archivo del plan mientras está en ese estado. Tiene que existir; si es una carpeta nueva, crearla junto con el estado.
- **`Terminal`** — `sí` si es un estado de cierre. Toda carpeta de cierre necesita al menos un estado terminal.
- Las transiciones que lo alcanzan y las que salen de él se documentan acá abajo, en el mismo formato que usa `ESTADOS.md`.

| Estado | Sentido | Carpeta | Terminal |
|--------|---------|---------|----------|
