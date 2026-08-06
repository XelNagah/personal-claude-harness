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
- **Descripción** — de qué trata, en una línea: lo suficiente para decidir si vale abrirla. El desarrollo va en la página; lo que sale de la celda deja de estar cargado. El **Control de Longitud de Descripción** avisa cuando una celda se pasa, y dice el máximo. Lo que baja a la página es la elaboración: la enumeración corta de lo que la página cubre se queda, porque la celda es también con lo que se la busca.
- **Detalle** — la página, o la carpeta con su propio índice.

Convención completa en el [README del subsistema](README.md).

> **Origen del contenido:** las páginas se separan por origen en **dos archivos**, y cada uno lo declara en su frontmatter — este (`origen: agente-multiproposito`, las manda el Agente Multipropósito; el actualizador lo reemplaza entero al poner al día un Agente con Propósito) e [`INDICE-LOCAL.md`](INDICE-LOCAL.md) (`origen: agente-desplegado`, las suma cada repo; el actualizador no lo abre). Una página nueva de este repo va siempre al segundo.

## Páginas del Agente Multipropósito

Sabiduría que le sirve a cualquier Agente Desplegado para hacer bien su trabajo, sea cual sea su Propósito. Lo que un repo aprendió construyendo su propio harness **no** va acá: eso es documentación de ese proyecto.

| Código | Nombre | Descripción | Detalle |
|---|---|---|---|
| Base-0001 | Evitar el mismo dato escrito en varios lugares | Un dato escrito dos veces diverge siempre; lo decisivo es si hay un control que compare. Las cuatro formas: texto distribuido, comentario viejo, número copiado y dato declarado dos veces. | [evitar-el-mismo-dato-en-varios-lugares.md](evitar-el-mismo-dato-en-varios-lugares.md) |
| Base-0002 | Buscar con acentos en Windows devuelve cero aunque haya coincidencias | En Git Bash sobre Windows, `grep -i` con un patrón acentuado devuelve 0 sin emitir señal. El daño no es la búsqueda perdida sino la conclusión: dar por no registrado algo que sí está. | [buscar-con-acentos-en-windows.md](buscar-con-acentos-en-windows.md) |
| Base-0003 | Terminología farlopa: la deriva terminológica de los agentes | Los agentes suman términos ajenos —anglicismos, copias literales del inglés, jerga— sin ratificar; el criterio para detectarlos a tiempo, relativo al usuario de cada repo. Origen de semántica. | [terminologia-farlopa.md](terminologia-farlopa.md) |
| Base-0004 | La carpeta `.claude/common/` | Los módulos que usan varios subsistemas y no son de ninguno: qué vive ahí, por qué no son Herramientas, cuándo mudar algo, y que un módulo compartido viaja entero y necesita prueba propia. | [la-carpeta-common.md](la-carpeta-common.md) |
| Base-0005 | El ciclo de vida de un término del glosario | Las dos puntas: una definición que además argumenta por qué la cosa va donde va deja de definir; y vetar un término ya barrido del texto solo deja marcas de lint que nadie puede apagar. | [ciclo-de-vida-de-un-termino.md](ciclo-de-vida-de-un-termino.md) |
