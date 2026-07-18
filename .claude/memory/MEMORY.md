# Memoria del proyecto

Cargar al inicio de cada sesión y respetar.

- [Flujo de planes](feedback_flujo_planes.md) — ciclo pendiente→ejecutado en `.claude/planes/`, formato de nombre y secciones obligatorias al ejecutar.
- [Estilo de commits](feedback_estilo_commits.md) — commits en español, sin co-autoría de IA.
- [Base de conocimiento](feedback_base_conocimiento.md) — todo lo que el agente sabe vive en `.claude/conocimiento/`; lint de integridad al cerrar.
- [Glosario](feedback_glosario.md) — terminología del dominio en `.claude/glosario/`; tabla + alias registrados + detalle para lo complejo; consultar al planificar/analizar.
- [Decisiones](feedback_decisiones.md) — decisiones estructurales en `.claude/decisiones/` (no ADR); tabla + detalle; consultar para no re-decidir ni contradecir.
- [Scripts](feedback_scripts.md) — cada tool en `.claude/scripts/<tool>/` con README; registro + lint; cuidado con refs por ruta.
