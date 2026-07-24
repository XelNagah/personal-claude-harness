# Asentar conocimiento de proyectos similares

## Origen

El 2026-07-21, a pedido del user, el agente de mejora de uso (repo `D:\Proyectos\analisis\como-uso-claude`) relevó online si ya existe algo similar a este harness antes de publicarlo en GitHub en inglés. El relevamiento completo (con links y detalle) quedó en `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-07\proyectos-similares-harness.md`. Ese saber le pertenece a ESTE repo — es conocimiento de su dominio — y hoy vive afuera.

## Qué asentar

Crear la página en `.claude/conocimiento/` (partiendo del documento fuente, adaptado a la voz de este repo), indexarla y correr el lint. Contenido mínimo:

- **Conclusión**: no hay nada que combine lo mismo; el espacio está libre.
- **Comparables** (2026-07-21): Agent OS (~5.1k ⭐, estándares/specs solo-código), Cline Memory Bank y derivados (memoria no tipada), claude-mem (compresión automática, opaca), BMAD/SuperClaude/claude-flow (workflows multi-agente para dev), mylesfranklin/claude-harness (parecido en espíritu, embrionario).
- **Comparable más cercano — agregado 2026-07-23: Hermes Agent (Nous Research).** Mismo blueprint que el AMP (memoria + skills + persona + crons + self-improving loop) pero como framework standalone con runtime propio; sin gobernanza terminológica del dominio. Es el que más se le parece de todo el relevamiento. Detalle de mecanismos (para el traspaso): `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\hermes-agent.md`. Al asentar acá, sumarlo a la tabla de comparables y usar su ausencia de capa terminológica para reforzar el diferenciador de gobernanza.
- **Diferenciadores** (lo que nadie tiene junto): propósito general no-código; subsistemas de aprendizaje tipados; lints mecánicos sin LLM; instaladores idempotentes y reconciliables; gobernanza terminológica con ratificación del user.
- **Riesgo de posicionamiento**: que lo lean como "otro memory bank" — el README en inglés tiene que diferenciarse de eso en el primer párrafo. Ángulo fuerte: *"typed learning subsystems with mechanical integrity checks, for any domain — not just code"*.

## Material adicional a asentar (2026-07-23): mapeo de replicación de Hermes

Además del relevamiento de comparables, el repo de mejora de uso produjo un **diseño de cómo replicar los componentes de Hermes con los subsistemas del AMP**: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\replicar-hermes-en-amp.md`. Es conocimiento de dominio de ESTE repo (cómo se construye el harness), candidato natural a página propia en `conocimiento/`.

Valor de asentarlo acá: `/planificar` contrasta contra `conocimiento/`, así que el mapeo queda disponible **al planificar cualquier cosa del bucle de auto-mejora / `conducta` / memoria**, no solo desde los planes que hoy lo referencian por ruta. Costo real bajo: solo la línea del `INDICE.md` se carga al inicio; la página se lee a demanda. Al asentar, adaptar a la voz del repo y sumar los huecos sin plan que el mapeo detecta (búsqueda de sesiones pasadas, auto-escritura de memoria, corte por seguridad de costo en tareas agendadas) como candidatos a plan.

## Nota

Referenciar la página nueva desde el plan "Publicar el harness en ingles" (Diferido): este relevamiento es insumo directo de ese plan (posicionamiento y nombre público). Marcar la fecha del relevamiento — el ecosistema se mueve rápido y esto caduca.
