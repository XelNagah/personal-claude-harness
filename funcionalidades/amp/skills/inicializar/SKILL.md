---
name: inicializar
description: Inicializa en el repo actual el setup estándar completo del Agente Multipropósito — arma el .claude completo con el catálogo de subsistemas y las casas Base (preferencias, planes, conocimiento, semántica, decisiones, herramientas y conducta). Use when el usuario dice "amp:inicializar", "inicializá el repo", "armá el .claude", "setup completo" o quiere arrancar un proyecto nuevo con su setup estándar.
---

# Inicializar setup completo (orquestador)

Instala el setup estándar completo del usuario: el catálogo de subsistemas y las ocho casas Base. (La skill de análisis `planificar` no se instala por-repo: es global.)

**Los Componentes de Subsistema son archivos reales**, en [`base/`](base/), con el mismo árbol que ocupan en el destino: `base/planes/lint-planes/lint-planes.js` va a `.claude/planes/lint-planes/lint-planes.js`. Instalar es **copiar ese árbol**, no transcribir texto. La estructura dice a dónde va cada archivo, así que no hay ninguna lista de Componentes de Subsistema que mantener al día — y no puede quedar afuera uno que nadie agregó a la lista.

Lo que **no** se puede copiar está en [`PLANTILLA.md`](PLANTILLA.md): los pedazos que se suman a un archivo del repo sin pisarlo, los moldes con marcadores y las notas de reconciliación.

## Las tres formas de escribir, y cómo se decide cuál

**Cada archivo declara lo que hay que hacer con él.** No hay lista de excepciones en ningún lado: se lee el frontmatter del archivo de `base/` y sale la regla.

| Lo que dice el archivo | Qué es | Qué se hace |
|---|---|---|
| **sin frontmatter** | mecanismo del Agente Multipropósito: lints, hooks, manifiestos, README, páginas de convención | **se pisa entero** |
| **`origen: agente-multiproposito`** | registro que manda el Agente Multipropósito; el repo no escribe ahí | **se pisa entero** |
| **`origen: agente-desplegado`** | registro que el repo puebla con lo suyo | **si no existe → se copia; si existe → se pisa todo lo anterior a la tabla y se preservan sus filas** |

La tercera es la que evita las dos pérdidas opuestas:

- Si se copiara entero, un repo perdería sus términos del glosario, sus planes, sus decisiones y sus Herramientas en cada nivelada.
- Si no se tocara nada, el **encabezado se quedaría viejo para siempre**: la convención, las columnas y las reglas de gobernanza que están arriba de la tabla son del Agente Multipropósito y cambian con él. Un repo instalado hace tres versiones lee instrucciones que ya no rigen y las obedece.

El corte es la primera línea de la tabla: de ahí para arriba manda el Agente Multipropósito, de ahí para abajo manda el repo. Si el archivo no tiene tabla, se pisa entero.

⚠️ **Divergencia en el encabezado.** Si el repo cambió el encabezado a propósito —no es lo esperado, pero pasa—, pisarlo se lo lleva. Antes de pisar, comparar: si difiere de la versión anterior conocida en algo que no sea la redacción del Agente Multipropósito, **reportar divergencia y preguntar** en vez de pisar.

## Lo que se fusiona, no se copia

Tres archivos son del repo y el Agente Multipropósito solo les **suma** líneas. Nunca se pisan: se hace merge, y si la entrada ya está, no se duplica.

- **`AGENTS.md`** → la sección `## Subsistemas`, con una línea `@.claude/<sub>/MANIFIESTO.md` por subsistema instalado, **`preferencias` incluido** (no lleva sección propia). La descripción del proyecto no se toca. Bloque en `PLANTILLA.md` §Subsistemas.
- **`.claude/settings.json`** y **`.codex/hooks.json`** → el repartidor `establecer-conducta` en los tres eventos (`SessionStart`, `UserPromptSubmit`, `PreToolUse` con matcher `Write|Edit`) más el lint de planes en `SessionStart`, **sin sacar los hooks que ya estén**. Bloques en `PLANTILLA.md` §Hooks.
- **`CLAUDE.md`** → el adaptador de una línea (`@AGENTS.md`), si el repo no lo tiene.

## Reconciliación (idempotencia)

Segura de re-correr: este es también el modo de **nivelar** repos que ya tienen partes del setup. Reglas para todo paso que escribe:

- **Inspeccionar antes de escribir.** Leer el destino primero. Los tres archivos que se fusionan nunca se reescriben de cuajo.
- **Detectar equivalentes.** Un Componente de Subsistema puede estar con otro nombre o redacción, de pedidos previos. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar.
- **Las formas anteriores** que hay que reconocer (preferencias en cuatro formas, el punto de entrada viejo, `glosario/` sin renombrar) están en `PLANTILLA.md` §Formas anteriores. Ninguna se resuelve copiando.
- **Reportar al final** en tres grupos por subsistema: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del usuario).

## Estructura objetivo

Es exactamente el árbol de [`base/`](base/) colgado de `.claude/`, más lo que no es un archivo:

- `.claude/planes/pendientes/`, `ejecutados/` y `descartados/`, cada una con su `.gitkeep`.
- `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json` y `.codex/hooks.json`, que se fusionan.

`.claude/common/` no es un subsistema y no tiene manifiesto: son los módulos que usan varios y no son de ninguno —hoy la lectura de frontmatter, que requieren los ocho lints y los dos hooks—. **Se copia antes que el resto**: lo que lo requiere no corre sin él.

Cargan su índice **subsistemas, preferencias, conocimiento y herramientas**; NO lo cargan **planes, semántica, decisiones y conducta** — cada manifiesto lo declara incluyendo o no su línea de importación.

## Flujo de trabajo

1. **Ubicar la raíz.** Si el directorio de trabajo contiene subproyectos independientes, preguntar en cuál inicializar antes de crear nada.
2. **Copiar el árbol `base/`** a `.claude/`, archivo por archivo, aplicando la regla que declara cada uno. Crear las tres carpetas del ciclo de planes con su `.gitkeep`.
3. **Fusionar** `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json` y `.codex/hooks.json` desde `PLANTILLA.md`.
4. **Reconciliar las formas anteriores** que el repo tenga, según `PLANTILLA.md` §Formas anteriores.
5. **Verificar.** Correr todos los lints instalados y `../actualizar/amp-actualizar.js --vista-previa`. El grupo `BASE — INSTALAR / PISAR` tiene que quedar **vacío, o con `identidad.md` como única línea**: el Título y el Propósito **se preguntan, no se inventan**, así que una instalación limpia los deja pendientes y un repo que ya los tenía cierra en cero. Cualquier otra entrada en ese grupo es un paso que quedó sin hacer. No inventar el archivo para llegar a cero — la Pantalla de bienvenida pide el Título y el Propósito al arrancar la sesión siguiente, y ahí se asientan.
6. **Reportar.** Por subsistema: `agregado` / `ya estaba` / `divergente`. Avisar que en Codex los hooks solo corren si la carpeta `.codex/` es de confianza. No hacer commit salvo pedido explícito.
