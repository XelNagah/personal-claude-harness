# Control de desfase entre el harness en disco y el plugin cargado

**Estado: Ejecutado · Creado 26-07-25 · Cerrado 26-07-26.** Origen: [Modelo de distribución y empaquetado del harness](Modelo%20de%20distribucion%20y%20empaquetado%20del%20harness.md), sección "Abierto" — heredado como *"refresco de autoría, hueco de 0013"* y **acotado el mismo día**: la parte de "qué modo usar" no estaba abierta, ya la fijaron 0010, 0013 y 0029. Lo que queda es que el desfase **avise**.

## Lo que NO está en discusión

La distribución del harness está decidida y este plan no la reabre: **marketplace**, un plugin por subsistema, **alcance de proyecto** (0010, 0013, 0029). La máquina que autora consume igual que cualquier consumidor.

De esa decisión se sigue un costo que se acepta, no un problema a resolver: el marketplace `xelnagah-harness` es de tipo `github`, así que los plugins se sirven de un clon del repo remoto y **un cambio no corre hasta publicarlo**. El ciclo completo es editar → subir versión → commit → push → `plugin update` → reiniciar.

## El problema

**Nada compara la versión que corre contra la que está en disco**, así que el harness puede quedar atrás sin que nadie se entere.

> **Corregido 25/07/2026, probándolo en vivo.** El diagnóstico de más abajo —"los plugins no se actualizan solos"— resultó **falso**: sí se traen solos en segundo plano. Lo que no pasa es que la **sesión viva** tome la versión nueva; carga sus plugins al arrancar y se queda con esos. Evidencia: publicada la 0.6.5, el registro pasó a 0.6.5 a las 00:12 sin que nadie corriera nada, y la sesión —arrancada 19:34— siguió ejecutando la 0.6.3, cargando la skill desde la carpeta vieja de la caché. O sea que son **dos desfases**: *falta traer* (se arregla actualizando) y *traído pero no cargado* (se arregla reiniciando). El segundo es el silencioso, porque `claude plugin list` muestra la versión nueva.
>
> La Herramienta `actualizar-plugins` ya cubre los dos: deduce lo cargado comparando el `lastUpdated` de cada plugin contra la hora de arranque del proceso de la sesión, y marca `[SIN CARGAR]` lo que llegó después. Lo que sigue abierto es el resto de esta página.

> **Ampliado 25/07/2026: son tres, no dos.** Publicada la 0.6.6, la Herramienta informó `TODO AL DIA` sobre un **marketplace bajado** viejo: se había bajado **doce minutos antes** del push, y lo *disponible* sale de ahí. O sea que lo instalado coincidía con lo bajado, y lo bajado no tenía la versión nueva. El desfase que faltaba es **publicado ↔ bajado**, y es el más engañoso de los tres porque *contamina la comparación de los otros dos*: con lo bajado atrasado, la respuesta es tranquilizadora y falsa.
>
> **Y un cuarto, que este plan no cubría: el registro de instalación es por repo.** `installed_plugins.json` guarda una entrada por `projectPath`, así que dos Agentes con Propósito de la misma máquina pueden correr versiones distintas del mismo plugin. La Herramienta, al apuntarla a otro repo, caía en la entrada de cualquiera y **daba por instalado allá lo que estaba instalado acá**. Corregido: sin entrada propia (ni de alcance usuario) informa `NO INSTALADO`. Caso que lo destapó: el Coordinador declara los 7 plugins nuevos y solo tiene instalado `amp-memoria` — una migración que quedó por la mitad, que el diagnóstico viejo informaba como sana.
>
> Cubierto el mismo día: la Herramienta pregunta al remoto el commit publicado con `git ls-remote` (~0,6 s, no trae ni escribe nada) y, sin salida a red, estima comparando contra el repo que publica el marketplace cuando ese repo es desde donde se la corre — el caso del autor recién publicado. El estado que informa es la **acción**, no el diagnóstico: `AL DIA` solo cuando lo verificó, y `ACTUALIZAR` tanto si está atrasado como si no pudo verificarlo (los dos se resuelven igual, y refrescar de más sale casi nada). En ningún caso dice `TODO AL DIA` sobre un catálogo que no pudo verificar.

Pasó, y en silencio: el 25/07/2026 el plugin `amp` corría **0.6.2** con **0.6.3** en disco, clavado seis commits atrás. La 0.6.3 traía la preferencia Base nueva (pedir una decisión por vez): la regla estaba escrita en el repo y **ausente de la skill que se ejecutaba**. Si en ese lapso alguien hubiera corrido `amp:inicializar` desde esta máquina, habría sembrado las preferencias Base viejas en un repo nuevo. Se descubrió de casualidad, mirando otra cosa.

