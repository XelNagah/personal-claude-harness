# Probar la aplicación del modelo de Componentes de Subsistema como archivos

**Estado: Ejecutado · Creado 26-07-30 · Cerrado 26-07-30.**

## El problema

Los Componentes de Subsistema pasaron de viajar transcriptos adentro de `PLANTILLA.md` a viajar como archivos reales en `funcionalidades/amp/skills/inicializar/base/` (decisión `Local-0045`). El modelo está completo y los controles del repo lo declaran coherente: 13 bancos de pruebas verdes, 10 chequeos de cierre verdes, 74 archivos sincronizados.

**Eso no alcanza, y el propio repo lo tiene asentado.** El conocimiento `controles-que-no-avisan` documenta que un control puede quedarse en verde sin controlar nada; ninguno de los que hoy dan verde contesta si el instalador **funciona**. Lo que se probó del nivelador (`amp-actualizar.js`) fue el **detector**, en modo vista previa:

- Recorre el árbol y da cero sobre este repo.
- Con un script roto a propósito, marca `contenido viejo`.
- Con una fila agregada a un registro del Agente Desplegado, no marca nada — que es lo correcto.
- Con el encabezado de ese mismo registro envejecido, marca `encabezado viejo` y aclara que las entradas no se tocan.

Lo que **nunca corrió** es el flujo que **escribe**: el `SKILL.md` de `amp:inicializar` y el del nivelador. Ahí vive el trato nuevo —pisar el encabezado y preservar las filas— y lo ejecuta el agente leyendo texto, no un script. Un `SKILL.md` que nadie ejecutó es una especificación, no una herramienta que anda.

## El trabajo

Dos corridas, en este orden. Ambas **contra repos de prueba desechables**, nunca contra la flota real de Agentes con Propósito.

### 1. Repo vacío — camino de instalación limpia

Correr el flujo de `amp:inicializar` contra un repo recién creado y verificar:

- Aparecen los **74 archivos** del árbol `base/` colgados de `.claude/`, con la misma estructura.
- Las tres carpetas del ciclo de planes (`pendientes/`, `ejecutados/`, `descartados/`) existen, cada una con su `.gitkeep`.
- Los **cuatro Índices del Agente Desplegado** nacen **declarados y sin filas** (encabezado y frontmatter presentes, tabla vacía).
- `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json` y `.codex/hooks.json` se **fusionan**: se suma lo del Agente Multipropósito sin pisar lo que el repo ya tenía.
- Los lints instalados corren y dan verde en el repo nuevo.
- `amp-actualizar.js --vista-previa` da `BASE — INSTALAR / PISAR (0)`.

### 2. Copia de un repo ya instalado — camino de nivelado

Ahí importa el trato nuevo de los registros del Agente Desplegado:

- El encabezado (todo lo anterior a la primera línea de la tabla) queda en la versión nueva.
- Las **filas del repo se conservan**, ni una perdida.
- Los archivos de mecanismo (lints, hooks, manifiestos) se pisan enteros.

