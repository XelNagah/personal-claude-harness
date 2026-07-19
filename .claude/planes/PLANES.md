# Registro de planes

Lo fino de cada plan vive acá, no en el nombre del archivo. Las carpetas dan el ciclo grueso: `pendientes/` (planes vivos: `Nuevo`, `En curso`, `Diferido`), `ejecutados/`, `descartados/` (con motivo).

Los **estados** y su semántica (a qué carpeta mapea cada uno, cuáles son terminales) están definidos en [`ESTADOS.md`](ESTADOS.md) — fuente de verdad configurable, que el lint lee.

- **Plan** — link al archivo en su carpeta actual.
- **Estado** — uno de los definidos en `ESTADOS.md`: `Nuevo`, `En curso`, `Diferido` (vivos, en `pendientes/`), `Ejecutado`, `Descartado` (terminales).
- **Creado / Cerrado** — `AA-MM-DD`; Cerrado en `—` mientras esté vivo.
- **Origen** — plan del que se desprendió, si aplica.
- **Notas** — corto; en descartados, el motivo es obligatorio.

| Plan | Estado | Creado | Cerrado | Origen | Notas |
|------|--------|--------|---------|--------|-------|
| [Completar cobertura de lint mecanico - memoria y preferencias.md](ejecutados/Completar cobertura de lint mecanico - memoria y preferencias.md) | Ejecutado | 26-07-18 | 26-07-18 | Rework README | commits 9e3a4ac + 4ff41ee; lint-memoria + lint-preferencias en repo y harness |
| [Rework README raiz + patron carpeta-indice-lint + audit sub-README.md](ejecutados/Rework README raiz + patron carpeta-indice-lint + audit sub-README.md) | Ejecutado | 26-07-18 | 26-07-18 | — | README multipropósito + 2 diagramas + armonización CLAUDE.md/REGISTRO + 6 sub-README; decisión 0004 ampliada; 2 planes diferidos |
| [Propagar gobernanza de terminologia al harness.md](ejecutados/Propagar gobernanza de terminologia al harness.md) | Ejecutado | 26-07-18 | 26-07-18 | Rework README | commit 4ff41ee; decisión 0004 a preferencias-trabajo + glosario + orquestador |
| [26-07-18 - Stack coherencia glosario decisiones scripts y analisis.md](ejecutados/26-07-18 - Stack coherencia glosario decisiones scripts y analisis.md) | Ejecutado | 26-07-18 | 26-07-18 | — | commits 7db0666 + aebfb9c |
| [Rediseno de estados de planes + renombre memoria local.md](ejecutados/Rediseno de estados de planes + renombre memoria local.md) | Ejecutado | 26-07-18 | 26-07-18 | — | máquina de un eje + ESTADOS.md configurable; renombre memory→memoria; propagación al harness (2 subagentes, byte-exactness verificada); decisiones 0005/0006 |
| [Capa semantica de coherencia - contradicciones e incompatibilidades.md](pendientes/Capa semantica de coherencia - contradicciones e incompatibilidades.md) | Diferido | 26-07-18 | — | Rework README | capa semántica transversal; analizar dentro del patrón general |
| [Habilidad para poblar subsistemas desde un repo existente.md](pendientes/Habilidad para poblar subsistemas desde un repo existente.md) | Diferido | 26-07-18 | — | Rework README | barrido activo de un repo poblado → siembra los subsistemas |
| [Migrar prompt del orquestador al modelo PREFERENCIAS versionado.md](pendientes/Migrar prompt del orquestador al modelo PREFERENCIAS versionado.md) | Diferido | 26-07-18 | — | Completar cobertura de lint mecánico | prompt.md del orquestador usa preferencias inline v0; migrar a PREFERENCIAS.md |
| [Propagar guardarrail de terminologia corriente al harness.md](pendientes/Propagar guardarrail de terminologia corriente al harness.md) | Diferido | 26-07-18 | — | Rework README | ampliar Base v1→v2 + preferencias-trabajo + orquestador; decisión 0004 ampliada y ratificada |
| [Actualizar README de setup-completo - stale 4 vs 8.md](ejecutados/Actualizar README de setup-completo - stale 4 vs 8.md) | Ejecutado | 26-07-18 | 26-07-19 | Rework README | skill = fuente de verdad (instala 8); README reescrito a 8 + esquema nuevo de planes + mapa completo; lint-harness verde |
| [Migrar repos consumidores a estados nuevos.md](pendientes/Migrar repos consumidores a estados nuevos.md) | Diferido | 26-07-18 | — | Rediseño de estados de planes | barrer PLANES.md de repos que instalaron el harness con foco/estacionado |
