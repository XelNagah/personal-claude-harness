# Nombres y distribución de las skills del harness

**Estado:** Analizado con `planificar` (26-07-21) — listo para ejecutar. Eje 1 (nombre) → decisión **0014**; eje 2 (segmentación de skills) → decisión **0013**. **Parte ejecutada (26-07-21):** rename de la skill local `info`→`amp-info` (ver "Skills locales de autoría" abajo).

> Antes se llamaba *"Namespacing de skills del harness bajo prefijo AMP/MPA"*. Renombrado: "Namespacing" es anglicismo (0004) y el título no decía qué hace el plan.

## Idea cruda del usuario

Al converger el nombre del repo hacia **Agente Multipropósito (AMP)** / **Multi Purpose Agent (MPA)**, separar las skills del harness del resto de skills personalizadas, agrupándolas bajo un prefijo. Ejemplos que dio: en vez de `/inicializar-custom`, algo como `/mpa/inicializar-custom`; en vez de `incorporar-memoria` suelto, `/mpa/memoria/incorporar-memoria`.

Dos ejes entremezclados:

1. ~~**Convergencia de nombre del repo** hacia AMP/MPA (marca/título).~~ **Eje cerrado el 21/07/2026 → decisión 0014.** Queda **`Agentes Multipropósito` (AMP) / `Multipurpose Agents` (MPA)**, en una sola palabra; se descartó la variante en dos (`Multi Propósito`), que había quedado anotada como decidida el 20/07 pero obligaba a sostener dos formas y por eso la discusión reaparecía en cada sesión. El glosario lleva una fila única con las siglas como alias. La pantalla de bienvenida ya muestra ese nombre. **Sigue pendiente de este plan:** el nombre del marketplace (`xelnagah-harness`), que rompe a los consumidores ya instalados.
2. ~~**Namespacing / agrupación de las skills** bajo ese prefijo.~~ **Eje cerrado el 21/07/2026 → decisión 0013.** La segmentación se hace por el **prefijo nativo `plugin:skill`** de Claude Code (cada subsistema ya es un plugin → `memoria:registrar-memoria`, `glosario:converger-terminologia`). Se descartó el `/mpa/…` con barras (no existe) y el prefijo único `amp:` (exige un mega-plugin que esconde el subsistema y rompe la modularidad 0009). Foco Claude Code; Codex/Cursor/Gemini **diferidos** (sin mecanismo de prefijo).

## Diseño acordado (decisión 0013)

- **Mecanismo = prefijo de plugin** `plugin:skill`. La estructura multi-plugin **es** lo que produce la segmentación → no se toca.
- **NO** se renombran las skills. **NO** hay prefijo único `amp:`.

## Qué hay que hacer

1. **Limpiar nombres de plugin** para que el prefijo sea el subsistema pelado: `memoria-local`→`memoria`, `gestion-de-planes`→`planes`, `preferencias-trabajo`→`preferencias`, `estilo-commits`→`commits` (glosario/decisiones/conocimiento/herramientas ya están). Toca cada `plugin.json` (`name`) + `marketplace.json` (verificar si duplica el name) + `REGISTRO.md` + `lint-harness`.
2. **Máquina de autoría: pasar de junction a instalación por plugin** (marketplace local) para ver la segmentación. Retirar los junctions de skills de Claude de esta máquina (colisionan con el plugin). **Costo aceptado:** se pierde la edición en vivo (el plugin copia a cache) — definir el flujo de refresco de autoría.
3. **Auditar las `description`** de cada skill: corto, "qué hace + cuándo se llama" (dispara el auto-invoke y explica cuándo aplica).
4. (Opcional, barato) **Catálogo agrupado por subsistema** en `/amp-info` / `AGENTS.md`.

## Skills locales de autoría (prefijo `amp-`)

El prefijo `plugin:skill` de 0013 **solo aplica a skills que son plugin**. Las skills **locales de autoría** de este repo (`info`, `propagar-harness`, `agregar-funcionalidad`, en `.claude/skills/`, sin plugin, no distribuibles) se invocan por **nombre pelado** ⇒ no tienen `plugin:` disponible ⇒ colisionan con skills homónimas del cliente (caso real: `/info` se pisa con una skill local de Claude Code para VS Code). 0013 no las contempló: es su hueco.

**Política:** las skills locales de autoría llevan prefijo **`amp-`** (la marca del harness, decisión 0014). Es la vía de segmentación equivalente a `plugin:skill`, para el caso sin plugin.

- **Candidato a decisión** al ejecutar: formalizar la política como extensión de 0013 a las skills locales. Ratificar el patrón `amp-<nombre>` (0016).
- **Tensión con 0015** (verbo+objeto): `info` es nominal (ya lo era); `amp-info` sigue siéndolo. Definir si `amp-` convive con verbo+objeto (`amp-propagar-harness`) o si el prefijo es solo para las nominales tipo comando. Sin resolver.

**Ejecutado (26-07-21):** `info`→`amp-info` (colisión real). Renombrada la carpeta `.claude/skills/info`→`amp-info`, `SKILL.md` (`name` + título + descripción), registro `herramientas/INDICE.md`, comentarios de `mostrar-pantalla-bienvenida.js`, y las menciones `/info` en los planes vivos. `propagar-harness`/`agregar-funcionalidad` **sin tocar** (no colisionan hoy; el prefijo se les aplica cuando se resuelva la tensión con 0015).

## Fuera de alcance / diferido

- **Codex/Cursor/Gemini:** instalan por junction (Agent Skills), sin mecanismo de prefijo ⇒ nombres pelados. La segmentación es hoy Claude-Code-only y rompe la paridad 0010 a propósito.
- **Renombre del marketplace** `xelnagah-harness` (eje 1, pendiente): ruptura para consumidores ya instalados.
- Relación con `Restaurar la portabilidad copiar y pegar del orquestador` y con `Revisar la nomenclatura de los subsistemas`.

## Notas

- `instalar-junctions` sigue siendo la Herramienta para los agentes no-Claude (diferidos); en esta máquina se deja de usar para las skills de Claude.
- No bloquea la pantalla de bienvenida.