El dato para detectarlo está a la vista y no hace falta adivinarlo: la versión que corre es el **nombre de la carpeta** en `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`, y la de disco es el campo `version` del `plugin.json`. Compararlas es una resta.

## Qué falta

- **El control.** Su casa natural es `lint-harness`, que ya compara disco ↔ `marketplace.json` ↔ `REGISTRO.md`; le faltaría el cuarto vértice, lo que está realmente cargado. Salida esperada: `amp: disco 0.6.3, cargado 0.6.2`.
- **Que sepa cuándo aplica.** En una máquina que consume por enlace (Codex, Cursor, Gemini, o Claude Code durante una prueba) no hay caché que comparar y el chequeo no significa nada. El control tiene que distinguir el modo en el que está la máquina.
- **Qué se hace con el hallazgo de los 22 enlaces faltantes.** Es el mismo dato que falta, por el otro lado: `lint-harness` reporta que faltan los enlaces en una máquina que **deliberadamente** consume por plugin. Un hallazgo permanente que siempre se ignora entrena a ignorar el lint entero. O el chequeo aprende el modo, o deja de ser hallazgo cuando el modo es plugin.

## Notas de lo verificado (25/07/2026)

- `/reload-plugins` **no** trae versión nueva: recarga los plugins ya instalados en la versión que ya tenían. Sirve después de actualizar, no en lugar de actualizar.
- `claude plugin update` exige identificador completo **y** alcance: `claude plugin update amp@xelnagah-harness --scope project`. Con el nombre pelado falla, y con el alcance por omisión (usuario) también, con el **mismo** mensaje —*Plugin "amp" not found*— que no distingue cuál de los dos falta. Documentado en `docs/INSTALAR.md`, fase 1.
- **`skills-dir` existe pero no se persigue.** `claude plugin init` crea plugins en `~/.claude/skills/<nombre>/` que se auto-cargan como `<nombre>@skills-dir`. Daría edición en vivo conservando el prefijo, pero es un modo de consumo distinto del decidido; se anota para no re-descubrirlo, no como camino a tomar.

## Notas de implementación

**Ejecutado 26/07/2026** (commit `8e5914a`). Los tres puntos de "Qué falta" quedaron cubiertos en una sola pasada sobre `lint-harness`, porque son el mismo dato visto por dos lados: **el modo de consumo de la máquina**.

- **El modo se detecta, no se configura.** El lint cruza dos fuentes: los enlaces de las dos tandas que apunten a este repo, y el registro `installed_plugins.json` filtrado por el marketplace de este repo y por este `projectPath`. De ahí salen cuatro modos —`enlace`, `plugin`, `mixto`, `sin consumo`— y el modo se imprime en la cabecera junto con los hallazgos.
- **Cada modo chequea lo suyo.** En `enlace`, que estén los enlaces y apunten acá. En `plugin`, que la versión de cada `plugin.json` coincida con la instalada. En `mixto`, las dos cosas **más un hallazgo propio**: las dos vías exponen la misma skill con el mismo nombre y no hay ganador definido, el modelo elige.
- **Los 22 enlaces faltantes dejaron de ser hallazgo** en modo `plugin`, que era el punto: un hallazgo permanente que nunca corresponde entrena a ignorar la salida entera del lint.

**Desvío consciente respecto de lo planificado:** el plan pedía comparar contra lo **cargado** (`amp: disco 0.6.3, cargado 0.6.2`) y el lint compara contra lo **instalado**. El motivo: lo cargado —que la sesión arrancó antes de que llegara la versión nueva— ya lo diagnostica la Herramienta `actualizar-plugins`, deduciéndolo contra la hora de arranque del proceso; duplicar esa lógica en el lint era redundante. El reparto quedó: **lint-harness** ve `disco ↔ instalado`, **actualizar-plugins** ve `publicado ↔ bajado ↔ instalado ↔ cargado`. El episodio que originó el plan (disco 0.6.3 corriendo 0.6.2) cae del lado del lint y se detecta.

**Probado en vivo al implementarlo:** con el repo en 0.6.10 y la caché en 0.6.8, el lint pasó de reportar 22 hallazgos falsos a reportar uno solo y verdadero — `amp: disco 0.6.10, instalado 0.6.8`. Se resolvió actualizando, y quedó verde.

**Queda afuera, para otro plan:** el conocimiento del despliegue de plugins se asentó el mismo día en `conocimiento/despliegue-de-plugins-claude-code.md` (las seis paradas, los tres desfases, las mecánicas del CLI que sorprenden), así que las "Notas de lo verificado" de arriba dejaron de ser el único lugar donde vivían.
