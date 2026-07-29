# Semántica — manifiesto de subsistema

El subsistema `semántica` mantiene la coherencia semántica del dominio en el tiempo. Vive en este directorio (`semantica/`) con **dos registros pares**: `GLOSARIO.md` (terminología legítima —concepto → definición, con alias y propuestos—) y `TERMINOLOGIA-FARLOPA.md` (relaciones vetadas, columnas `Término | Significado vetado | Cómo decirlo`). **Lo vetado es la relación término→significado, no el término**: el mismo término con otro significado puede ser legítimo; por eso la columna del medio, y por eso nada vetado se queda en el glosario.

**Disparador:** consultar ambos registros al planificar y analizar; no acuñar términos propios, preferir los del usuario. Proponer una entrada (columna `Propuestos` del glosario) al detectar un término del dominio sin registrar. El agente solo **propone**: ratificar (a alias) y vetar (a Terminología Farlopa) son potestad del usuario.

**Skills:** `converger-terminologia` (recorre el texto del repo contra los dos registros: detecta sinónimos, anglicismos y desvíos, y propone ratificar, vetar o reescribir); instalación con `inicializar-semantica`.

**Índices:** `GLOSARIO.md` (Agente Desplegado) · `TERMINOLOGIA-FARLOPA.md` (Agente Desplegado). **No se cargan siempre** — se consultan a demanda. El **lint marca por término** (lo mecánico); el **agente juzga el significado** al leer la marca. Al cerrar una tarea que tocó semántica, correr el lint desde la raíz del repo:

```bash
node .claude/semantica/lint-semantica/lint-semantica.js
```

Convención completa en `README.md`.
