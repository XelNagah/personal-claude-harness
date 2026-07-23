# Latencia de los hooks de Claude Code

Qué cuesta, en tiempo real, cada mecanismo de hook — y qué se puede y no se puede inyectar sin que el usuario lo sienta. Medido el 2026-07-22 en la PC de casa (Windows 11, sin antivirus corporativo). Origen: el episodio de la oficina donde los hooks por mensaje (caveman + ponytail) tardaban más de 5 segundos.

## Números medidos

Cada valor es el promedio de 3-5 corridas consecutivas (en caliente, con el archivo ya en cache del sistema).

| Mecanismo | Latencia por invocación |
|---|---|
| `node -e ""` (arranque del intérprete, sin hacer nada) | ~50 ms |
| Hook real de caveman (`caveman-mode-tracker.js`: lee stdin, parsea JSON, regexes, lee y escribe el archivo de flag, emite JSON) | ~65-70 ms |
| `cmd /c type archivo.txt` (inyección de texto estático, sin intérprete) | ~30 ms |
| `powershell -NoProfile -Command "Get-Content archivo.txt"` | ~140-165 ms |

**El costo dominante es el arranque del intérprete, no la lógica ni el I/O.** El hook completo de caveman cuesta apenas ~15 ms más que un `node` vacío: leer un archivo chico y correr media docena de regexes es ruido frente a los ~50 ms de levantar Node. De ahí se desprende lo importante: optimizar el cuerpo de un hook no sirve de nada; **elegir con qué se ejecuta sí**. PowerShell cuesta 4-5× lo que `cmd`.

## Semántica que condiciona el diseño

- **`UserPromptSubmit` y `SessionStart` son bloqueantes**: corren en el camino crítico entre que el usuario manda el mensaje y que el modelo arranca. Ahí cada milisegundo se percibe como demora del producto.
- **Los hooks del mismo evento corren en paralelo**: dos hooks en `UserPromptSubmit` no suman sus latencias — manda el más lento. Sacar uno de dos hooks parejos no baja el tiempo a la mitad; lo baja solo si el que se sacó era el peor.
- **`PreToolUse` no se percibe**: se dispara pocas veces por sesión y en un momento en que el usuario ya está esperando al modelo. 65 ms ahí son invisibles.
- **El `timeout` del hook se paga entero si el proceso se cuelga**: se declara en segundos en el `plugin.json` (el plugin caveman usa `"timeout": 5`). Un hook que no termina no falla rápido — bloquea hasta agotar el timeout, en cada mensaje.

## Presupuesto de referencia

Menos de 100 ms por evento bloqueante. Un hook de inyección de reglas entra sobrado, incluso con Node. Lo que no entra es PowerShell en el camino crítico, ni un hook que pueda colgarse con un timeout generoso.

## El episodio de la oficina (2026-07, PC del trabajo)

Los hooks por mensaje tardaban más de 5 segundos. Se sacó ponytail y se dejó caveman para bajarlo a la mitad.

Los números de arriba dicen que **la explicación que se tenía a mano — "cargan un `.js` desde el inicio" — no alcanza**: el mismo hook cuesta ~65 ms en una máquina sana, un factor de ~75×. Además, "más de 5 segundos" coincide con el `timeout: 5` declarado por el plugin, lo que sugiere un hook que se cuelga y paga el timeout completo antes que un hook lento.

Causas probables, sin confirmar (no se corrió el benchmark allá: es una PC de oficina, notoriamente más lenta y con escaneo corporativo, así que sus números no serían representativos de nada):

1. Antivirus/EDR corporativo escaneando `node.exe` y los `.js` del cache de plugins en cada spawn — multiplica el costo de arrancar procesos.
2. Node mal resuelto en esa máquina (shim de nvm-windows, instalación en ruta de red, arranque frío).
3. El hook esperando un stdin que no cierra u otra condición de cuelgue.

Consecuencia práctica: **la poda de hooks fue mitigación del síntoma en una máquina hostil, no una corrección de un costo real del mecanismo**. En una máquina sana, los dos hooks juntos costaban menos de 150 ms por mensaje (y en paralelo, no sumados).

## Cómo elegir el mecanismo

- **Texto siempre igual** (recordatorio de una regla fija): `cmd /c type regla.txt`, ~30 ms, sin intérprete. En `UserPromptSubmit` la salida cruda del comando se inyecta como contexto adicional; no hace falta emitir JSON.
- **Hace falta decidir según el prompt o el estado**: Node, ~65 ms. Es lo que justifica el costo de caveman, que parsea lo que escribió el usuario.
- **Se puede esperar al punto de acción**: `PreToolUse` sobre la herramienta puntual — costo percibido nulo y mucho más quirúrgico que inyectar en cada mensaje.
- **Timeout corto y explícito** (1-2 s): acota el peaje por mensaje si el hook se cuelga en una máquina con escaneo.
