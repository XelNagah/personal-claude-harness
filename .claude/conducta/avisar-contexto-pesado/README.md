# avisar-contexto-pesado

Control del momento `cada turno`: mide la transcripción de la sesión como aproximación del contexto acumulado y, pasado un umbral, emite un aviso al modelo proponiendo un punto de corte — persistir lo pendiente, handoff si hace falta y `/clear`, con la terminal siempre abierta y en escucha. **Nunca frena nada**: es clase `Bloquear` porque esa es la clase del registro que ejecuta un programa y combina su `additionalContext` con las reglas del momento, no porque emita `deny`.

**Por qué existe:** el problema medido nunca fue la sesión abierta sino la sesión abierta con contexto gordo — cada turno re-lee el contexto entero, y volver de una pausa larga lo re-escribe. El aviso empuja la disciplina de higiene de sesión en el momento en que hace falta, en vez de depender de que el usuario se acuerde.

**Cómo mide:** `stat` del `transcript_path` que trae el JSON del hook; tokens estimados = bytes ÷ 4. La constante es **PROVISORIA, a calibrar** contra una sesión medida de verdad: el JSONL tiene sobrecarga de metadatos, así que dividir por 4 sobreestima y avisa temprano — el lado seguro. Vive en `BYTES_POR_TOKEN`.

**Cuándo avisa:** al cruzar el umbral (`--umbral`, default 150000 tokens estimados) y de nuevo cada escalón (`--paso`, default 50000), no en cada turno. La marca de "ya avisé" vive en `.claude/tmp/avisar-contexto-pesado/<session_id>.txt` — **no** en `.claude/tmp/avisos/`, que es el Buzón de Avisos Generales y el repartidor lo vacía. Las marcas de sesiones de más de 7 días se limpian solas, a mejor esfuerzo.

**Umbral por repo:** en esta versión el umbral viaja en el flag del `Contenido` de la fila del registro, que es del Agente Multipropósito — un repo no puede cambiarlo sin que el actualizador se lo lleve en la corrida siguiente. Limitación conocida de la primera versión.

**Quién lo invoca:** el hook repartidor `establecer-conducta`, como `Contenido` de la regla correspondiente del registro (`INDICE.md`). No es una Herramienta: es infra del subsistema, co-ubicada por el Patrón.

**Pruebas:** `node .claude/conducta/avisar-contexto-pesado/pruebas.js` — verifica que el aviso aparece pasado el umbral **y no antes**, que la marca calla el escalón ya avisado, que el escalón siguiente re-avisa y que nunca emite `deny`.
