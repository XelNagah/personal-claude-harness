# Que las reglas que hoy viven dentro de las habilidades se entreguen en cada turno, con un aviso cuando ese texto pese de más

**Estado: Ejecutado · Cerrado 26-11-17 · Construcción desde 26-11-16 · Creado 26-11-13 · Analizado 26-11-14.** Origen: plan Local-0129 (plan maestro), arreglo 1 del análisis de un mes de conversaciones —el de mayor impacto—. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

## El problema

Una regla escrita en los pasos de una habilidad solo actúa si la habilidad se dispara. Y las habilidades se saltean seguido: en el análisis, 42 % de las veces que correspondía una (68 de 163), y «la habilidad no se disparó» es la causa más frecuente (26 de 59 episodios firmes).

Caso que lo muestra, Impresión 3D, 06/11/2026: «Me comí un blob de la muerte. NO LO VISTE PARA PARARLO??». La regla de lanzar el vigía vivía en la habilidad de calibración, invocada en 3 de 19 sesiones. Cuando la regla pasó a conducta, se cumplió siempre.

Lo que **no** es la causa: el listado de habilidades no recorta las descripciones de las `amp*` (refutado en el mismo análisis).

## Lo que hay que resolver

1. **Inventario.** Qué reglas de «en el momento X, hacé Y» viven hoy dentro de los `SKILL.md` de la Base (y cuáles en los repos desplegados, como ejemplo) que deberían cumplirse aunque la habilidad no se invoque.
2. **Criterio de corte.** Qué regla sube a conducta y cuál se queda en la habilidad. No todo puede subir: cada regla del momento `cada turno` se paga en todos los turnos, y el peso de ese bloque hoy no lo mide nadie (ver «Lo verificado»; decisión #04).
3. **Entrega.** Cada regla elegida como regla de conducta con su momento y su clase (Decisión Local-0021). Las locales, con `registrar-regla`; las de la Base, editando `.claude/conducta/INDICE.md` y copiando con `sincronizar-base --aplicar`.
4. **Medición.** Con la medición final del plan Local-0129 (decisión #05).

**Definido el 14/11/2026:** el alcance de arriba se lee junto con las respuestas a las decisiones #01 a #05, al final de este documento.

## Cruces

- plan Local-0089 (Por qué las preferencias cargadas no se aplican): misma familia, pero sobre preferencias cargadas, no sobre reglas dentro de habilidades.
- plan Local-0105 (Mejoras al harness surgidas del análisis de consumo): su acción C es un caso de este plan (`converger-terminologia` como regla de conducta).
- plan Local-0027 (Banco de pruebas conductual de mecanismos): sirve para verificar.

## Análisis del 14/11/2026

Lo hizo un subagente de solo lectura, coordinado desde el plan Local-0129. Trae evidencia; no decidió nada. Las cinco decisiones abiertas están en la página de decisiones del grupo A (`.claude/tmp/decisiones-grupo-a-2026-11-14.html`, publicada también como página privada para verla en el celular).

### Lo verificado

- **La evidencia de Impresión 3D tiene una forma precisa.** Sus reglas de conducta Local-0001, Local-0002 y Local-0003 (render, Obico, Telegram) son todas del momento `cada turno` y de la clase `Inyectar`, con la condición escrita en el texto («Antes de mandar cualquier impresión…»). No usan un momento propio ni un control.
- **La cita del conocimiento Local-0001 en la sección «El problema» está al revés.** `modos-de-falla-ante-reglas-escritas.md:34` dice que el fallo «recitar sin obedecer» **no** se observó en reglas re-inyectadas en cada turno. Hay que corregirla: el límite real es el peso del bloque que se entrega en cada turno, y eso hoy no lo mide nadie (ni `medir-contexto` ni `lint-conducta`).
- **`registrar-regla` prohíbe escribir `conducta/INDICE.md`** (`registrar-regla/SKILL.md:12`). Las reglas que vayan a la Base se editan a mano en `.claude/conducta/INDICE.md` y se copian con `sincronizar-base --aplicar`. El paso 3 del alcance («con `registrar-regla`») vale solo para las reglas locales.
- **Momentos disponibles:** `al arrancar la sesión`, `cada turno`, `al escribir` y `al cerrar tarea` (`MOMENTOS.md:18-22`). El repartidor traduce solo cuatro eventos (`establecer-conducta.js:103-122`). No hay un momento del tipo «antes de usar la consola». El momento `al leer` se descartó para no cobrar unos 50 ms en la operación más frecuente (`establecer-conducta.js:354`).
- **`probar-disparo-de-skills` no mide este plan:** mide si la primera herramienta es `Skill`, no si la regla se cumplió sin la habilidad.

### Inventario de reglas que hoy viven dentro de habilidades

| Dónde | Regla | ¿Para operar los subsistemas o gusto del autor? |
|---|---|---|
| `registrar-herramienta/SKILL.md:11` | Antes de mover o renombrar, buscar referencias en settings, `.gitignore` y hooks | Operar |
| `converger-terminologia/SKILL.md:3` | Invocarla siempre que se proponga un nombre | Operar (es la acción C del plan Local-0105) |
| `cerrar-plan/SKILL.md:3` | Al detectar que un plan pendiente ya se hizo, cerrarlo | Operar |
| `contrastar/SKILL.md:3` | Contrastar el material que entra desde afuera | Operar, pero es terreno de los planes Local-0128 y Local-0131 |
| `buscar-agentes` y `preguntar` | Consultar al otro repo en vez de pedir copiar y pegar | Operar, pero es del plan Local-0132 |
| `planificar/SKILL.md:25` | Antes de preguntar, fijarse si ya está escrito | Gusto del autor: en este repo es la Preferencia Local-0008 |
| `planificar/SKILL.md:27-34` | Una decisión por vez, con recomendación | Gusto del autor: Preferencia Local-0008 |
| Siete habilidades de alta | El Código es el mayor más uno | Mecánica: corresponde a un control o un lint, no a un texto |
| Altas en general | Dar el alta con su habilidad, no a mano | Es el arreglo 3; ver la decisión abierta 3 |

Las reglas de flujo interno no migran: solo tienen sentido con la habilidad corriendo. Ejemplos: `preguntar:30`, `resolver:54`, `alto-nivel:31`, `explicar-plan:20`, `registrar-decision:15-23`.

Hueco aparte, que no es una regla: no hay habilidad para pasar un plan de `Listo` a `En curso`, y el informe registra que se hace con `sed`.

### Choques

Con el grupo D (plan Local-0111): los dos escriben en `conducta/INDICE.md` y en su copia de `base/`. Se integra uno y se rebasa el otro.

### Decisiones abiertas (fichas #01 a #05 de la página)

1. ¿Las reglas van a la Base, solo a este repo, o se separan según sirvan para operar los subsistemas o sean gustos del autor (Decisión Local-0053)? Recomendada: separar.
2. ¿Se entregan en `cada turno` con la condición en el texto, o con momentos nuevos que detecten la acción? Recomendada: `cada turno`.
3. ¿El control de altas a mano lo programa este grupo o el del plan Local-0111? Recomendada: el del plan Local-0111.
4. ¿Hay tope medido del texto que se entrega en cada turno? Recomendada: medirlo con `medir-contexto` y avisar al pasar el tope.
5. ¿Cómo se mide? Recomendada: la medición final del plan Local-0129, sin esperar al plan Local-0027.

### Respuestas del usuario a la página del grupo A — 14/11/2026

- **#01 = A.** Las reglas se separan según para qué sirven. Las que hacen falta para operar los subsistemas van a la Base. Las que son gustos del autor quedan en el registro de reglas de este repo y se ofrecen aparte (plan Local-0126).
- **#03 = B.** El control de altas hechas a mano, que se dispara al escribir, lo programa el grupo D (plan Local-0111), no este plan.
- **#05 = A.** Se mide con la medición final del plan Local-0129. No se espera al plan Local-0027.
- **#02 y #04 = «Otro», en forma de pregunta.** Siguen abiertas:
  - #02: «¿El problema con A no es que el agente puede ignorarla? Por eso empezamos a usar hooks.» La aclaración pendiente es que las dos opciones se entregan por hook. Ninguna obliga a cumplir; lo que cambia es qué tan cerca de la acción llega el texto.
  - #04: «Tiene que poder obtener todo lo que necesite.» La aclaración pendiente es que el tope mide solo el texto que se entrega solo en cada turno. No limita lo que el agente consulta cuando lo necesita.
- **#02 = A, decidido después de la aclaración.** Las reglas se entregan en cada turno, por el mismo hook que ya existe, con la condición escrita en el texto. Las que la medición final muestre que se siguen ignorando, y que se puedan detectar sin juicio (por ejemplo `git mv`), pasan después a un momento propio o a un control que frene.
- **#04 = A, decidido después de la aclaración.** `medir-contexto` mide el texto que el repartidor entrega solo en el momento `cada turno` y avisa cuando pasa un tope. No bloquea nada. El usuario puso una condición: **el mecanismo tiene que quedar documentado de modo que, cuando el aviso aparezca, se entienda qué está pasando sin reconstruirlo**. Eso obliga a tres cosas al construir:
  1. **El aviso se explica solo.** Dice qué midió (el texto de las reglas del momento `cada turno`, el de la Base y el del repo por separado), cuánto dio, cuál es el tope y qué hacer: pasar a un momento más específico la regla que se pueda detectar sin juicio, o recortar su texto. Ejemplo de forma: «El texto que se entrega en cada turno mide 6,1 KB y el tope es 5 KB (Base 3,8 KB · repo 2,3 KB). No limita lo que el agente consulta: solo lo que recibe sin pedirlo. Para bajarlo, mover a otro momento o acortar una regla».
  2. **La ficha de `medir-contexto` y el `README.md` de conducta explican el mecanismo**: qué cuenta, qué deja afuera (preferencias, Índices y páginas que el agente abre a demanda), por qué existe el tope (cada regla se paga en todos los turnos, y un bloque pesado diluye a las demás) y de dónde salió el número.
  3. **El número del tope queda escrito en un solo lugar**, el código de `medir-contexto`, y la documentación remite a él en vez de copiarlo (conocimiento Base-0001, Evitar el mismo dato escrito en varios lugares).

  Corrección de una aclaración dada en la conversación: se justificó el tope diciendo que una regla en un bloque largo «se recita pero no se obedece». Eso no es lo que dice el conocimiento Local-0001 (ver «Lo verificado»): ese fallo no se observó en reglas re-inyectadas. El motivo del tope es el peso del bloque, que hoy nadie mide.

## Construcción — 16/11/2026

Rama `a-reglas`. Construido según las respuestas del usuario del 14/11/2026.

### Lo hecho

- **Reglas a la Base** (`.claude/conducta/INDICE.md`, momento `cada turno`, clase `Inyectar`, condición escrita en el texto), copiadas a `base/` con `sincronizar-base --aplicar`:
  - regla de conducta Base-0013 (Actualizar las referencias por ruta al mover o renombrar un archivo), que vivía en `registrar-herramienta` y se generalizó a cualquier archivo del repo.
  - regla de conducta Base-0014 (Cerrar el plan que ya se hizo apenas se detecta), que vivía en la descripción de `cerrar-plan`.
  - La de `converger-terminologia` **no** se sumó como fila nueva: se agregó una oración a la regla de conducta Base-0003 (No acuñar terminología del dominio), que ya decía lo mismo sin nombrar la habilidad. Dos reglas sobre el mismo disparo en el mismo bloque habrían pesado más y dicho lo mismo dos veces.
- **Fuera de este plan, como estaba decidido:** contrastar (planes Local-0128 y Local-0131), consultar al otro repo (plan Local-0132), los gustos del autor de `planificar` (plan Local-0126), el Código «mayor más uno» (mecánica, corresponde a un control) y el control de altas a mano (grupo D, plan Local-0111).
- **Medición de `cada turno`** en `medir-contexto`: cuenta las reglas `Inyectar` vigentes del momento, de los dos Índices, como las emite el repartidor; Base y repo por separado; tope sobre el total en la constante `TOPE_CADA_TURNO`, único lugar donde está el número y su origen. Al arrancar se ve en la línea de la regla de conducta Local-0001 (Informar el peso del contexto al arrancar): `cada turno X KB de Y` dentro del tope, y un aviso entero que se explica solo cuando lo pasa. No bloquea. Sin registro de reglas lo dice en vez de informar 0 KB.
- **Documentación del mecanismo:** sección «La segunda medición» en la ficha de `medir-contexto` y sección sobre el tope en `.claude/conducta/README.md` (que viaja: por eso nombra la Herramienta y la constante sin enlazarlas, y no copia el número).
- **Pruebas:** 13 casos nuevos en `medir-contexto/pruebas.js` (32 en total).

### Medido hoy

El bloque de `cada turno` mide 2,0 KB (Base 2,0 · repo 0,0), contra el tope que fija la constante.

### Lo que no se hizo

- Los `SKILL.md` de origen conservan su texto: siguen siendo el flujo de la habilidad cuando corre. Sacarlo cambiaría el contenido de tres plugins y obligaría a subirles la versión, que en esta tanda la sube el coordinador una sola vez.
- La fila de Herramienta Local-0009 (medir-contexto) en `herramientas/INDICE-LOCAL.md` no se tocó (este grupo no escribe en otros Índices): queda propuesta para el coordinador.
- La medición del efecto es la final del plan Local-0129 (decisión #05).

### Cómo verificarlo

```bash
node .claude/herramientas/medir-contexto/medir-contexto.js          # sección «TEXTO QUE SE ENTREGA EN CADA TURNO»
node .claude/herramientas/medir-contexto/medir-contexto.js --hook   # la línea del arranque
node .claude/herramientas/medir-contexto/pruebas.js
echo '{"hook_event_name":"UserPromptSubmit","prompt":"hola"}' | node .claude/conducta/establecer-conducta/establecer-conducta.js
```

## Notas de implementación

Construido el 16/11/2026 e integrado a `main` en los commits `8b89539` (dos reglas que vivían en habilidades pasan a conducta), `3ff357a` (`medir-contexto` mide el texto de cada turno) y `6c8a8c0` (su ficha). Detalle en «Construcción — 16/11/2026».

Frente a lo planificado: el tope de 5 KB para el texto de cada turno mide solo lo que aporta la Base, no lo que suma cada repo. Publicado con `amp` 0.76.0.
