**Estado: Nuevo · Creado 26-09-25.**

## Contexto

Surge de una revisión del harness del 22 al 25/09/2026. Se encontraron dos filas de `herramientas/INDICE-LOCAL.md` que tenían una descripción en la columna Tipo, y `lint-herramientas` daba verde. Se arregló en `180fe11`: se agregó `PERMITIDOS` en `lint-herramientas.js`, con dos casos en su `pruebas.js`. Un relevamiento posterior encontró el mismo problema en otros lints. Las filas desordenadas que encontró ya se reordenaron en `60713c1`, pero ningún control impide que vuelva a pasar.

Es la forma «solo revisa lo que ya conoce» del conocimiento Local-0013 (Controles que dejan de controlar sin avisar).

## Frentes

1. **[Hecho 28/09/2026] Orden ascendente por Código en todos los Índices.** Quedó en `common/indices.js` (control [e]) con tres casos en `common/pruebas.js`. `lint-planes` dejó su copia para que la fila no salga dos veces; su caso de prueba ahora espera el hallazgo en INDICES DECLARADOS. El control nuevo no marca huecos ni códigos repetidos. Planteo original: Hoy solo lo controla `lint-planes.js` (líneas ~240-243). Conocimiento, herramientas y decisiones tenían filas fuera de orden y daban verde. La propuesta es controlarlo una sola vez en `common/indices.js`, que ya usan los nueve lints de subsistema, en lugar de copiar el bloque en cada uno. Hay que decidir si `lint-planes` deja su copia.
2. **`lint-decisiones` valida Estado.** Solo acepta `vigente` o `reemplazada por NNNN`. Hoy solo verifica que el reemplazo apunte a una decisión que existe (líneas ~122-129). Los valores actuales están bien: 75 `vigente` y 4 `reemplazada por …`. Se puede sumar la Fecha con formato `AAAA-MM-DD`.
3. **`lint-semantica` valida la columna Control de `TERMINOLOGIA-FARLOPA.md`.** Solo acepta `avisa` o `bloquea`. Hoy `common/terminos-vetados.js` (líneas ~76 y ~97) lee cualquier otro valor como `avisa` y no avisa nada, así que un `bloquea` mal escrito debilita el control de escritura sin ninguna señal. Los valores actuales están bien: 31 `avisa` y 20 `bloquea`.
4. **Esfuerzo mediano: avisar cuándo revisar el conocimiento que caduca.** Las páginas de conocimiento Local-0004 (`hooks-codex-cli.md`) y Local-0006 (`proyectos-similares-al-harness.md`) dicen «Caduca» solo en el texto. `invocar-otro-agente-sin-nadie-del-otro-lado.md` depende de una fecha y no está marcada. La propuesta es agregar un campo `revisar:` con una fecha en el frontmatter y que `lint-conocimiento` avise cuando venza. Existe un `.claude/tmp/simular-caducidad.js` que no se revisó: mirarlo primero, porque puede ser trabajo ya empezado.

## Cómo se hace cada frente

Seguir el modelo de `180fe11`:
- Agregar el control al lint.
- Agregar un caso malo en su `pruebas.js`. El banco fabrica sus datos y no copia el repo.
- Correr `node .claude/herramientas/sincronizar-base/sincronizar-base.js --aplicar`.
- Subir la versión del plugin, porque la pide `lint-harness`.
- Cerrar con `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js`.

Los frentes 1 a 3 son chicos y pueden ir en un commit cada uno.

## Relación con otros planes

- **Plan Local-0096** (Controlar que cada columna de una Entrada de Índice contenga lo que corresponde). Trata el contenido semántico de las columnas, que requiere juicio. Este plan trata los valores cerrados y el orden, que son mecánicos. Se complementan y no se superponen.
- **Plan Local-0031** (Lint unificado parametrizable por capacidad de subsistema). El frente 1 va en esa dirección, pero no depende de ese plan.
