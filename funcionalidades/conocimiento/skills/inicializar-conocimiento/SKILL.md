---
name: inicializar-conocimiento
description: Instala la base de conocimiento del usuario en el repo actual (.claude/conocimiento/ como ubicación única + lint de integridad en .claude/scripts/lint-conocimiento/). Migra el conocimiento que esté disperso — en la raíz del repo Y dentro de memory/ (documentos sin frontmatter que se archivaron ahí de más). Use when el usuario dice "inicializar conocimiento", "base de conocimiento", "armá el conocimiento", o como parte del setup completo.
---

# Inicializar base de conocimiento

Instala la convención de **base de conocimiento**: una carpeta única `.claude/conocimiento/` donde vive todo lo que el agente sabe, más un lint de integridad. Si el repo ya tiene conocimiento disperso (en la raíz), **migrarlo** adentro. Depende de `memoria-local` (la convención se persiste como memoria tipada).

## Estructura objetivo

```
.claude/
├── conocimiento/
│   └── INDICE.md                          # índice raíz (solo punteros)
├── memory/
│   └── feedback_base_conocimiento.md      # la convención, como memoria
└── scripts/
    └── lint-conocimiento/
        └── lint-conocimiento.js           # lint mecánico
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto.
- **Detectar equivalentes.** Una carpeta/sección puede estar con otro nombre. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → reportar y decidir.
- **Reportar al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto o requiere decisión).

## Workflow

1. **Carpeta de conocimiento.** Asegurar `.claude/conocimiento/` con un `INDICE.md` raíz (encabezado + una línea por página/sección; solo punteros, nunca contenido). Si no existe, crear.
2. **Tool de lint.** Instalar `.claude/scripts/lint-conocimiento/lint-conocimiento.js` con el contenido EXACTO de [PLANTILLA.md](PLANTILLA.md) §Script. Va en **su propia carpeta** bajo `scripts/`, nunca suelto.
3. **Memoria de la convención.** Instalar `.claude/memory/feedback_base_conocimiento.md` (PLANTILLA.md §Memoria) e indexarla en `MEMORY.md` (agregar solo la línea si falta).
   **Chequeo de la dependencia `memoria-local`:** si **no existe `.claude/memory/MEMORY.md`**, el repo diverge del estándar (típico: usa un `README.md` como índice, o no tiene índice). Crearlo con el formato estándar (encabezado `Cargar al inicio de cada sesión y respetar.` + una línea por memoria) y reportar la divergencia. Si había un `README.md` haciendo de índice, su contenido casi seguro describe **conocimiento**, no memorias → usarlo como base del `INDICE.md` del paso 1 (ver paso 5b) y no dejar dos índices compitiendo.
4. **Sección en `CLAUDE.md`.** Asegurar una sección **"Base de conocimiento del proyecto"** con link a `conocimiento/INDICE.md`, la regla de ubicación única, y el paso de lint al cerrar. Si ya hay una equivalente (otro título, mismo tema), no duplicar.
5. **Migración (el punto de la funcionalidad).** Detectar conocimiento que viva **fuera** de `.claude/conocimiento/` y moverlo adentro. Buscar en **tres** lugares, no solo el obvio:

   **(a) En la raíz del repo** — árboles de md, carpetas con su propio `INDICE.md`, notas de dominio sueltas.

   **(b) DENTRO de `memory/` — el caso más común en repos viejos, y el que más se pasa por alto.** La memoria se desborda y termina siendo la base de conocimiento. Señales de que un archivo de `memory/` es en realidad conocimiento, no memoria:
   - **No tiene frontmatter** (`name`/`description`/`metadata.type`) → nunca fue una memoria del estándar.
   - **Es largo** (decenas o cientos de líneas, con secciones propias) → es un documento, no un hecho atómico.
   - **Es un diccionario, catálogo, procedimiento, formato de reporte o estructura** → conocimiento de dominio.
   - **`memory/` usa un `README.md` como índice en vez de `MEMORY.md`** → señal fuerte de que ese directorio se usó como base de conocimiento.

   Lo que **sí** es memoria y se queda: hechos atómicos tipados con frontmatter (`user`/`feedback`/`project`/`reference`).

   **(c) Fuentes crudas — NO son conocimiento y NO se mueven.** Distinguir lo que el agente **lee** de lo que **sabe**: escaneos, PDFs de resúmenes/facturas, exports, json/csv de origen, adjuntos. Son insumos inmutables; se quedan donde están (salvo que ya estén entreverados dentro de una carpeta de conocimiento, en cuyo caso se mueven con ella). El conocimiento es el md **sintetizado**.

   Reglas para el move:
   - Presentar un **plan concreto** (qué carpeta/archivo → dónde dentro de `conocimiento/`).
   - **Mover por defecto** (es el objetivo). Si es ambiguo qué es conocimiento vs. contenido incidental (código, assets, config de build), listar y **preguntar antes de mover**.
   - ⚠️ **Material sensible — chequear en los dos sentidos.**

     **(i) Lo que YA está gitignoreado:** si un archivo a mover está ignorado por su ruta (típico: `memory/*-token.md`, credenciales), **moverlo rompe el match del ignore y el secreto termina commiteado**. NO moverlo, o mover y **actualizar el `.gitignore` a la ruta nueva en el mismo paso**. Verificar con `git status` que no aparezca.

     **(ii) Lo que NO está gitignoreado y debería estarlo — más importante todavía, porque el riesgo ya existe antes de migrar.** Revisar el material del repo y **sugerirle al user** ignorar lo que sea riesgo de seguridad o privacidad:
     - **Credenciales:** tokens, API keys, `.env`, `*.key`/`*.pem`, archivos con `token`/`secret`/`credential`/`password` en el nombre o con claves embebidas en el contenido.
     - **Documentos personales/legales:** escaneos de DNI, escrituras, certificados, declaratorias, informes de dominio.
     - **Financiero:** resúmenes bancarios/tarjeta, libros contables, exports con movimientos.
     - **Salud:** estudios e informes médicos.

     Reportarlo como hallazgo aparte (no es parte de la migración) con el riesgo concreto y las líneas de `.gitignore` sugeridas. **Sugerir, no aplicar solo**: que el user decida — puede querer versionarlos deliberadamente en un repo local. Señalar además que un repo con este material **nunca debe pushearse a un remoto**.
   - **Índice completo, sin heredar agujeros.** Si ya existe un índice parcial (un README que lista 7 de 21), el `INDICE.md` nuevo debe cubrir **todos** los documentos, no solo los que listaba el viejo. Los no listados eran huérfanos: ese es justo el problema a resolver.
   - **Reparar referencias:** paths en cada `INDICE.md`, links entre páginas, refs desde `CLAUDE.md` y desde las memorias/planes, y el acople de los scripts que se muevan a `scripts/<tool>/` — `__dirname` (reapuntar a `.../conocimiento/...`) o **cwd** (prependerles `process.chdir(require('path').join(__dirname, '<ruta a los datos>'))`, que evita reescribir cada llamada de I/O).
   - Correr el lint tras mover y confirmar **0 refs rotas**.
   Si ya está todo bajo `conocimiento/`, no-op.

   **Recomendación fuerte:** si el repo no tiene git, hacer `git init` + commit inicial **ANTES** de mover nada. Un commit inicial tomado *después* de la migración no sirve como rollback.
6. **Reportar** en los tres baldes + estructura final. Si hubo `divergente`, listarlo aparte. **No hacer commit** salvo pedido explícito.
