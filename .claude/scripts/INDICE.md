# Scripts del proyecto

Registro de las herramientas del repo. Cada script vive en su carpeta `<tool>/` con un `README.md` (su ficha); nunca suelto. Una fila por tool. Ordena el "cementerio de scripts": qué es cada uno, cómo se corre, si sigue vigente.

- **Tool** — link a la carpeta `<tool>/` (adentro, el README y el código).
- **Qué hace** — una línea.
- **Cómo se corre** — el comando de invocación.
- **Estado** — `vigente`, `experimental` u `obsoleto` (los obsoletos se pueden depurar).

| Tool | Qué hace | Cómo se corre | Estado |
|------|----------|---------------|--------|
| [lint-conocimiento](lint-conocimiento/) | Lint de la base de conocimiento: refs rotas, índice incompleto, huérfanos | `node .claude/scripts/lint-conocimiento/lint-conocimiento.js` | vigente |
| [lint-glosario](lint-glosario/) | Lint del glosario: links de detalle, páginas huérfanas, colisión de alias | `node .claude/scripts/lint-glosario/lint-glosario.js` | vigente |
| [lint-decisiones](lint-decisiones/) | Lint de decisiones: numeración, links de detalle, huérfanos, superseded | `node .claude/scripts/lint-decisiones/lint-decisiones.js` | vigente |
| [lint-scripts](lint-scripts/) | Lint de este registro: README por tool, tool en índice, filas colgadas, refs por ruta | `node .claude/scripts/lint-scripts/lint-scripts.js` | vigente |
