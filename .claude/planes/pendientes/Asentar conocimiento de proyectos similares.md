# Asentar conocimiento de proyectos similares

## Origen

El 2026-07-21, a pedido del user, el agente de mejora de uso (repo `D:\Proyectos\analisis\como-uso-claude`) relevó online si ya existe algo similar a este harness antes de publicarlo en GitHub en inglés. El relevamiento completo (con links y detalle) quedó en `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-07\proyectos-similares-harness.md`. Ese saber le pertenece a ESTE repo — es conocimiento de su dominio — y hoy vive afuera.

## Qué asentar

Crear la página en `.claude/conocimiento/` (partiendo del documento fuente, adaptado a la voz de este repo), indexarla y correr el lint. Contenido mínimo:

- **Conclusión**: no hay nada que combine lo mismo; el espacio está libre.
- **Comparables** (2026-07-21): Agent OS (~5.1k ⭐, estándares/specs solo-código), Cline Memory Bank y derivados (memoria no tipada), claude-mem (compresión automática, opaca), BMAD/SuperClaude/claude-flow (workflows multi-agente para dev), mylesfranklin/claude-harness (parecido en espíritu, embrionario).
- **Diferenciadores** (lo que nadie tiene junto): propósito general no-código; subsistemas de aprendizaje tipados; lints mecánicos sin LLM; instaladores idempotentes y reconciliables; gobernanza terminológica con ratificación del user.
- **Riesgo de posicionamiento**: que lo lean como "otro memory bank" — el README en inglés tiene que diferenciarse de eso en el primer párrafo. Ángulo fuerte: *"typed learning subsystems with mechanical integrity checks, for any domain — not just code"*.

## Nota

Referenciar la página nueva desde el plan "Publicar el harness en ingles" (Diferido): este relevamiento es insumo directo de ese plan (posicionamiento y nombre público). Marcar la fecha del relevamiento — el ecosistema se mueve rápido y esto caduca.
