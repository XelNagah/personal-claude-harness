# amp-semantica

Mantiene dos registros pares: `GLOSARIO.md` para terminología legítima y `TERMINOLOGIA-FARLOPA.md` para relaciones término→significado vetadas. Incluye README y lint.

## Skill

- `converger-terminologia`: revisa el texto, propone alias o vetos y reescribe desvíos. El agente propone; el usuario ratifica y veta.

## Subagente

- `buscador-de-terminologia`: recorre el alcance indicado y devuelve dónde aparece cada término, con archivo y línea. Es de solo lectura y no juzga significado — `converger-terminologia` delega en él el recorrido para que las decenas de archivos que abre no queden en el contexto del hilo principal.
