# Publicar el harness en inglés

**Estado: Diferido · Creado 26-07-21.** Pedido de Javier: publicar el proyecto en GitHub **en inglés** para llegar a un público mayor. **Diferido a propósito:** se hace cuando el harness esté bien pulido, no antes — migrar el idioma sobre un diseño que todavía se mueve es trabajo que se rehace.

## Qué es

Migración de idioma del harness completo, de español a inglés, para publicación pública. **No es renombrar archivos sueltos:** hoy *todo* el harness es español (estructura, contenido, lints, glosario, decisiones, preferencias).

## Alcance (lo que hay que migrar)

- **Nombres estructurales:** `INDICE`→`INDEX`, `PLANES`→`PLANS`, `ESTADOS`→`STATES`, `MEMORIA`→`MEMORY`, `PREFERENCIAS`→`PREFERENCES`, `MANIFIESTO`→`MANIFEST`… + carpetas de subsistemas (`memoria`, `conocimiento`, `glosario`, `decisiones`, `herramientas`, `planes`, `preferencias`).
- **Contenido:** `AGENTS.md`, todos los índices/registros, glosario, decisiones, memorias, skills (`SKILL.md` + `description`), READMEs, plantillas del orquestador, comentarios de lints/scripts.
- **Lints:** rutas y strings hardcodeados en español (nombres de columnas, headers de tabla que parsean, mensajes de salida).
- **Marketplace/plugins:** nombres de plugin, `name` del marketplace (`xelnagah-harness` ya estaba pendiente de renombre por otra vía).

## Se cruza con

- **[Separar mecánica del harness de criterio del autor](Separar%20mecanica%20del%20harness%20de%20criterio%20del%20autor.md):** publicar para otros obliga a separar el criterio personal (español, ejemplos, commits en español) de la mecánica. La migración de idioma y esa separación conviene hacerlas juntas o en secuencia — no traducir a ciegas criterio que quizá no debería viajar.

## Preguntas abiertas

- **¿Bilingüe o reemplazo?** Sospecha: reemplazo — sostener dos idiomas es el doble mantenimiento que ya sufrimos con los textos embebidos del orquestador.
- **¿El dominio del usuario también va a inglés, o solo la infra del harness?** La preferencia Base dice *"español para el dominio, inglés para infra"* — publicar en inglés puede exigir revisar esa preferencia misma.
- **¿Repos consumidores ya instalados en español?** Ruptura (como el `name` del marketplace).
- **¿Se traduce el historial** (decisiones, memorias viejas) o solo lo vivo?

## Depende de

Que el harness esté **pulido y estable** (por eso Diferido). No arrancar mientras el diseño se mueve.
