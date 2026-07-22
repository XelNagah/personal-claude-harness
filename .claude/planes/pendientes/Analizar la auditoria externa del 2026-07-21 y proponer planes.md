# Analizar la auditoría externa del 2026-07-21 y proponer planes

## Origen

El 2026-07-21 el agente de mejora de uso (repo `D:\Proyectos\analisis\como-uso-claude`) auditó este repo en profundidad como parte de su seguimiento. El informe completo vive allá: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-07\seguimiento-2026-07-21.md` (sección "Auditoría del harness"). Este plan es el traspaso: analizar cada hallazgo acá, con el contexto propio, y decidir qué merece plan.

## Hallazgos que YA parecen cubiertos por planes existentes — verificar cobertura y anotar

Por cada uno: confirmar que el plan existente lo cubre de verdad; si cubre parcial, anotar el faltante en ese plan (no abrir plan nuevo duplicado).

1. **README/AGENTS con el nombre viejo** ("Inicializador de Repos Custom"; el README no dice "AMP" ni una vez pese a la decisión 0014) → ¿lo cubre "Nombres y distribución de las skills del harness"? Ese plan mira plugins y marketplace; el título del README/AGENTS quizás no está en su alcance.
2. **Drift generacional**: el repo ya migró al modelo Manifiesto (decisión 0017) pero las funcionalidades siguen instalando imports incondicionales (`funcionalidades/setup-completo/.../PLANTILLA.md:64-67`) → paso "propagar" de "Subsistemas que explican cómo funcionan y su estado".
3. **Glosario sin skill de registro unitario y herramientas sin skill operativa** → "Revisar cada subsistema - sentido, disparador y skill de operación".
4. **Criterio personal en la Base** → "Separar mecánica del harness de criterio del autor".
5. **Instalación por copiar y pegar rota** → "Restaurar la portabilidad copiar y pegar del orquestador".

## Hallazgos SIN plan que los cubra — evaluar y abrir planes

1. **LICENSE inexistente.** Prerrequisito administrativo de cualquier publicación.
2. **Datos personales en lo distribuible**: `jllarens@gmail.com` en los 10 `plugin.json` y en `marketplace.json`; "jllarens"/"XelNagah" en títulos de README/AGENTS y nombre del marketplace. Parametrizar u obviar antes de publicar.
3. **Junctions solo-Windows**: `instalar-junctions.js` usa junctions NTFS; el README menciona `ln -s` como equivalente pero la Herramienta no lo implementa. Decidir: implementar la vía multiplataforma o apoyarse solo en el marketplace (que no las necesita).
4. **Nombre público en inglés**: "harness" colisiona con "agent harness"/"test harness" (Claude Code usa el término para sí mismo); "Multipurpose Agents (MPA)" de la decisión 0014 es correcto pero flojo como nombre de repo. Pasada de naming antes de congelar la traducción.
5. **Términos vetados en texto distribuible**: "slug" en prosa de PLANTILLAs que viajan a consumidores (`funcionalidades/decisiones/README.md:36`, `funcionalidades/gestion-de-planes/.../PLANTILLA.md:23`, ~6 más en decisiones y setup-completo). Coherente con el hueco conocido: los SKILL.md/PLANTILLA no están en el alcance del lint de terminología.
6. **Inglés residual frente a "español en todo" (decisión 0006)**: el frontmatter de memorias que instala memoria-local usa tipos `user`/`feedback`/`project`/`reference` y líneas `**Why:**`/`**How to apply:**`, y los archivos se llaman `feedback_*`. Decidir: registrarlo como excepción (código informativo) o corregirlo.
7. **Consumidores con Base atrasada**: 8 repos siguen en Base v2 (el harness va por v3), incluido como-uso-claude. El mecanismo existe (`propagar-harness` + coordinador); falta un barrido que empareje la flota — ¿y un control que detecte el atraso solo?

## Cómo ejecutarlo

Correr por `planificar` (contrastar contra glosario, decisiones y planes vivos). Salida esperada: anotaciones en los planes existentes del primer grupo + los planes nuevos que sobrevivan el análisis del segundo grupo. El orden sugerido por la auditoría para publicar: efecto conductual + renombre AMP + propagar Manifiesto → subsistemas a medias → recién ahí la migración a inglés (traducir congela; traducir deuda es pagarla dos veces).
