---
name: inicializar-memoria-local
description: Instala el sistema de memoria local del usuario en el repo actual (.claude/memoria/ + MEMORIA.md índice + formato de memorias tipadas). Use when el usuario dice "inicializar memoria local", "armá la memoria", "configurá memoria del proyecto", o como dependencia de gestión de planes / estilo de commits.
---

# Inicializar memoria local

Instala el sistema de memoria local persistida en el proyecto actual. Es infraestructura base: otras funcionalidades guardan sus memorias acá. Si parte de la estructura ya existe, **extender sin pisar**.

## Estructura objetivo

```
├── AGENTS.md          # punto de entrada: sección "Subsistemas" con la línea @.claude/memoria/MANIFIESTO.md
├── CLAUDE.md          # adaptador para Claude Code: @AGENTS.md
└── .claude/
    └── memoria/
        ├── MANIFIESTO.md   # manifiesto de subsistema (siempre en contexto; importa @MEMORIA.md)
        ├── MEMORIA.md      # índice (solo punteros, nunca contenido)
        └── lint-memoria/
            └── lint-memoria.js   # lint mecánico de la memoria (sin LLM, sin red)
```

## Índices siempre cargados vs. reglas inline

Dos mecanismos, no uno:

- **Datos** se cargan por **índice + fetch**: la sección `## Subsistemas` importa el `MANIFIESTO.md` de cada subsistema vía `@`, y cada manifiesto importa —o no— su propio índice — entran al contexto en todo arranque de sesión, sin depender de que el agente decida leerlos. La pregunta del user dispara la lectura del archivo apuntado. Para que esto rinda, las `description` del índice se escriben como **ganchos que cargan el dato clave** (ej.: "calendario de cobros — sueldo ~15, jerarquización ~15"), no como títulos vagos.
- **Reglas de conducta** NO alcanza con indexarlas: nada dispara ir a buscarlas (el agente que está por violar una regla no se pregunta si existe). Van **inline**, siempre en contexto — en este setup, vía la funcionalidad `preferencias` (o importadas individualmente si son del repo).

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** Una sección o memoria puede estar ya con otro título o redacción. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres grupos: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Flujo de trabajo

1. **Asegurar `.claude/memoria/MEMORIA.md`** (índice; encabezado `Cargar al inicio de cada sesión y respetar.` + una línea por memoria `- [Título](archivo.md) — resumen corto`; solo punteros, nunca contenido). Si no existe, crearlo. **Si ya existe, conservar su encabezado y todas sus líneas y agregar solo las entradas que falten** — nunca reescribirlo entero.
2. **Definir el formato de cada memoria** — un `.md` propio bajo `.claude/memoria/` con este frontmatter:

   ```markdown
   ---
   name: <nombre-estable-kebab-case>
   description: <resumen de una línea — se usa para decidir relevancia>
   metadata:
     type: user | feedback | project | reference
   ---

   <el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
   ```

   Tipos: `user` (quién es el usuario), `feedback` (correcciones y enfoques confirmados, con el porqué), `project` (objetivos/restricciones no derivables del código), `reference` (punteros externos). Antes de crear una memoria nueva, revisar si una existente ya la cubre — actualizar en vez de duplicar. Fechas siempre absolutas.
3. **En `AGENTS.md`** (punto de entrada en la raíz, decisión 0010; si no existe, crearlo junto al adaptador `CLAUDE.md` = `@AGENTS.md` — y si hay un CLAUDE.md con contenido, migrarlo primero como indica `inicializar-preferencias-trabajo`) cablear el subsistema por su **manifiesto** (decisiones 0017/0019):
   - **Crear `.claude/memoria/MANIFIESTO.md`** con el contenido de [PLANTILLA.md](PLANTILLA.md) §Manifiesto — el archivo breve que va **siempre en contexto** (describe el subsistema e **importa su índice** con la línea final `@MEMORIA.md`, porque el índice de memoria se carga siempre).
   - **Asegurar la sección `## Subsistemas`** (PLANTILLA §Subsistemas) y, dentro, la línea `@.claude/memoria/MANIFIESTO.md`. Es la sección que reemplaza al viejo bloque "Mapa del repo" y a las secciones de prosa por-subsistema; cada funcionalidad de subsistema agrega acá su propia línea `@.claude/<sub>/MANIFIESTO.md` al instalarse. Si no existe, crearla; si existe, agregar solo la línea faltante. (La ruta del `@import` es relativa a `AGENTS.md`, en la raíz, por eso el prefijo `.claude/`; en un agente sin imports la línea funciona como instrucción de lectura.)
   - **Migración (modelo viejo).** Si AGENTS.md ya tenía el bloque **"Mapa del repo (siempre cargado)"** con `@.claude/memoria/MEMORIA.md` (o una instrucción textual "leer la memoria al inicio"), el manifiesto lo reemplaza: quitar esa línea/instrucción. Si el bloque Mapa queda sin líneas de subsistema, quitar también su encabezado (reportar el reemplazo, no preguntar).
4. **Instalar el lint de la memoria** `.claude/memoria/lint-memoria/lint-memoria.js` con el contenido EXACTO de [PLANTILLA.md](PLANTILLA.md) §Script. Va en **su propia carpeta** co-ubicado con el subsistema (`.claude/memoria/lint-memoria/`), nunca suelto. Es un script Node sin dependencias ni red que chequea, sobre `.claude/memoria/`: **refs `.md` rotas** y wikilinks `[[name]]` sin memoria, **`MEMORIA.md` incompleto** (memorias no listadas), **huérfanos** y **frontmatter inválido** (`name`/`description`/`metadata.type` ∈ `user`·`feedback`·`project`·`reference`).
5. **El criterio de uso y el lint al cerrar viven en el manifiesto** (paso 3): `memoria/MANIFIESTO.md` ya trae el disparador (respetar lo cargado; antes de crear una memoria, revisar si una existente la cubre) y el paso de lint al cerrar (`node .claude/memoria/lint-memoria/lint-memoria.js` desde la raíz). **Migración:** si AGENTS.md tenía una sección de prosa "Memoria del proyecto" separada, el manifiesto la reemplaza — quitarla (su contenido ya está en el manifiesto). No dejar las dos.
6. **Memorias que ya hayan surgido** en la conversación (preferencias, objetivos del proyecto) → persistirlas con el frontmatter de arriba y registrarlas en el índice, salvo que ya exista una que cubra el hecho.
7. **Reportar** en los tres grupos (`agregado` / `ya estaba` / `divergente`). Correr el lint (`node .claude/memoria/lint-memoria/lint-memoria.js`) → debe dar limpio. **No hacer commit** salvo pedido explícito.
