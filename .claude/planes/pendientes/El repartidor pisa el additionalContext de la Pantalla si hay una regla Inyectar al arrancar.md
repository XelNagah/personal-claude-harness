**Estado: Nuevo · Creado 26-08-07.**

# El repartidor pisa el additionalContext de la Pantalla si se agrega una regla Inyectar al arrancar la sesión

## Problema (verificado contra el código)

El repartidor `establecer-conducta.js` combina las tres clases de un mismo momento en una sola respuesta. En el momento `al arrancar la sesión` corre la clase `Ejecutar` (hoy: la Pantalla de bienvenida), cuya salida trae `systemMessage` (la caja, al usuario) y —desde Local-0098— `hookSpecificOutput.additionalContext` (el estado, al modelo).

Ese `additionalContext` de la Pantalla sobrevive **solo porque hoy no hay ninguna regla `Inyectar` en el momento `al arrancar la sesión`**. La secuencia frágil (líneas ~416-423):

1. Línea 416: `salida = Object.assign({}, corrida.extra)` → `salida.hookSpecificOutput` queda con lo que emitió la Pantalla (`hookEventName: 'SessionStart'`, `additionalContext: <estado>`). Correcto.
2. Línea 401-402: `ctx = construir(momento)` arma el texto de las reglas `Inyectar` del momento. Hoy vacío al arrancar.
3. Línea 422: `if (contexto) salida.hookSpecificOutput = { hookEventName: ev, additionalContext: contexto }`.

Si algún día se agrega una regla `Inyectar` al arranque, `ctx` deja de estar vacío y la línea 422 **pisa** `salida.hookSpecificOutput` entero: se pierde el estado que la Pantalla mandó al modelo (la razón de ser de Local-0098) **y** se emite `hookEventName: ev`, que en el arranque vale `'UserPromptSubmit'` (línea 380 nunca produce `'SessionStart'`) — evento equivocado para un `SessionStart`.

O sea: `Ejecutar` e `Inyectar` en el mismo momento **no** combinan sus `additionalContext`; uno pisa al otro. El comentario de las líneas 392-397 dice que las clases "se combinan por campos distintos", pero `Ejecutar` (vía `corrida.extra`) e `Inyectar` (vía `ctx`) escriben **el mismo** campo `additionalContext`, y ahí no hay combinación: uno pisa al otro.

## Por qué importa

- Rompe Local-0098 en silencio: el síntoma sería que el agente vuelve a desconocer el estado de la Pantalla, sin ninguna señal de por qué.
- Es exactamente el modo de falla que el propio repartidor documenta como cosa a evitar (líneas 323-326: "dos objetos pegados … NO SE VE NADA, sin ninguna señal"). Acá no se pegan, se pisan, pero el resultado —pérdida silenciosa— es el mismo.

## Trabajo previsible si se retoma

- **Fusionar, no pisar:** cuando `corrida.extra.hookSpecificOutput.additionalContext` y `ctx` conviven, concatenarlos en un solo `additionalContext` en vez de que la línea 422 reemplace.
- **`hookEventName` correcto:** que en el momento `al arrancar la sesión` el evento sea `'SessionStart'`, no `'UserPromptSubmit'`. Hoy `ev` solo distingue `PreToolUse` de todo lo demás.
- **Prueba de regresión:** agregar al banco de `establecer-conducta` un caso con una regla `Ejecutar` (que emite `additionalContext`) y una `Inyectar` en el mismo momento, y verificar que **ambos** textos llegan y el `hookEventName` es el del evento real.
- Es Componente de Subsistema que **viaja**: al tocarlo, sincronizar `base/`, subir la versión de `amp` y correr `lint-harness` + las pruebas del script.

## Alcance / decisiones a resolver al ejecutar

- Confirmar si hay otros momentos donde `Ejecutar` e `Inyectar` puedan coincidir hoy (más allá del arranque) y si el arreglo los cubre a todos de una.
