# Prompt: inicializar base de conocimiento

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto. Instala la base de conocimiento en el directorio nativo de tu harness.

---

Configurá en este proyecto una **base de conocimiento** con ubicación única, usando el directorio de configuración **nativo de tu harness**:

- Claude Code → `.claude/`
- Codex → `.codex/` (instrucciones en `AGENTS.md`)
- Cursor → `.cursor/` (instrucciones en `.cursor/rules/`)
- Copilot → `.github/` (instrucciones en `.github/copilot-instructions.md`)
- Otro / sin convención → `.agent/`

En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Seguro de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el destino. Nunca reescribas de cuajo un archivo existente.
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto.
- **Detectá equivalentes.** Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → reportá y preguntame.
- **Reportá al final** en tres baldes: `agregado`, `ya estaba`, `divergente`.

## 1. Carpeta de conocimiento

Asegurá `<config>/conocimiento/` con un `INDICE.md` raíz — índice con una línea por página/sección (`- [Título](ruta.md) — resumen corto`); solo punteros, nunca contenido. Es la **ubicación única** de todo lo que el agente sabe (documentos, estudios, temas, notas de dominio).

## 2. Lint de integridad

Instalá el tool en **su propia carpeta**: `<config>/scripts/lint-conocimiento/lint-conocimiento.js`. Es un script Node sin dependencias ni red que chequea, sobre `<config>/conocimiento/`: **refs rotas** (todo link/ruta `.md` mencionado existe), **índice incompleto** (todo `.md` está listado en su `INDICE.md`), **huérfanos** (páginas que nada referencia). Ignora placeholders (`...`, `<...>`, plantillas de fecha). Corré `node <config>/scripts/lint-conocimiento/lint-conocimiento.js` al cerrar tareas que escribieron conocimiento.

(El contenido exacto del script está en la plantilla de la versión Claude Code de esta funcionalidad — `skills/inicializar-conocimiento/PLANTILLA.md` §Script.)

## 3. Convención como memoria

Si tenés sistema de memoria local, persistí la convención como una memoria tipada `feedback`:

- **Ubicación única:** conocimiento nuevo siempre bajo `<config>/conocimiento/`, nunca en la raíz. (Las herramientas/scripts las gestiona la funcionalidad `scripts`.)
- **Lint al cerrar** (mecánico, gratis); semántico (contradicciones, duplicación, staleness) a pedido.
- **Migración:** scripts acoplados por `__dirname` que se muevan deben reapuntar sus paths de datos a `<config>/conocimiento/...`.

Indexala en tu índice de memoria.

## 4. Referencia en las instrucciones del proyecto

En el archivo que tu harness carga al inicio (`CLAUDE.md`, `AGENTS.md`, etc.), creá/extendé una sección **"Base de conocimiento del proyecto"** con link a `conocimiento/INDICE.md`, la regla de ubicación única y el paso de lint al cerrar.

## 5. Migración

Detectá conocimiento que viva **fuera** de `<config>/conocimiento/` y movelo adentro. Buscá en **tres** lugares, no solo el obvio:

**(a) En la raíz del repo** — árboles de md, carpetas con su `INDICE.md`, notas de dominio sueltas.

**(b) DENTRO de `<config>/memoria/`** — el caso más común en repos viejos y el que más se pasa por alto: la memoria se desborda y termina siendo la base de conocimiento. Señales de que un archivo de `memoria/` es conocimiento y no memoria: **no tiene frontmatter**; **es largo** (decenas/cientos de líneas con secciones); **es un diccionario, catálogo, procedimiento, formato o estructura**; o **`memoria/` usa un `README.md` como índice en vez de `MEMORIA.md`** (señal fuerte). Lo que sí es memoria y se queda: hechos atómicos tipados con frontmatter.

**(c) Fuentes crudas — NO se mueven.** Distinguí lo que el agente **lee** de lo que **sabe**: escaneos, PDFs de resúmenes/facturas, exports, json/csv de origen. Son insumos inmutables y se quedan (salvo que ya estén entreverados dentro de una carpeta de conocimiento, y entonces se mueven con ella). El conocimiento es el md **sintetizado**.

Reglas del move: proponé un plan concreto y **mové por defecto**, preservando estructura; si es ambiguo (código, assets, config de build), listalo y preguntame antes.

⚠️ **Material sensible — chequealo en los dos sentidos.**

**(i) Lo que YA está gitignoreado:** si un archivo a mover está ignorado por su ruta (típico `memoria/*-token.md`, credenciales), moverlo rompe el match y **el secreto termina commiteado**. No lo muevas, o actualizá el `.gitignore` a la ruta nueva en el mismo paso; verificá con `git status`.

**(ii) Lo que NO está gitignoreado y debería estarlo** — más importante, porque el riesgo ya existe antes de migrar. Revisá el repo y **sugerime** ignorar lo que sea riesgo de seguridad/privacidad: **credenciales** (tokens, API keys, `.env`, `*.key`/`*.pem`, o claves embebidas en el contenido), **documentos personales/legales** (escaneos de DNI, escrituras, certificados), **financiero** (resúmenes bancarios/tarjeta, libros contables) y **salud** (estudios médicos). Reportalo como hallazgo aparte, con el riesgo concreto y las líneas de `.gitignore` sugeridas. **Sugerí, no apliques solo** — puedo querer versionarlos a propósito en un repo local. Avisame además si el repo tiene material que nunca debería pushearse a un remoto.

**Índice completo:** si ya hay un índice parcial (un README que lista 7 de 21), el `INDICE.md` nuevo debe cubrir **todos** — los no listados eran huérfanos, que es justo el problema a resolver.

**Reparar refs:** paths de índices, links entre páginas, refs desde el archivo de instrucciones y las memorias/planes, y el acople de scripts que se muevan a `scripts/<tool>/`: `__dirname` (reapuntar) o **cwd** (prependerles `process.chdir(require('path').join(__dirname, '<ruta a los datos>'))`, que evita reescribir cada I/O). Corré el lint para confirmar 0 refs rotas.

⚠️ **Un script referenciado por ruta en la config de permisos de tu harness NO se mueve alegremente.** Las reglas matchean por **prefijo de ruta exacto** (ej. `"Bash(bash tools/moonraker-get.sh:*)"`): moverlo rompe el match ⇒ se pierde la pre-autorización y vuelven los prompts (en headless, es una denegación directa). Antes de mover un script, buscá su ruta en la config. Si aparece: no lo muevas, o actualizá la regla a la ruta nueva en el mismo paso. Misma lógica que el `.gitignore`: mover un archivo rompe todo lo que lo referencia por ruta.

**Si el repo no tiene git:** hacé `git init` + commit inicial **ANTES** de mover nada. Un commit inicial tomado después de la migración no sirve como rollback.

## 6. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`) + la estructura final. No hagas commit salvo que te lo pida.
