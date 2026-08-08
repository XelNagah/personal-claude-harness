---
name: inicializar
description: Inicializa en el repo actual el setup estándar completo del Agente Multipropósito — arma el .claude completo con el catálogo de subsistemas y las casas Base (preferencias, planes, conocimiento, semántica, decisiones, herramientas, conducta y comunicacion). Use when el usuario dice "amp:inicializar", "inicializá el repo", "armá el .claude", "setup completo" o quiere arrancar un proyecto nuevo con su setup estándar.
---

# Inicializar setup completo (orquestador)

Instala el setup estándar completo del Agente Multipropósito: el catálogo de subsistemas y las nueve casas Base. (La skill de análisis `planificar` no se instala por-repo: es global.)

**Los Componentes de Subsistema son archivos reales**, en [`base/`](base/), con el mismo árbol que ocupan en el destino: `base/planes/lint-planes/lint-planes.js` va a `.claude/planes/lint-planes/lint-planes.js`. Instalar es **copiar ese árbol**, no transcribir texto. La estructura dice a dónde va cada archivo, así que no hay ninguna lista de Componentes de Subsistema que mantener al día — y no puede quedar afuera uno que nadie agregó a la lista.

Lo que **no** se puede copiar está en [`PLANTILLA.md`](PLANTILLA.md): los pedazos que se suman a un archivo del repo sin pisarlo, los moldes con marcadores y las notas de reconciliación.

## Las tres clases de archivo, y cómo se instalan

**Cada archivo declara de quién es.** `amp:inicializar` usa esa declaración para reconocer el destino, pero su alcance es instalar ausencias, no actualizar versiones existentes.

| Lo que dice el archivo | Qué es | Qué se hace |
|---|---|---|
| **sin frontmatter** | mecanismo del Agente Multipropósito: lints, hooks, manifiestos, README, páginas de convención | si falta, se copia; si coincide, `ya estaba`; si difiere, `divergente` |
| **`origen: agente-multiproposito`** | registro que manda el Agente Multipropósito; el repo no escribe ahí | si falta, se copia; si coincide, `ya estaba`; si difiere, `divergente` |
| **`origen: agente-desplegado`** | registro que el repo puebla con lo suyo | si falta, se copia declarado y sin filas; si existe, se preserva entero y se valida |

**Esta skill nunca pisa un Componente existente para ponerlo al día.** Si encuentra una Base vieja, un encabezado local viejo o una forma anterior, el repo ya tiene una instalación viva: reportar la divergencia y continuar con `amp:actualizar`, que hace respaldo, distingue Base de Aprendizaje y aplica las migraciones en orden.

El corte en la primera línea de una tabla y el reemplazo de archivos Base son reglas del actualizador. Mantenerlas fuera de la inicialización evita que un pedido de “armá el setup” actualice silenciosamente un Agente Desplegado existente.

## Lo que se fusiona, no se copia

Cuatro archivos son del repo y el Agente Multipropósito solo les **suma** líneas. Nunca se pisan: se hace merge, y si la entrada ya está, no se duplica.

- **`AGENTS.md`** → la sección `## Subsistemas`, con una línea `@.claude/<sub>/MANIFIESTO.md` por subsistema instalado, **`preferencias` incluido** (no lleva sección propia). La descripción del proyecto no se toca. Bloque en `PLANTILLA.md` §Subsistemas.
- **`.claude/settings.json`** y **`.codex/hooks.json`** → el repartidor `establecer-conducta` en los tres eventos (`SessionStart`, `UserPromptSubmit`, `PreToolUse` con matcher `Write|Edit`) más el lint de planes en `SessionStart`, **sin sacar los hooks que ya estén**. Bloques en `PLANTILLA.md` §Hooks.
- **`CLAUDE.md`** → el adaptador de una línea (`@AGENTS.md`), si el repo no lo tiene.
- **`.gitignore`** → las dos rutas donde escribe el mecanismo: la config de Claude Code propia de la máquina y `.claude/tmp/`, que es el buzón de avisos y el directorio de borradores. **Sin esto la primera sesión deja archivos del buzón listos para el primer commit**, y los mecanismos que dan por sentado que ese directorio se ignora quedan apoyados en una premisa que nadie estableció. Bloque en `PLANTILLA.md` §Gitignore.

## Reconciliación (idempotencia)

Segura de re-correr para completar un repo nuevo o una instalación parcial con Componentes ausentes. **No reemplaza a `amp:actualizar`** para una Base ya instalada. Reglas para todo paso que escribe:

- **Inspeccionar antes de escribir.** Leer el destino primero. Los tres archivos que se fusionan nunca se reescriben de cuajo.
- **Detectar equivalentes.** Un Componente de Subsistema puede estar con otro nombre o redacción, de pedidos previos. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar.
- **Las formas anteriores** que hay que reconocer (preferencias en cuatro formas, el punto de entrada viejo, `glosario/` sin renombrar) están en `PLANTILLA.md` §Formas anteriores. Detectarlas acá sirve para derivar a `amp:actualizar`; ninguna se transforma durante la inicialización.
- **Reportar al final** en tres grupos por subsistema: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del usuario).

## Estructura objetivo

Es exactamente el árbol de [`base/`](base/) colgado de `.claude/`, más lo que no es un archivo:

- `.claude/planes/pendientes/`, `ejecutados/` y `descartados/`, cada una con su `.gitkeep`.
- `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.codex/hooks.json` y `.gitignore`, que se fusionan.

`.claude/common/` no es un subsistema y no tiene manifiesto: son los módulos que usan varios y no son de ninguno —hoy la lectura de frontmatter, que requieren los nueve lints y los dos hooks—. **Se copia antes que el resto**: lo que lo requiere no corre sin él.

Cargan su índice **subsistemas, preferencias, conocimiento y herramientas**; NO lo cargan **planes, semántica, decisiones, conducta y comunicacion** — cada manifiesto lo declara incluyendo o no su línea de importación.

## Flujo de trabajo

1. **Ubicar la raíz.** Si el directorio de trabajo contiene subproyectos independientes, preguntar en cuál inicializar antes de crear nada.
2. **Completar el árbol `base/`** en `.claude/`, archivo por archivo: copiar solo lo ausente, empezando por `common/`; comparar lo existente y reportar toda diferencia sin pisarla. Crear las tres carpetas del ciclo de planes con su `.gitkeep` si faltan.
3. **Fusionar** `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.codex/hooks.json` y `.gitignore` desde `PLANTILLA.md`.
4. **Detectar formas anteriores** según `PLANTILLA.md` §Formas anteriores. Si aparece alguna, no migrarla acá: incluirla entre las divergencias y derivar la continuación a `amp:actualizar`.
5. **Verificar.** Correr todos los lints instalados y `../actualizar/amp-actualizar.js --vista-previa`. En una instalación nueva o parcial sin divergencias, el grupo `BASE — INSTALAR / PISAR` tiene que quedar **vacío, o con `identidad.md` como única línea**: el Título y el Propósito **se preguntan, no se inventan**. Si la vista previa muestra contenido viejo o migraciones, no aplicar desde esta skill; reportar que la instalación requiere `amp:actualizar`.
6. **Reportar.** Por subsistema: `agregado` / `ya estaba` / `divergente`. Avisar que en Codex los hooks solo corren si la carpeta `.codex/` es de confianza. No hacer commit salvo pedido explícito.
