# Planificar — análisis crítico

Una skill de **análisis** que interroga un plan o una idea contra la **sabiduría del repo** (glosario + decisiones + conocimiento) hasta llegar a un acuerdo, para *descubrir qué hacer*, y lo critica (problemas, faltantes, oportunidades, sobreingeniería). Actualiza el glosario y las decisiones sobre la marcha.

**A diferencia de las demás funcionalidades, esta no instala nada en el repo destino** — es operacional: se invoca (`/planificar` o "analizá el plan") y opera. Por eso **no entra al orquestador** `setup-completo`. Consume las carpetas que instalan `glosario`, `decisiones` y `conocimiento`; si no están, degrada (no se rompe).

## Qué hace

- **Interroga hasta acuerdo.** Recorre el árbol de decisión; para cada pregunta ofrece una respuesta recomendada y avanza con ella por defecto (el usuario corrige lo que no le cierra). Agrupa las preguntas independientes en tandas y deja las que mandan de a una.
- **Dos miradas:** coherencia (contra glosario/decisiones/conocimiento) y crítica de calidad (problemas, faltantes, oportunidades, sobreingeniería).
- **Dos momentos:** durante el diseño de una idea, y después del modo plan sobre un plan ya formado.
- **Actualiza la sabiduría:** cuando se afina un término → glosario; cuando se cristaliza una decisión estructural → decisiones.

## Reemplaza a `grill-with-docs`

Es la versión propia, en español y de propósito general, del flujo de `grill-with-docs` (Matt Pocock): en vez de apuntar a `CONTEXT.md` y `docs/adr/`, apunta al glosario y las decisiones del harness (`.claude/glosario/`, `.claude/decisiones/`). Suma la mirada de crítica de calidad.

## Dependencias

Ninguna dura (degrada si faltan las carpetas). En uso, aprovecha `glosario`, `decisiones` y `conocimiento`.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/planificar/SKILL.md`](skills/planificar/SKILL.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
