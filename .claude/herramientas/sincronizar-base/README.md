# sincronizar-base

**Qué hace:** copia los Componentes de Subsistema del Agente Multipropósito desde el `.claude/` vivo de este repo a la carpeta `base/` de la skill de instalación, que es la que viaja adentro del plugin. La regla la declara cada archivo en su frontmatter: sin frontmatter u `origen: agente-multiproposito` se copia entero; `origen: agente-desplegado` se copia **solo hasta el separador de la tabla**, porque las filas son las que puebla cada repo y viajando harían nacer a todo repo nuevo con las entradas de este. Solo toca archivos que ya están en `base/`: sumar uno nuevo es una decisión, no una copia.
**Cómo se invoca:** `node .claude/herramientas/sincronizar-base/sincronizar-base.js [--aplicar] [rutaRepo]`. Sin `--aplicar` solo informa.
**Estado:** vigente.
**Referenciado por:** nadie por ruta — la corre el agente al editar un Componente de Subsistema del Agente Multipropósito.
**Dependencias:** Node.js (sin libs externas).
**Origen:** reemplaza a `propagar-harness`, que copiaba el mismo texto adentro de un markdown y verificaba carácter a carácter. Desde que los Componentes viajan como archivos, propagar es copiar un archivo; lo único que necesita juicio es el corte de los registros del Agente Desplegado.
**Notas:** el control que la respalda vive en `lint-harness` — marca lo que difiere, lo que viaja sin estar instalado, la infra instalada que no viaja, y el Índice del Agente Desplegado que viaja con filas. La Herramienta arregla; el control avisa. Son contratos distintos y hacen falta los dos.
