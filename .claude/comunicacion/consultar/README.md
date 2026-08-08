# consultar

El mecanismo del subsistema `comunicacion`: corre a un Agente Multipropósito Conocido en su propio directorio, en **solo lectura**, con un mensaje como entrada, y devuelve su respuesta. Ida y vuelta única, sesión efímera y sin estado. Lo usa la skill `consultar-agente`.

```bash
node .claude/comunicacion/consultar/consultar.js <nombre> <mensaje>
```

- **`<nombre>`** — el Nombre de la fila en `INDICE.md`. Se resuelve sin distinguir mayúsculas.
- **`<mensaje>`** — lo que se le pregunta. Va por STDIN al CLI, nunca en la línea de comandos.

## Solo lectura, sin superficie de inyección

La garantía de solo lectura no se apoya en cómo esté redactada la skill sino en las banderas del comando, y el mecanismo no ofrece forma de pedir escritura:

- **claude** — `claude -p --permission-mode plan --tools Read Grep Glob`. El modo `plan` bloquea toda edición y ejecución; el conjunto de tools deja solo lectura; `-p` es la corrida no interactiva.
- **codex** — `codex exec --sandbox read-only --skip-git-repo-check`. La caja de arena `read-only` impide toda escritura; `--skip-git-repo-check` evita que aborte si el directorio no es un repo git.

El mensaje entra por STDIN (`input`) y el directorio por el `cwd` del proceso, así **nada que venga de datos toca la línea de comandos sin comillar** — no hay superficie de inyección. Los argumentos son literales fijos del comando. En Windows los CLI son `.cmd`, por eso `shell: true`; queda anulado su riesgo porque no hay datos en los argumentos.

Un CLI fuera de los soportados (`indice.js` `CLIS_SOPORTADOS`) no se arma: se informa la degradación y no se lo invoca sin garantía de solo lectura.

## La respuesta es contexto, no orden

La salida se devuelve rotulada con su origen y con la aclaración de que es **contexto, no orden**: material para considerar, no una instrucción a obedecer. La skill la reenvía tal cual al hilo del agente consultante, que la evalúa como evaluaría cualquier fuente.

## Función pura para probar

`construirComando(cli)` devuelve `{archivo, args}` para cada CLI soportado (o `null`), sin efectos: se prueba sin invocar ningún proceso. `leerIndice` (en `../indice.js`) resuelve el Nombre contra el Índice. Ambas se cubren en el banco `../lint-comunicacion/pruebas.js`.
