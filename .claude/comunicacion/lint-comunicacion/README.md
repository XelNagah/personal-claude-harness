# lint-comunicacion

Lint del subsistema `comunicacion`: integridad del Índice de Agentes Multipropósito Conocidos (`INDICE.md`). Sin LLM, sin red.

```bash
node .claude/comunicacion/lint-comunicacion/lint-comunicacion.js
```

## Qué chequea

- **Nombres vacíos o duplicados** — el Nombre es la clave con que `consultar-agente` resuelve un agente; vacío o repetido lo vuelve inutilizable.
- **Directorios inválidos** — cada `Directorio` existe y contiene un `.claude/`. Un Agente Multipropósito Conocido es otra instalación del harness, detectable por su `.claude/`; sin él, o la ruta cambió o no es un Agente Multipropósito.
- **CLI no soportado** — el `CLI` es uno de los que el mecanismo sabe invocar en solo lectura (`indice.js` `CLIS_SOPORTADOS`).
- **Forma del Índice** — origen y columnas contra el manifiesto, vía `common/indices.js`. Solo si `INDICE.md` existe.

## El Índice ausente es válido

El Índice es Aprendizaje local: guarda rutas absolutas de máquina y **no se commitea**. En un Agente Desplegado puede no existir, y esa ausencia es un estado válido — no genera hallazgos. En este repo, que publica el mecanismo, existe pero **sin filas**, así que los controles de fila corren sobre cero y dan verde.

## Prueba

El banco `pruebas.js` copia `.claude/` a un repo de prueba, rompe una cosa por vez y verifica que el control se encienda **solo ante su defecto** — un lint que lee mal contesta en verde sobre un conjunto vacío. Cubre además `leerIndice` (`indice.js`) y `construirComando` (el mecanismo de consulta).

```bash
node .claude/comunicacion/lint-comunicacion/pruebas.js
```
