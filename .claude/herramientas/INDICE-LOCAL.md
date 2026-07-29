---
indice: Herramientas del Agente Desplegado
origen: agente-desplegado
columnas: [Herramienta, Tipo, Qué hace, Cómo se invoca, Estado]
---

# Herramientas del Agente Desplegado

Las que este repo suma para su Propósito — acá, autorar el Agente Multipropósito. El nivelador **no toca este archivo**. Las columnas y la convención completa están en [`INDICE.md`](INDICE.md).

| Herramienta | Tipo | Qué hace | Cómo se invoca | Estado |
|-------------|------|----------|----------------|--------|
| [ejecutar-control-cierre](ejecutar-control-cierre/) | script | Corre todos los chequeos del repo de una pasada (lints de subsistema descubiertos dinámicamente + `claude plugin validate`) y resume verde/hallazgos | `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js` | vigente |
| [lint-harness](lint-harness/) | script | Lint de coherencia del harness: disco↔marketplace↔REGISTRO, texto literal divergente entre plantillas, tamaño y estructura de los MANIFIESTO.md (dec. 0017/0019), citas a decisiones del harness en archivos distribuibles (dec. 0024), terminología vetada en el texto que viaja a cada Agente con Propósito | `node .claude/herramientas/lint-harness/lint-harness.js` | vigente |
| [inventariar-componentes-sueltos](inventariar-componentes-sueltos/) | script | Barre `.claude/` y lista los componentes (archivos y carpetas) que no son subsistema (lint co-ubicado) ni infra conocida; inventaría sin juzgar. Frente B del plan de efecto conductual; acepta ruta para apuntarla a un consumidor | `node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js [rutaRepo]` | vigente |
| [lint-herramientas](lint-herramientas/) | script | Lint de este registro: README por herramienta local, herramienta en índice, filas colgadas, refs por ruta de lint en settings | `node .claude/herramientas/lint-herramientas/lint-herramientas.js` | vigente |
| [propagar-harness](../skills/propagar-harness/) | skill | Propaga un cambio textual al instalador consolidado `amp:inicializar`: subagente fresco para la copia, verificación carácter a carácter de los embebidos, subida de versión | skill `propagar-harness` (el agente la dispara al tocar textos que viajan) | vigente |
| [agregar-funcionalidad](../skills/agregar-funcionalidad/) | skill | Alta completa de una funcionalidad/plugin: carpeta + marketplace + REGISTRO + `amp:inicializar` si aplica, con validación final | skill `agregar-funcionalidad` | vigente |
