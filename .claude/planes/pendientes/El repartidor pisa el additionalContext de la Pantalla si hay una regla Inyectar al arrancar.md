**Estado: Listo · Creado 26-08-07.**

# El repartidor pisa el additionalContext de la Pantalla si se agrega una regla Inyectar al arrancar la sesión

## Problema (verificado contra el código)

El repartidor `establecer-conducta.js` combina las tres clases de un mismo momento en una sola respuesta. En el momento `al arrancar la sesión` corre la clase `Ejecutar` (hoy: la Pantalla de bienvenida), cuya salida trae `systemMessage` (la caja, al usuario) y —desde el plan Local-0098— `hookSpecificOutput.additionalContext` (el estado, al modelo).

Ese `additionalContext` de la Pantalla sobrevive **solo porque hoy no hay ninguna regla `Inyectar` en el momento `al arrancar la sesión`**. La secuencia frágil (líneas ~416-423):

1. Línea 416: `salida = Object.assign({}, corrida.extra)` → `salida.hookSpecificOutput` queda con lo que emitió la Pantalla (`hookEventName: 'SessionStart'`, `additionalContext: <estado>`). Correcto.
2. Línea 401-402: `ctx = construir(momento)` arma el texto de las reglas `Inyectar` del momento. Hoy vacío al arrancar.
3. Línea 422: `if (contexto) salida.hookSpecificOutput = { hookEventName: ev, additionalContext: contexto }`.

Si algún día se agrega una regla `Inyectar` al arranque, `ctx` deja de estar vacío y la línea 422 **pisa** `salida.hookSpecificOutput` entero: se pierde el estado que la Pantalla mandó al modelo (la razón de ser de Local-0098) **y** se emite `hookEventName: ev`, que en el arranque vale `'UserPromptSubmit'` (línea 380 nunca produce `'SessionStart'`) — evento equivocado para un `SessionStart`.

O sea: `Ejecutar` e `Inyectar` en el mismo momento **no** combinan sus `additionalContext`; uno pisa al otro. El comentario de las líneas 392-397 dice que las clases "se combinan por campos distintos", pero `Ejecutar` (vía `corrida.extra`) e `Inyectar` (vía `ctx`) escriben **el mismo** campo `additionalContext`, y ahí no hay combinación: uno pisa al otro.

## Por qué importa

- Rompe Local-0098 en silencio: el síntoma sería que el agente vuelve a desconocer el estado de la Pantalla, sin ninguna señal de por qué.
- Es exactamente el modo de falla que el propio repartidor documenta como cosa a evitar (líneas 323-326: "dos objetos pegados … NO SE VE NADA, sin ninguna señal"). Acá no se pegan, se pisan, pero el resultado —pérdida silenciosa— es el mismo.

---

## Análisis (10/09/2026)

### El problema sigue vigente, verificado contra el código de hoy

El script creció (pasó de bloques sueltos a incorporar el Contraste automático y el Buzón de Avisos, plan Local-0118 y decisión Local-0051), así que las líneas se corrieron: la secuencia descrita arriba hoy vive en `establecer-conducta.js:660-668`, no en `~416-423`. La lógica es idéntica: `salida = Object.assign({}, corrida.extra || {})` (línea 662) deja el `hookSpecificOutput` de la Pantalla en `salida`; después, si `contexto` (que combina `ctx` + `aviso`) no está vacío, la línea 668 lo **sobreescribe** entero. Y `EVENTOS_DE_SALIDA` (línea 135) sigue siendo `{'PreToolUse', 'UserPromptSubmit', 'Stop'}` — sin `'SessionStart'` — así que `ev` cae al `'UserPromptSubmit'` de respaldo. Las dos partes del diagnóstico del plan se confirman letra por letra.

También se confirmó que la Pantalla (`mostrar-pantalla-bienvenida.js:434`) sigue emitiendo exactamente `salida.hookSpecificOutput = { hookEventName: 'SessionStart', additionalContext: contexto }`, con el `hookEventName` correcto puesto por el propio script — que es justo lo que la línea 668 del repartidor descartaría si algún día se dispara.

