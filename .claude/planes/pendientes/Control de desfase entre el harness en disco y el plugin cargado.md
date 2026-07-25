# Control de desfase entre el harness en disco y el plugin cargado

**Estado: Nuevo · Creado 26-07-25.** Origen: [Modelo de distribución y empaquetado del harness](../ejecutados/Modelo%20de%20distribucion%20y%20empaquetado%20del%20harness.md), sección "Abierto" — heredado como *"refresco de autoría, hueco de 0013"* y **acotado el mismo día**: la parte de "qué modo usar" no estaba abierta, ya la fijaron 0010, 0013 y 0029. Lo que queda es que el desfase **avise**.

## Lo que NO está en discusión

La distribución del harness está decidida y este plan no la reabre: **marketplace**, un plugin por subsistema, **alcance de proyecto** (0010, 0013, 0029). La máquina que autora consume igual que cualquier consumidor.

De esa decisión se sigue un costo que se acepta, no un problema a resolver: el marketplace `xelnagah-harness` es de tipo `github`, así que los plugins se sirven de un clon del repo remoto y **un cambio no corre hasta publicarlo**. El ciclo completo es editar → subir versión → commit → push → `plugin update` → reiniciar.

## El problema

**Nada compara la versión que corre contra la que está en disco**, así que el harness puede quedar atrás sin que nadie se entere.

Pasó, y en silencio: el 25/07/2026 el plugin `amp` corría **0.6.2** con **0.6.3** en disco, clavado seis commits atrás. La 0.6.3 traía la preferencia Base nueva (pedir una decisión por vez): la regla estaba escrita en el repo y **ausente de la skill que se ejecutaba**. Si en ese lapso alguien hubiera corrido `amp:inicializar` desde esta máquina, habría sembrado las preferencias Base viejas en un repo nuevo. Se descubrió de casualidad, mirando otra cosa.

El dato para detectarlo está a la vista y no hace falta adivinarlo: la versión que corre es el **nombre de la carpeta** en `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`, y la de disco es el campo `version` del `plugin.json`. Compararlas es una resta.

## Qué falta

- **El control.** Su casa natural es `lint-harness`, que ya compara disco ↔ `marketplace.json` ↔ `REGISTRO.md`; le faltaría el cuarto vértice, lo que está realmente cargado. Salida esperada: `amp: disco 0.6.3, cargado 0.6.2`.
- **Que sepa cuándo aplica.** En una máquina que consume por enlace (Codex, Cursor, Gemini, o Claude Code durante una prueba) no hay caché que comparar y el chequeo no significa nada. El control tiene que distinguir el modo en el que está la máquina.
- **Qué se hace con el hallazgo de los 22 enlaces faltantes.** Es el mismo dato que falta, por el otro lado: `lint-harness` reporta que faltan los enlaces en una máquina que **deliberadamente** consume por plugin. Un hallazgo permanente que siempre se ignora entrena a ignorar el lint entero. O el chequeo aprende el modo, o deja de ser hallazgo cuando el modo es plugin.

## Notas de lo verificado (25/07/2026)

- `/reload-plugins` **no** trae versión nueva: recarga los plugins ya instalados en la versión que ya tenían. Sirve después de actualizar, no en lugar de actualizar.
- `claude plugin update` exige identificador completo **y** alcance: `claude plugin update amp@xelnagah-harness --scope project`. Con el nombre pelado falla, y con el alcance por omisión (usuario) también, con el **mismo** mensaje —*Plugin "amp" not found*— que no distingue cuál de los dos falta. Documentado en `docs/INSTALAR.md` §A1.
- **`skills-dir` existe pero no se persigue.** `claude plugin init` crea plugins en `~/.claude/skills/<nombre>/` que se auto-cargan como `<nombre>@skills-dir`. Daría edición en vivo conservando el prefijo, pero es un modo de consumo distinto del decidido; se anota para no re-descubrirlo, no como camino a tomar.
