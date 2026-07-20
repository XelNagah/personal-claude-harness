---
name: inicializar-memoria-local
description: Instala el sistema de memoria local del usuario en el repo actual (.claude/memoria/ + MEMORIA.md índice + formato de memorias tipadas). Use when el usuario dice "inicializar memoria local", "armá la memoria", "configurá memoria del proyecto", o como dependencia de gestión de planes / estilo de commits.
---

# Inicializar memoria local

Instala el sistema de memoria local persistida en el proyecto actual. Es infraestructura base: otras funcionalidades guardan sus memorias acá. Si parte de la estructura ya existe, **extender sin pisar**.

## Estructura objetivo

```
├── AGENTS.md          # punto de entrada: secciones "Mapa del repo (siempre cargado)" y "Memoria del proyecto"
├── CLAUDE.md          # adaptador para Claude Code: @AGENTS.md
└── .claude/
    └── memoria/
        ├── MEMORIA.md      # índice (solo punteros, nunca contenido)
        └── lint-memoria/
            └── lint-memoria.js   # lint mecánico de la memoria (sin LLM, sin red)
```

## Índices siempre cargados vs. reglas inline

Dos mecanismos, no uno:

- **Datos** se cargan por **índice + fetch**: el bloque "Mapa del repo" importa los índices vía `@` — entran al contexto en todo arranque de sesión, sin depender de que el agente decida leerlos. La pregunta del user dispara la lectura del archivo apuntado. Para que esto rinda, las `description` del índice se escriben como **ganchos que cargan el dato clave** (ej.: "calendario de cobros — sueldo ~15, jerarquización ~15"), no como títulos vagos.
- **Reglas de conducta** NO alcanza con indexarlas: nada dispara ir a buscarlas (el agente que está por violar una regla no se pregunta si existe). Van **inline**, siempre en contexto — en este setup, vía la funcionalidad `preferencias` (o importadas individualmente si son del repo).

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** Una sección o memoria puede estar ya con otro título o redacción. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Workflow

1. **Asegurar `.claude/memoria/MEMORIA.md`** (índice; encabezado `Cargar al inicio de cada sesión y respetar.` + una línea por memoria `- [Título](archivo.md) — resumen corto`; solo punteros, nunca contenido). Si no existe, crearlo. **Si ya existe, conservar su encabezado y todas sus líneas y agregar solo las entradas que falten** — nunca reescribirlo entero.
2. **Definir el formato de cada memoria** — un `.md` propio bajo `.claude/memoria/` con este frontmatter:

   ```markdown
   ---
   name: <slug-kebab-case>
   description: <resumen de una línea — se usa para decidir relevancia>
   metadata:
     type: user | feedback | project | reference
   ---

   <el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
   ```

   Tipos: `user` (quién es el usuario), `feedback` (correcciones y enfoques confirmados, con el porqué), `project` (objetivos/restricciones no derivables del código), `reference` (punteros externos). Antes de crear una memoria nueva, revisar si una existente ya la cubre — actualizar en vez de duplicar. Fechas siempre absolutas.
3. **En `AGENTS.md`** (punto de entrada en la raíz, decisión 0010; si no existe, crearlo junto al adaptador `CLAUDE.md` = `@AGENTS.md` — y si hay un CLAUDE.md con contenido, migrarlo primero como indica `inicializar-preferencias-trabajo`) asegurar la sección **"Mapa del repo (siempre cargado)"** con el import del índice:

   ```markdown
   ## Mapa del repo (siempre cargado)

   @.claude/memoria/MEMORIA.md
   ```

   (La ruta del `@import` es relativa al archivo que importa — `AGENTS.md` está en la raíz, por eso el prefijo `.claude/`. En un agente sin soporte de imports, la línea funciona igual como instrucción de lectura.) Las demás funcionalidades agregan acá sus propios índices al instalarse (`@.claude/planes/PLANES.md`, `@.claude/conocimiento/INDICE.md`, `@.claude/herramientas/INDICE.md`). Si el punto de entrada ya carga la memoria por instrucción textual ("leer al inicio"), **reemplazar** esa instrucción por el import — es la misma convención con mecanismo en vez de obediencia (reportar el reemplazo, no preguntar).
4. **Instalar el lint de la memoria** `.claude/memoria/lint-memoria/lint-memoria.js` con el contenido EXACTO de [PLANTILLA.md](PLANTILLA.md) §Script. Va en **su propia carpeta** co-ubicado con el subsistema (`.claude/memoria/lint-memoria/`), nunca suelto. Es un script Node sin dependencias ni red que chequea, sobre `.claude/memoria/`: **refs `.md` rotas** y wikilinks `[[name]]` sin memoria, **`MEMORIA.md` incompleto** (memorias no listadas), **huérfanos** y **frontmatter inválido** (`name`/`description`/`metadata.type` ∈ `user`·`feedback`·`project`·`reference`).
5. **Asegurar también en `AGENTS.md` la sección "Memoria del proyecto"** con link a `.claude/memoria/MEMORIA.md`, el criterio de uso (respetar lo cargado; antes de crear una memoria, revisar si una existente la cubre) y el **paso de lint al cerrar**: al cerrar una tarea que tocó la memoria, correr **desde la raíz del repo** `node .claude/memoria/lint-memoria/lint-memoria.js`. Si existe una sección equivalente, no duplicar; si le falta el paso de lint, agregarlo.
6. **Memorias que ya hayan surgido** en la conversación (preferencias, objetivos del proyecto) → persistirlas con el frontmatter de arriba y registrarlas en el índice, salvo que ya exista una que cubra el hecho.
7. **Reportar** en los tres baldes (`agregado` / `ya estaba` / `divergente`). Correr el lint (`node .claude/memoria/lint-memoria/lint-memoria.js`) → debe dar limpio. **No hacer commit** salvo pedido explícito.