`Impresion3d` (en `D:\Proyectos\analisis\`) sirve como fuente para copiar, pero **no como primera prueba**: todavía declara `amp-memoria`, un plugin retirado, así que el flujo arranca por la migración de nombres y mezcla dos cosas distintas. Preferir una copia de un repo instalado limpio, o resolver primero la migración y recién después mirar el trato de los registros.

### Fuera de alcance

- El banco de pruebas de `amp-actualizar.js` y la decisión de si `ejecutar-pruebas` debe barrer `funcionalidades/` además de `.claude/`. Es un hueco estructural real —es el único script grande del repo sin banco, y uno puesto al lado suyo no se correría nunca— pero es una decisión de diseño que toca infra compartida (`ejecutar-pruebas`, Herramienta `Local-0007`) y va en su propio plan.
- Los renombres de formas anteriores (`glosario/` sin renombrar, las cuatro formas de preferencias) y el `--respaldo`. Se prueban después de que el camino principal ande.

## Trampas conocidas

- El repo de prueba **no** puede vivir bajo `.claude/tmp/` de este repo, aunque la preferencia `Local-0003` mande los temporales ahí: `ejecutar-pruebas` descubre cualquier `pruebas.js` bajo `.claude/` y `lint-harness` barre lo mismo. Un árbol `base/` copiado ahí adentro haría que este repo informe 26 bancos en vez de 13 y se compare contra sí mismo. Va al directorio temporal de la sesión.
- **`Set-Content -Encoding utf8` en PowerShell mete BOM.** Un `.md` con BOM deja de matchear el frontmatter, así que el archivo pierde su `origen` y pasa a compararse como si fuera mecanismo. Escribir con Node.
- **`lint-decisiones` toma el primer argumento como carpeta**, así que `--quiet` lo manda a una ruta inexistente y contesta en verde sobre cero decisiones. Correrlo sin flag.

## Estado

| Corrida | Resultado |
|---|---|
| Repo vacío | **verde, con un hallazgo** (30/07/2026) |
| Copia de repo instalado | **verde** (30/07/2026) |

### Corrida 1 — repo vacío

Contra un repo recién creado con contenido propio previo (`AGENTS.md` con su Propósito, `settings.json` con un hook y un permiso propios, `.codex/hooks.json` con un `PreToolUse` propio), usando como fuente el **plugin del cache** (`amp/0.14.0`), que es la copia que efectivamente corre:

- Los **74 archivos** se copian con la estructura correcta.
- Las tres carpetas del ciclo de planes nacen con su `.gitkeep`.
- **Once** Índices del Agente Desplegado (no cuatro, como decía el traspaso) nacen declarados y sin filas, sin BOM: `conducta/INDICE-LOCAL.md`, `conducta/MOMENTOS-LOCAL.md`, `conocimiento/INDICE.md`, `decisiones/INDICE.md`, `herramientas/INDICE-LOCAL.md`, `planes/ESTADOS-LOCAL.md`, `planes/PLANES.md`, `preferencias/PREFERENCIAS-LOCAL.md`, `semantica/GLOSARIO.md`, `semantica/TERMINOLOGIA-FARLOPA.md`, `subsistemas/SUBSISTEMAS-LOCAL.md`.
- Los cuatro archivos que se fusionan **conservan lo propio del repo**: la descripción del proyecto en `AGENTS.md`, el hook y el permiso previos en `settings.json`, y el `PreToolUse[Bash]` de Codex conviviendo con el `PreToolUse[Write|Edit]` nuevo.
- Los **ocho lints** dan cero hallazgos en el repo recién instalado.
- La Pantalla de bienvenida cuenta **2 Herramientas**, las dos del Agente Multipropósito. Las seis del Agente Desplegado de este repo **no viajaron**: el corte de `sincronizar-base` funciona, y la trampa de las seis Herramientas coladas está resuelta.

**Hallazgo — el criterio de aceptación del paso 5 no se puede cumplir.** El `SKILL.md` de `amp:inicializar` pide, al verificar, que `amp-actualizar.js --vista-previa` dé `BASE — INSTALAR / PISAR (0)`. Una instalación limpia y correcta da **1**, siempre: falta `.claude/identidad.md`, que el instalador no crea a propósito —el Título y el Propósito *se preguntan, no se inventan*— y que el nivelador reporta como ausente.

El resto del mecanismo está bien: la Pantalla de bienvenida degrada con gracia (`Título: <sin definir>`), le avisa al usuario y le inyecta al agente la instrucción de preguntarlos y asentarlos. Lo que está mal es el **criterio escrito**: un paso de verificación que nunca da verde entrena a ignorarlo, que es el modo de falla «marca tanto que se lo deja de leer» del conocimiento `controles-que-no-avisan`. El paso 5 debería aceptar `identidad.md` como el único faltante esperado, o el flujo debería preguntar Título y Propósito y crearlo antes de verificar.

### Corrida 2 — repo instalado que quedó viejo

Sobre una copia del repo de la corrida 1, envejecida a mano para aislar el trato nuevo: Aprendizaje propio en cinco registros del Agente Desplegado (2 términos, 1 decisión, 1 página de conocimiento, 1 Herramienta, 1 preferencia), encabezado de la convención anterior en tres de ellos, un lint y un manifiesto en la versión de cuando se instaló.

**El detector acertó los seis casos y no marcó ninguno de más:**

- Tres `encabezado viejo` (`semantica/GLOSARIO.md`, `herramientas/INDICE-LOCAL.md`, `preferencias/PREFERENCIAS-LOCAL.md`), aclarando que las entradas no se tocan.
- Dos `contenido viejo` (`conocimiento/lint-conocimiento.js`, `decisiones/MANIFIESTO.md`).
- **No** marcó `decisiones/INDICE.md`, `conocimiento/INDICE.md` ni `planes/PLANES.md`, que solo habían ganado filas. Es lo correcto.

**El respaldo se omitió**, porque `.claude/` estaba versionado en git — la rama que el paso 4 describe y que nunca se había ejercitado.

**La aplicación —el paso que nunca había corrido— hace lo que dice.** Aplicada la regla del paso 5, la vista previa bajó de 6 acciones a 1 (`identidad.md`, el falso pendiente de arriba), y el diff de git muestra exactamente **9 líneas borradas y ninguna agregada**: las tres frases de la convención vieja con sus líneas en blanco. El conteo de filas es idéntico antes y después en los cinco registros. Ningún término, decisión, página, Herramienta ni preferencia del repo se perdió.

Los ocho lints quedaron en cero y la Pantalla de bienvenida cuenta el Aprendizaje conservado: 15 preferencias (1 propia), 3 Herramientas (1 propia), 2 términos, 1 decisión, 1 página.

## Notas de implementación

Las dos corridas se hicieron contra repos desechables en el directorio temporal de la sesión, con el árbol de `base/` del **plugin del cache** (`amp/0.14.0`) como fuente, que es la copia que efectivamente corre. El segundo repo salió de copiar el primero ya instalado y envejecerlo, en vez de copiar un Agente con Propósito real: aísla el trato nuevo sin arrastrar la migración de `amp-memoria` que tiene `Impresion3d`.

**El modelo anda.** Las dos rutas que nunca se habían ejecutado —copiar el árbol en una instalación limpia, y pisar el encabezado preservando las filas al nivelar— hacen lo que su texto dice, y la rama de respaldo que se omite cuando git ya cubre `.claude/` también quedó ejercitada.

**Lo único que se corrigió** fue el criterio de verificación del paso 5 de `amp:inicializar`, que exigía `BASE — INSTALAR / PISAR (0)` cuando una instalación limpia y correcta da 1 (`amp` 0.14.1). La evidencia y lo que queda por decidir se anotaron en el plan `Identidad del Agente — Título y Propósito persistidos`, que ya tenía abierta la pregunta de si la captura del Título y el Propósito es interactiva en el setup.

**Quedó fuera de alcance**, en su propio plan sin abrir: el banco de pruebas de `amp-actualizar.js` y la decisión de si `ejecutar-pruebas` debe barrer `funcionalidades/` además de `.claude/`. También los renombres de formas anteriores y el `--respaldo` con respaldo real (el caso probado fue el de omisión por git).

### Nota de método

El conteo de hallazgos que se usó al principio para resumir los ocho lints estaba roto: buscaba el patrón `] (n)` y dos lints escriben `[n] NOMBRE (n):`, así que informó **cero sobre dos hallazgos reales**. Lo delató la Pantalla de bienvenida, que contaba bien. Es el modo de falla «valida sobre un conjunto vacío y contesta en verde» del conocimiento `controles-que-no-avisan`, cometido dentro de la prueba que venía a evitarlo. La autoridad sobre el estado de los lints es la Pantalla de bienvenida o la salida completa, nunca un conteo por patrón escrito al vuelo.
