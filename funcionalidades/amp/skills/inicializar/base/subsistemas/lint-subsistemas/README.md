# lint-subsistemas

Comprueba que el catálogo y las casas instaladas coincidan, que no haya filas duplicadas y que cada subsistema catalogado tenga `MANIFIESTO.md`.

```bash
node .claude/subsistemas/lint-subsistemas/lint-subsistemas.js
```

## Código de salida

- **0** — el lint corrió, tenga o no hallazgos. Los hallazgos son los totales `(N)` de cada sección: así los cuentan la Pantalla de bienvenida y el control de cierre.
- **1 con `--estricto`** — el lint corrió y algún total no es cero. Es para la verificación que solo mira el código de salida.
- **Distinto de 0 sin `--estricto`** — el lint no pudo correr: falta un archivo que necesita o el código se rompió. Con `--estricto`, un 1 puede ser cualquiera de los dos casos; la salida dice cuál.

La ruta y las opciones van en cualquier orden.
