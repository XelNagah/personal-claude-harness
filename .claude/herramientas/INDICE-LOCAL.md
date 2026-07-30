---
indice: Herramientas del Agente Desplegado
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Tipo, Cómo se invoca, Estado, Detalle]
descripcion: qué hace la Herramienta, en una línea
---

# Herramientas del Agente Desplegado

Las que este repo suma para su Propósito — acá, autorar el Agente Multipropósito. El nivelador **no toca este archivo**. Las columnas y la convención completa están en [`INDICE.md`](INDICE.md).

| Código | Nombre | Descripción | Tipo | Cómo se invoca | Estado | Detalle |
|--------|--------|-------------|------|----------------|--------|---------|
| Local-0001 | ejecutar-control-cierre | Corre todos los chequeos del repo de una pasada (lints de subsistema descubiertos dinámicamente + `claude plugin validate`) y resume verde/hallazgos | script | `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js` | vigente | [ejecutar-control-cierre/](ejecutar-control-cierre/) |
| Local-0002 | lint-harness | Lint de coherencia del harness: disco↔marketplace↔REGISTRO, texto literal divergente entre plantillas, tamaño y estructura de los MANIFIESTO.md (dec. 0017/0019), citas a decisiones del harness en archivos distribuibles (dec. 0024), terminología vetada en el texto que viaja a cada Agente con Propósito | script | `node .claude/herramientas/lint-harness/lint-harness.js` | vigente | [lint-harness/](lint-harness/) |
| Local-0003 | inventariar-componentes-sueltos | Barre `.claude/` y lista los componentes (archivos y carpetas) que no son subsistema (lint co-ubicado) ni infra conocida; inventaría sin juzgar. Frente B del plan de efecto conductual; acepta ruta para apuntarla a un consumidor | script | `node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js [rutaRepo]` | vigente | [inventariar-componentes-sueltos/](inventariar-componentes-sueltos/) |
| Local-0005 | propagar-harness | Propaga un cambio textual al instalador consolidado `amp:inicializar`: subagente fresco para la copia, verificación carácter a carácter de los embebidos, subida de versión | skill | skill `propagar-harness` (el agente la dispara al tocar textos que viajan) | vigente | [../skills/propagar-harness/](../skills/propagar-harness/) |
| Local-0006 | agregar-funcionalidad | Alta completa de una funcionalidad/plugin: carpeta + marketplace + REGISTRO + `amp:inicializar` si aplica, con validación final | skill | skill `agregar-funcionalidad` | vigente | [../skills/agregar-funcionalidad/](../skills/agregar-funcionalidad/) |
| Local-0007 | ejecutar-pruebas | Corre todas las pruebas de los controles del repo (descubre cualquier `pruebas.js` bajo `.claude/`) y resume verde o fallas. Contesta lo que el control de cierre no puede: si los controles que lo declaran verde siguen funcionando. Sale con código 1 si una prueba falla | script | `node .claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js [rutaRepo]` | vigente | [ejecutar-pruebas/](ejecutar-pruebas/) |
