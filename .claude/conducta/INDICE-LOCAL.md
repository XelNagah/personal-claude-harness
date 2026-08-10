---
indice: Reglas de conducta del Agente Desplegado
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Momento, Clase, Contenido, Estado, Detalle]
descripcion: qué asegura la regla, en una línea
---

# Reglas de conducta del Agente Desplegado

Las que este repo suma para su Propósito. El actualizador no toca este archivo; el repartidor `establecer-conducta/` sí lo lee. Las columnas y la convención completa están en [`INDICE.md`](INDICE.md).

| Código | Nombre | Descripción | Momento | Clase | Contenido | Estado | Detalle |
|--------|--------|-------------|---------|-------|-----------|--------|---------|
| Local-0001 | Informar el peso del contexto al arrancar | Pone a la vista cuánto agrega el Agente Multipropósito contra su tope, y aparte lo que carga este repo; decidir cuánto se puede mandar es vigilancia de acá, no de quien lo instala | al arrancar la sesión | Ejecutar | herramientas/medir-contexto/medir-contexto.js --hook | vigente | — |
