# avisar-contexto-pesado

Control del momento `cada turno`: mide el contexto de la sesión que informa la propia API y, pasado un umbral, emite un aviso al modelo proponiendo un punto de corte — persistir lo pendiente, handoff si hace falta y `/clear`, con la terminal siempre abierta y en escucha. **Nunca frena nada**: es clase `Controlar`: la clase del registro que corre un Control y usa lo que devuelve, combinando su `additionalContext` con las reglas del momento, no porque emita `deny`.

**Por qué existe:** el problema medido nunca fue la sesión abierta sino la sesión abierta con contexto gordo — cada turno re-lee el contexto entero, y volver de una pausa larga lo re-escribe. El aviso recuerda la disciplina de higiene de sesión en el momento en que hace falta, en vez de depender de que el usuario se acuerde.

**Cómo mide:** lee el final del `transcript_path` que trae el JSON del hook (los últimos 512 KB, en `LECTURA_COLA`) y toma la última línea `type: "assistant"` con `message.usage`. El contexto es `input_tokens + cache_read_input_tokens + cache_creation_input_tokens`: lo que leyó el modelo en ese turno. Las líneas de subagentes (`isSidechain`) no cuentan.

**Por qué no el tamaño del archivo:** la transcripción guarda mucho más que lo que lee el modelo —registros de las llamadas a la API y los avisos de los hooks repetidos en cada turno—. Medido en una sesión de otro repo: 2.048.112 bytes daban ~512 mil tokens por bytes ÷ 4, contra 144.118 reales; una sesión de este repo con 4 turnos estimaba 194 mil contra 91 mil. Exageraba unas 3,5 veces y avisaba en sesiones recién arrancadas. Bytes ÷ 4 queda **solo de respaldo**, cuando el final del archivo no trae ningún `usage`; el aviso lo dice («estimados por el tamaño del archivo»).

**Cuándo avisa:** al cruzar el umbral (`--umbral`, default 180000 tokens de contexto). Es un total, no un crecimiento: en las 12 sesiones del repo del Agente Multipropósito medidas el 24/10/2026, el arranque ocupaba entre 82 y 95 mil tokens y la mayor llegó a 163 mil. El aviso salta tras unos 85 a 100 mil de trabajo: queda para sesiones muy largas. Se repite cada escalón (`--paso`, default 50000), no en cada turno. La marca de "ya avisé" vive en `.claude/tmp/avisar-contexto-pesado/<session_id>.txt` — **no** en `.claude/tmp/avisos/`, que es el Buzón de Avisos Generales y el repartidor lo vacía. Las marcas de sesiones de más de 7 días se limpian solas, a mejor esfuerzo.

**Umbral por repo:** en esta versión el umbral viaja en el flag del `Contenido` de la fila del registro, que es del Agente Multipropósito — un repo no puede cambiarlo sin que el actualizador se lo lleve en la corrida siguiente. Limitación conocida de la primera versión.

**Quién lo invoca:** el hook repartidor `establecer-conducta`, como `Contenido` de la regla correspondiente del registro (`INDICE.md`). No es una Herramienta: es infra del subsistema, co-ubicada por el Patrón.

**Pruebas:** `node .claude/conducta/avisar-contexto-pesado/pruebas.js` — verifica que el aviso aparece pasado el umbral **y no antes**, que con `usage` manda la medida de la API aunque el archivo pese diez veces el umbral, que cuenta el último `usage` y no el de un subagente, que sin `usage` queda el respaldo y lo dice, que la marca calla el escalón ya avisado, que el escalón siguiente re-avisa y que nunca emite `deny`.
