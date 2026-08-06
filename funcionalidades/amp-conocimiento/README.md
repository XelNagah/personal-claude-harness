# amp-conocimiento

Opera la casa única de lo que el agente sabe y necesita reutilizar sobre el proyecto, el dominio o sistemas externos. Mantiene los Índices separados por origen, páginas en texto corriente, README y lint.

## Skills

- `registrar-conocimiento`: asienta un hallazgo sin duplicarlo.
- `buscar-conocimiento`: recorre el repo y propone páginas que todavía no están asentadas.

## Subagente

- `buscador-de-conocimiento`: recorre el repo y devuelve los candidatos a página con su evidencia en archivo y línea. Es de solo lectura y no redacta páginas — `buscar-conocimiento` delega en él el recorrido para que el repo entero que abre no quede en el contexto del hilo principal.

Preferencias, decisiones, planes, términos, Herramientas y reglas conservan sus casas propias.
