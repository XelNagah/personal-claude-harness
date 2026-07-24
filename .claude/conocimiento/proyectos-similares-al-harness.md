# Proyectos similares al harness — relevamiento 2026-07-21

Relevamiento online (buscador y descarga de páginas locales) hecho el **2026-07-21**, con un agregado del **2026-07-23**, para saber si ya existe algo que combine lo que combina este harness, antes de publicarlo en GitHub en inglés.

**Conclusión: no hay nada que combine lo mismo. El espacio está libre y el enfoque es publicable.**

⚠️ **Caduca.** El ecosistema de agentes se mueve rápido: las estrellas, el estado de madurez y hasta la existencia de estos proyectos valen a la fecha del relevamiento. Antes de usar esto para posicionar la publicación, re-verificar.

## Comparables

| Proyecto | Qué es | Qué le falta frente al harness |
|----------|--------|-------------------------------|
| [Agent OS](https://github.com/buildermethods/agent-os) (buildermethods, ~5.1k ⭐ al 2026-07-21) | Estándares y especificaciones para desarrollo con agentes; extrae convenciones del código y las inyecta según lo que se construye | Solo dominio código; sin glosario, decisiones ni ciclo de planes; sin lints de integridad |
| [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank) y derivados ([claude-code-memory-bank](https://github.com/hudrazine/claude-code-memory-bank), memory-bank-skill) | Contexto persistente entre sesiones vía `.md` jerárquicos que se releen al arrancar | Memoria sin tipar: un solo bloque de contexto, sin subsistemas diferenciados ni validación mecánica |
| [claude-mem](https://docs.claude-mem.ai/introduction) | Compresión automática de sesiones a memoria persistente | Automático y opaco: sin curaduría del usuario ni estructura por tipo de saber |
| [BMAD Method](https://docs.bmad-method.org/) / [SuperClaude](https://github.com/SuperClaude-Org/SuperClaude_Framework) / claude-flow | Flujos de trabajo multiagente para desarrollo de software (roles, fases, comandos) | Orquestación de roles de desarrollo; nada de aprendizaje estructurado del dominio |
| [mylesfranklin/claude-harness](https://github.com/mylesfranklin/claude-harness) | Envoltorio de auto-mejora por fases (auto-conocimiento → memoria → barreras → meta-aprendizaje) | La idea más parecida en espíritu, pero embrionaria (4 commits, 1 ⭐) y centrada en la herramienta, no en el dominio del usuario |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) (Nous Research) | El comparable más cercano — ver abajo | Motor propio (no una capa sobre Claude Code); sin gobernanza terminológica del dominio del usuario |

También existen GitHub Spec Kit (especificaciones para código), bases de conocimiento personales armadas con Claude Code (artículos, no harness) y colecciones de subagentes (VoltAgent/awesome-claude-code-subagents).

## Hermes Agent — el comparable más cercano (hallado 2026-07-23)

Producto abierto de Nous Research (`pip install hermes-agent`): motor propio, varios proveedores de modelo, 24 plataformas de chat, 80+ skills de fábrica. **Es el mismo diseño de fondo que el Agente Multipropósito, pero como producto instalable con motor propio.** Se describe con cinco componentes: memoria, skills, persona, tareas agendadas y bucle de auto-mejora.

| Componente Hermes | Qué es | Equivalente en el AMP |
|---|---|---|
| Memoria | archivos que el propio agente edita con una herramienta de memoria, más sesiones pasadas buscables | `memoria/` tipada + `conocimiento/`, escritas a mano vía skills |
| Skills | las crea desde la experiencia y las mejora con el uso | skills del harness (slash + disparo conversacional) |
| Persona | `SOUL.md` | `PREFERENCIAS.md` (Base/Adaptaciones), siempre en contexto |
| Tareas agendadas | tareas de agente, no de shell, con corte por seguridad de costo | fuera del harness (repo `Alertas-Push`) |
| Bucle de auto-mejora | observar → destilar → reusar → afinar, automático | **hueco**: hoy es manual (`buscar-conocimiento` + seguimientos que dispara el usuario) |

**Terminología: acá el AMP está adelante, no atrás.** Los "glosarios" de Hermes son documentación *sobre* Hermes para humanos (una wiki autogenerada del código y páginas de presentación). Hermes **no tiene** gobernanza terminológica del dominio del usuario: ni glosario con alias registrados, ni convergencia (detectar sinónimos y anglicismos para ratificar o vetar), ni lint de colisiones, ni el Control "el agente propone, el usuario ratifica".

Detalle de mecanismos y qué conviene copiar: [replicar Hermes en el AMP](replicar-hermes-en-el-amp.md).

## Diferenciadores del harness (lo que nadie tiene junto)

1. **Propósito general, no solo código** — contabilidad, mudanza, sucesión — cuando todo el ecosistema apunta a desarrollo de software.
2. **Subsistemas de aprendizaje tipados** (conocimiento ≠ glosario con alias ratificados ≠ decisiones ≠ planes con ciclo de vida ≠ herramientas), donde los demás tienen un solo bloque de memoria.
3. **Lints mecánicos sin LLM** como garantía de integridad: ningún comparable valida su memoria.
4. **Instaladores idempotentes y reconciliables**: instalar sobre repo vacío o poblado sin pisar lo divergente.
5. **Gobernanza terminológica** (alias, vetos, ratificación del usuario): no existe en ningún comparable, **ni siquiera en Hermes**. Confirmado el 2026-07-23.

## Riesgo de posicionamiento

A primera vista lo pueden leer como "otro banco de memoria". El README en inglés tiene que diferenciarse de eso **en el primer párrafo**. Ángulo fuerte: *"typed learning subsystems with mechanical integrity checks, for any domain — not just code"*.

Ojo también con el nombre: *harness* en inglés colisiona con *agent harness* / *test harness*, término genérico que el propio Claude Code usa para sí.

Este relevamiento es insumo directo del plan **Publicar el harness en inglés** (Diferido): posicionamiento y nombre público.

## Fuente

Relevamiento original del agente de mejora de uso, en `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-07\proyectos-similares-harness.md` (comparables) y `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\hermes-agent.md` (mecanismos de Hermes).