### La documentación del propio subsistema ya no es consistente con el código, más allá de este plan

Dos páginas de `conducta` describen la clase `Ejecutar` como si nunca tocara `additionalContext`, y eso dejó de ser cierto desde Local-0098:

- `conducta/CLASES.md`, fila `Ejecutar`, columna "Quién recibe el resultado": **"el usuario, en su terminal; no le llega al agente"**. Falso para la Pantalla desde Local-0098, que manda su estado al modelo.
- `conducta/establecer-conducta/README.md` (líneas ~42-46): la tabla dice que `Ejecutar` entrega "el campo que emita la Herramienta; la Pantalla de bienvenida usa `systemMessage`, el único que escribe en la terminal", y el párrafo siguiente explica que las tres clases conviven "porque escriben en campos distintos" (`Ejecutar`/Buzón → `systemMessage`; `Inyectar`/`Controlar` → `additionalContext`). Esa explicación es la que hoy es falsa: `Ejecutar` (la Pantalla) también escribe `additionalContext`, y la única razón por la que no colisiona con nada es que `al arrancar la sesión` no tiene reglas `Inyectar` — no que los campos sean distintos.

Corregir el código sin corregir estas dos páginas deja la documentación del subsistema contradiciendo lo que el propio repartidor hace, que es el tipo de divergencia que el conocimiento `cambiar-la-forma-de-un-registro` y `controles-que-no-avisan` piden tratar como parte del arreglo, no como prolijidad aparte.

### La pregunta de alcance del plan original, resuelta

El plan original dejaba abierto: *"Confirmar si hay otros momentos donde `Ejecutar` e `Inyectar` puedan coincidir hoy (más allá del arranque) y si el arreglo los cubre a todos de una."* Se puede contestar inspeccionando el registro, sin necesidad del usuario:

- Se relevaron **todas** las filas clase `Ejecutar` de `conducta/INDICE.md` y `conducta/INDICE-LOCAL.md`: hoy son exactamente dos, **Base-0001** (la Pantalla) y **Local-0001** (`medir-contexto`, propia de este repo) — y las **dos** están atadas al momento `al arrancar la sesión`. Ningún otro momento tiene ninguna regla `Ejecutar` hoy.
- De esas dos, solo la Pantalla emite `hookSpecificOutput.additionalContext` (verificado en su código, línea 434); `medir-contexto.js --hook` solo emite `{ systemMessage }` (línea 143), así que no puede colisionar con nada.
- Conclusión: **hoy la colisión solo es posible en `al arrancar la sesión`**, porque es el único momento con una regla `Ejecutar` que también escribe `additionalContext`. No hace falta revisar ningún otro momento para este arreglo.
- Esto no vuelve al arreglo específico de ese momento: la corrección propuesta abajo (fusionar en vez de pisar) es genérica — cubre a cualquier otro momento que en el futuro sume una regla `Ejecutar` cuyo script también escriba `additionalContext` conviviendo con una `Inyectar` o una `Controlar`, sin que haga falta volver a auditar la lista.

### El trabajo

1. **Fusionar, no pisar.** En el bloque final del repartidor (hoy `establecer-conducta.js:660-668`), antes de reemplazar `salida.hookSpecificOutput`, conservar el `additionalContext` que ya haya puesto `corrida.extra` (el que trajo una regla `Ejecutar`, si lo trajo) y concatenarlo con `contexto` (lo que ya arma `ctx` + `aviso`). Orden recomendado: primero lo que vino de `Ejecutar` —el estado, que ya es lo primero que se calcula en el pipeline actual— y después lo del momento (`Inyectar` + `Controlar` + Contraste automático + Buzón), separado por un salto de línea en blanco. Es la misma convención que ya usa el script para encadenar `ctx`, `medido.contexto`, `contraste` y `aviso` entre sí (líneas 646-666): un texto se agrega al que ya hay, nunca lo reemplaza.
2. **`hookEventName` correcto.** Sumar `'SessionStart'` a `EVENTOS_DE_SALIDA` (línea 135, hoy `{'PreToolUse', 'UserPromptSubmit', 'Stop'}`), para que `ev` valga `'SessionStart'` en ese momento en vez de caer al `'UserPromptSubmit'` de respaldo.
3. **Corregir la documentación del subsistema que este bug deja desactualizada** (punto nuevo de este análisis, no estaba en la redacción original del plan):
   - `conducta/CLASES.md`: la fila `Ejecutar` deja de decir que su resultado nunca le llega al agente.
   - `conducta/establecer-conducta/README.md`: la tabla y el párrafo de "campos distintos" pasan a explicar que la convivencia sin colisión depende de que ningún otro emisor del mismo momento escriba en el mismo campo — hoy cierto porque no hay `Inyectar` en `al arrancar la sesión`, no porque `Ejecutar` esté atado a `systemMessage` por diseño — y a documentar que desde este arreglo el repartidor fusiona en vez de pisar.
