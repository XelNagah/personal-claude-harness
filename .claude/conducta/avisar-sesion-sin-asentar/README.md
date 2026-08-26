# avisar-sesion-sin-asentar

Control del momento `al cerrar tarea`: mira la transcripción de la sesión y decide **si el aviso de cierre sale**. No redacta el aviso — el texto es el de la regla `Inyectar` de ese momento, que vive en el registro y el usuario edita sin tocar código. Acá se decide callar o hablar, y se aporta el dato medido. **Nunca frena nada**: es clase `Bloquear` porque esa es la clase del registro que ejecuta un programa y combina su `additionalContext` con las reglas del momento, no porque emita `deny`.

**Por qué decide en vez de solo avisar:** `al cerrar tarea` es el único momento donde **hablar cuesta una vuelta completa del modelo**. No existe dejar una nota y que el turno igual cierre: las dos formas de hablarle al modelo —`decision: block` con `reason` y `hookSpecificOutput.additionalContext`— continúan la conversación (verificado contra la documentación oficial el 22/08/2026). Por eso ahí **callar es el default** y el texto fijo sale solo cuando este control lo habilita. Un aviso incondicional dejaría al agente sin poder cerrar, y Claude Code corta recién a las 8 continuaciones seguidas.

**La señal — avisa solo si se cumplen las tres:**

| | Qué mide | Cómo |
|---|---|---|
| Piso | ¿hubo sesión de verdad? | el tamaño de la transcripción pasó el corte |
| Sin asentar (archivos) | ¿se escribió algún registro? | ninguna escritura cayó en un `.md` de la casa de un subsistema |
| Sin asentar (habilidades) | ¿se invocó alguna alta? | ninguna invocación de `registrar-*`, `converger-terminologia` o `agregar-subsistema` |

**El piso NO cuenta escrituras**, y es a propósito. Contar archivos escritos deja fuera **por construcción** el caso más importante: una conversación larga donde se entendió algo y no se tocó un solo archivo. Ahí no queda nada escrito en ningún lado, que es la definición del problema. Subestima además por otro lado —las ediciones desde la consola no pasan por `Write`/`Edit`— y *«escrituras en `.claude/`»* no viaja: un Agente Desplegado trabaja sobre su Producto. Las escrituras siguen participando, pero **solo del lado de callarse**: escribir un registro es prueba de que ya se asentó.

⚠️ **Un `.js` bajo la casa de un subsistema no cuenta como asentar.** Un lint o un banco de pruebas es maquinaria. Medido: con el criterio grueso, una sesión de 16 escrituras y ningún registro tocado **no** disparaba, que era justo el caso a cazar.

**Cómo mide:** `stat` del `transcript_path` para el piso, y una pasada por el `.jsonl` **parseando cada línea como JSON** para lo demás. No se busca con expresiones regulares sobre el texto crudo: ahí las rutas de Windows vienen doble-escapadas, y un patrón que espere una sola barra invertida no matchea, no falla, cuenta cero y el control contesta en verde. Costo medido sobre doce transcripciones reales de 8 KB a 1,6 MB: **1 a 6 ms**, contra un presupuesto de 100 ms.

**Qué es una casa de subsistema:** un directorio de `.claude/` con su `MANIFIESTO.md`. Se descubre así y no leyendo el catálogo porque lo que importa es la carpeta que existe en disco, no la fila que la declara; y vale igual para las casas que suma el Propósito.

**El corte del piso es PROVISORIO** (`--piso`, default 200000 bytes), a calibrar con el uso — misma situación declarada que `BYTES_POR_TOKEN` en `avisar-contexto-pesado`. Se mide en bytes y no en tokens estimados para no duplicar esa constante en dos archivos que después divergen. El riesgo se acomoda a propósito del lado seguro: un aviso de más cuesta un turno; uno de menos pierde el conocimiento y hay que volver a averiguarlo.

⚠️ **Este repo es el peor banco para calibrar ese corte**: acá escribir el Producto **es** escribir subsistemas, cosa que en un Agente Desplegado cualquiera no pasa.

**Las dos guardas:** avisa **una sola vez por sesión** —marca en `.claude/tmp/avisar-sesion-sin-asentar/<session_id>.txt`, escrita solo al emitir para que el tope cuente avisos y no chequeos— y sale **mudo si `stop_hook_active`** viene en `true`. Esa segunda guarda vive **también** en el repartidor, que es donde protege a todas las reglas del momento; que esté en los dos lados es a propósito. Las marcas de más de 7 días se limpian solas, a mejor esfuerzo.

**En Codex CLI degrada así:** el CLI expone `Stop`, pero parsea varios campos de respuesta sin aplicarlos, de modo que el aviso puede no llegarle al modelo aunque el control corra y consuma su marca de sesión. Se emite igual, con la misma forma que en Claude Code.

**Quién lo invoca:** el hook repartidor `establecer-conducta`, como `Contenido` de la regla correspondiente del registro (`INDICE.md`). No es una Herramienta: es infra del subsistema, co-ubicada por el Patrón.

**Pruebas:** `node .claude/conducta/avisar-sesion-sin-asentar/pruebas.js` — 27 casos sobre un repo fabricado: el piso, cada forma de asentar (tool, consola, parche, habilidad), lo que **no** cuenta (un `.js`, un borrador de `tmp/`, leer un registro), las rutas de Windows, las dos guardas y que ninguna entrada rompa el turno.
