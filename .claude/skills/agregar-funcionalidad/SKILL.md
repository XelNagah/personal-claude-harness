---
name: agregar-funcionalidad
description: Da de alta una funcionalidad/plugin nueva en el harness — carpeta con plugin.json/README/skill, marketplace.json, junctions dobles, fila en REGISTRO.md, orquestador si aplica — y valida. Use when el usuario dice "agregá una funcionalidad", "creá el plugin", "sumá esta pieza al harness".
---

# Agregar una funcionalidad al harness

Alta completa de una funcionalidad nueva (= un plugin del marketplace). El procedimiento canónico vive en `REGISTRO.md` §"Cómo agregar una funcionalidad nueva" — **leerlo antes de arrancar** por si cambió. Esta skill lo ejecuta con juicio en los puntos que lo requieren (nombres, dependencias, si entra al setup base).

## Pasos

1. **Definir con el usuario** (si no está claro): nombre en español del dominio (decisión 0006), qué instala u opera, de qué depende (casi todo depende de `memoria-local`), y **si es de convención** (instala estructura → entra al orquestador) **u operacional** (solo se invoca, como `planificar` → no entra).
2. **Crear `funcionalidades/<nombre>/`:**
   - `.claude-plugin/plugin.json` — `name`, `description`, `version` (arrancar en `0.1.0`), `author`. Descripción en español corriente, sin términos vetados por el glosario.
   - `README.md` — qué hace, qué agrega al repo destino, dependencias.
   - `skills/<nombre-skill>/SKILL.md` — **fuente única** del flujo (estándar Agent Skills, decisión 0010; rutas `.claude/` literales); `PLANTILLA.md` aparte si lleva textos que se copian tal cual.
3. **Sumar el plugin a `.claude-plugin/marketplace.json`**: `name` + `source: "./funcionalidades/<nombre>"` (el `source` debe arrancar con `./`).
4. **Junctions locales** para edición en vivo — dos tandas (`~/.claude/skills` para Claude Code, `~/.agents/skills` para Codex/Cursor/Gemini; decisión 0010). No mezclar con el plugin instalado en la misma máquina:
   ```bash
   node .claude/herramientas/instalar-junctions/instalar-junctions.js
   ```
5. **Registrar en `REGISTRO.md`**: fila en la tabla de funcionalidades + fila en la tabla Plugin/Skill.
6. **Orquestador** (solo si es de convención): sumarla a `setup-completo` — paso en su SKILL + textos duplicados en su `PLANTILLA.md`. Respetar el orden de dependencias.
7. **Verificar**: `node .claude/herramientas/control-cierre/control-cierre.js` — todo verde (incluye `claude plugin validate .` y la coherencia disco↔marketplace↔REGISTRO de lint-harness).
8. **Reportar** en tres grupos (`agregado` / `ya estaba` / `divergente`) si se corrió sobre algo preexistente.

## Ojo

- Nombre de skill ≠ nombre de plugin: la skill suele ser `inicializar-<X>` (convención) o un verbo de uso (operativa, p. ej. `registrar-memoria`).
- Un plugin puede llevar **varias** skills: si la funcionalidad ya existe y solo se agrega una skill operativa, no crear plugin nuevo — sumar `skills/<skill>/` a la existente y subir su `version`.
