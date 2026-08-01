---
indice: Índice de la base de conocimiento
origen: agente-multiproposito
columnas: [Código, Nombre, Descripción, Detalle]
descripcion: de qué trata esa página, en una línea
---

# Índice de la base de conocimiento

Índice raíz de lo que el agente **sabe** sobre este proyecto. Solo punteros — una fila por página o sección, nunca contenido.

Los markdown de la raíz del repo (README y similares) son **documentación del proyecto**, no conocimiento de agente: no se listan acá.

- **Código** — `Base-NNNN` o `Local-NNNN` según el origen. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el título de la página.
- **Descripción** — de qué trata, en una línea: lo suficiente para decidir si vale abrirla. El desarrollo va en la página; lo que sale de la celda deja de estar cargado.
- **Detalle** — la página, o la carpeta con su propio índice.

Convención completa en el [README del subsistema](README.md).

> **Origen del contenido:** las páginas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el nivelador lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el nivelador no lo abre). Una página nueva de este repo va siempre al segundo.

## Páginas del Agente Multipropósito

Sabiduría que le sirve a cualquier Agente Desplegado para hacer bien su trabajo, sea cual sea su Propósito. Lo que un repo aprendió construyendo su propio harness **no** va acá: eso es documentación de ese proyecto.

| Código | Nombre | Descripción | Detalle |
|---|---|---|---|
| Base-0001 | Evitar el mismo dato escrito en varios lugares | Un dato escrito dos veces diverge siempre; lo que decide el daño es si hay un control que compare. Las cuatro formas —el texto distribuido duplicado del que se usa, el comentario que sobrevive al código, el número que copia un dato que cambia, y el dato que un archivo declara y otro repite— y qué hacer con cada una. | [evitar-el-mismo-dato-en-varios-lugares.md](evitar-el-mismo-dato-en-varios-lugares.md) |
| Base-0002 | Buscar con acentos en Windows devuelve cero aunque haya coincidencias | En Git Bash sobre Windows, `grep -i` con un patrón acentuado devuelve 0 sin emitir señal, indistinguible de una búsqueda sin coincidencias. El daño no es la búsqueda perdida sino la conclusión: dar por no registrado algo que sí está. | [buscar-con-acentos-en-windows.md](buscar-con-acentos-en-windows.md) |
| Base-0003 | Terminología farlopa: la deriva terminológica de los agentes | Los agentes incorporan términos ajenos (anglicismos, copias literales del inglés, jerga) al dominio sesión tras sesión sin ratificar; el criterio de demarcación para detectarlos a tiempo, relativo al usuario del Propósito de cada repo. Es el origen del subsistema semántica. | [terminologia-farlopa.md](terminologia-farlopa.md) |