4. **Prueba de regresión** en `establecer-conducta/pruebas.js`. El banco ya tiene el molde: la fila sintética `Local-0001 | Dejar una nota al arrancar` (líneas 90-96) agrega una segunda regla `Ejecutar` al momento `al arrancar la sesión` para probar la fusión de `systemMessage`. Falta el caso equivalente para `additionalContext`: sumar una fila sintética **`Inyectar`** en ese mismo momento y, al disparar `SessionStart`, verificar que **los dos textos llegan** —el estado de la Pantalla (Local-0098) y el de la regla `Inyectar` nueva— y que `hookSpecificOutput.hookEventName` vale `'SessionStart'`. Para lo segundo, el helper `disparar()` (línea ~128) hoy solo expone `contexto`/`decision`/`mensaje`: hay que sumarle `hookEventName: h.hookEventName || ''` a lo que devuelve.
5. **Es Componente de Subsistema que viaja.** Los tres archivos tocados (`establecer-conducta.js`, `CLASES.md`, `establecer-conducta/README.md`) están en `.claude/conducta/`, origen Agente Multipropósito: al tocarlos, correr `node .claude/herramientas/sincronizar-base/sincronizar-base.js --aplicar`, subir la versión de `amp` en su `plugin.json`, y correr `lint-harness` + las pruebas del script (`node .claude/conducta/establecer-conducta/pruebas.js`).

### Verificación

- El banco de `establecer-conducta` en verde, con el caso nuevo del punto 4 incluido.
- El caso concreto del bug: fabricar una regla `Inyectar` sintética en `al arrancar la sesión`, disparar `SessionStart` y comprobar que el `additionalContext` trae el estado de la Pantalla completo (no solo el texto de la regla `Inyectar`) y que `hookEventName` es `'SessionStart'`. Hoy ese caso da mal (lo pisa); es el que demuestra el arreglo.
- `node .claude/herramientas/lint-harness/lint-harness.js` en verde después de sincronizar `base/`.
- `node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js --estricto` en verde.

---

## Propuestas para asentar

Corresponde solo si se ejecuta este plan.

### Página de conocimiento — a `.claude/conocimiento/INDICE.md` (Agente Multipropósito, `Base-NNNN`)

Va al Índice del Agente Multipropósito y no al local: el mecanismo que falla (`establecer-conducta.js`) es Base y el riesgo alcanza a cualquier Agente Desplegado que sume una regla `Inyectar` al momento `al arrancar la sesión`, no solo a este repo.

- **Nombre:** `Dos clases de conducta que escriben el mismo campo del hook, si conviven en un momento, una pisa a la otra`
- **Descripción:** `El repartidor combina las clases de un mismo momento asumiendo que cada una escribe un campo distinto del JSON de salida (Ejecutar → systemMessage, Inyectar/Controlar → additionalContext). Cuando una regla Ejecutar también escribe additionalContext —como la Pantalla de bienvenida desde el plan Local-0098—, esa premisa deja de valer sin que nada lo señale: el bug quedó latente meses porque el momento afectado no tenía todavía ninguna regla Inyectar que lo disparara. El síntoma, de ocurrir, es indistinguible de un olvido: el agente deja de ver un dato que antes tenía, sin ningún error.`
- **Detalle:** `dos-clases-que-escriben-el-mismo-campo.md`
