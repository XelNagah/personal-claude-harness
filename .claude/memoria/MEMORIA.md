# Memoria del proyecto

Cargar al inicio de cada sesión y respetar.

- [Flujo de planes](feedback_flujo_planes.md) — planes en `.claude/planes/` (pendientes/ejecutados/descartados) con registro `PLANES.md` y estados en `ESTADOS.md` (máquina de un eje); nombre estable, estado y fechas en el registro; lint al cerrar.
- [Archivo de estado](feedback_archivo_de_estado.md) — en exploraciones multi-variable, UN archivo de estado actualizado antes de reportar; leerlo al retomar.
- [Estilo de commits](feedback_estilo_commits.md) — commits en español, sin co-autoría de IA; título `<Área>: <Resumen>` (área = tema funcional) y cuerpo `Antes, … Ahora, …` de una o dos oraciones. **Leer antes de redactar un commit o PR.**
- [Base de conocimiento](feedback_base_conocimiento.md) — todo lo que el agente sabe vive en `.claude/conocimiento/`; lint de integridad al cerrar.
- [Glosario](feedback_glosario.md) — terminología del dominio en `.claude/glosario/`; tabla + alias registrados + detalle para lo complejo; consultar al planificar/analizar.
- [Terminología canónica](feedback_terminologia_canonica.md) — una regla escrita con el vocabulario que prohíbe se auto-refuerza; ratificar no cambia nada hasta bajarlo al texto. Barrer canónicos primero; enunciar contra la lista aprobada, no contra prohibidos.
- [Decisiones](feedback_decisiones.md) — decisiones estructurales en `.claude/decisiones/` (no ADR); tabla + detalle; consultar para no re-decidir ni contradecir.
- [Herramientas](feedback_herramientas.md) — tools del Propósito (script/skill local/MCP) en `.claude/herramientas/` con registro (columna Tipo); los lints de subsistema **no** son herramientas (viven con su subsistema, dec. 0008); cuidado con refs por ruta.
- [Propagación al harness](feedback_propagacion_harness.md) — propagar cambios textuales a funcionalidades + orquestador: delegar a subagente fresco (no fork), verificar la exactitud textual de los embebidos uno mismo.
