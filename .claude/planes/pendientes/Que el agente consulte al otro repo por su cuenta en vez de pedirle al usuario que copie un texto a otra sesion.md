# Que el agente consulte al otro repo por su cuenta en vez de pedirle al usuario que copie un texto a otra sesión

**Estado: En curso · Construcción desde 26-11-16 · Creado 26-11-13 · Analizado 26-11-14 · Decidido 26-11-15.** Origen: plan Local-0129 (plan maestro), arreglo 4 del análisis de un mes de conversaciones. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

## El problema

Caso, repo del Agente Multipropósito, 13/11/2026: el agente tenía `amp-comunicacion:preguntar` y le pidió al usuario que abriera una sesión en otro repo y pegara un texto. El usuario: «¿Por qué no usas la herramienta de comunicación y le preguntás directamente? … Para eso tenemos el AMP». Además, el Índice de Agentes Multipropósito Conocidos estaba vacío; una vez señalado, registrar al otro repo y consultarlo llevó un minuto.

Por qué pasa (inferencia del análisis, sin medir):
- La `description` de `preguntar` se dispara por frases del usuario («preguntale al otro agente»), no por lo que el agente está por hacer.
- `buscar-agentes` contempla el Índice vacío, pero solo si antes apareció la intención de consultar. Las dos fallas se encadenan.

## Lo que hay que resolver

1. Que la comunicación se active cuando el agente está por pedirle al usuario que haga de intermediario (abrir otra sesión, copiar un texto). Puede ser `description` o regla de conducta: relacionado con el plan Local-0130.
2. Avisar cuando el Índice de comunicación está vacío (por ejemplo, en la Pantalla de bienvenida).
3. Unificar con la habilidad `consultar-agente` que tiene el repo Agente Coordinador, según el análisis.
4. Medir con la Herramienta Local-0012 `probar-disparo-de-skills`.

## Cruces

- plan Local-0107 (Que la consulta a otro Agente avise cuando no arranca, traiga la respuesta completa, pueda leer archivos de otra carpeta y no se frene al resolver): mismo subsistema; van en el mismo grupo de trabajo.
- Decisión Local-0065: el modo es la habilidad; cualquier disparo nuevo tiene que elegir entre `preguntar` y `resolver`, no mezclarlos.
- Este repo publica el mecanismo y mantiene su Índice de comunicación sin filas: la fila agregada el 13/11/2026 para consultar a `como-uso-claude` no se commitea.

## Análisis del 14/11/2026

Lo hizo un subagente de solo lectura, junto con el plan Local-0107 (mismo grupo de trabajo), coordinado desde el plan Local-0129. Trae evidencia; no decidió nada. El mecanismo de `comunicar.js` y sus fallas están en la sección del 14/11/2026 del plan Local-0107.

### Lo verificado

- El banco de `probar-disparo-de-skills` tiene `preguntar-01/02` y `resolver-01/02`, todos con frases del usuario (`banco.json:47-68`). Ningún caso mide la intención del agente a mitad de una tarea, que es lo que este plan pide.
- **Contradicción interna:** `preguntar/SKILL.md:10` dice que `resolver` «la elige el usuario tipeándola», pero la `description` de `resolver` se dispara sola.
- El aviso de Índice vacío iría en `mostrar-pantalla-bienvenida.js:45`, en `conducta/`, que también tocan los grupos A y D. Este repo mantiene su Índice de comunicación sin filas a propósito, así que acá el aviso saldría siempre.
- No hay término del glosario para «handoff» ni para «intermediario». Términos que aplican: el término del glosario Local-0037 (Agente Multipropósito Conocido) y el Local-0038 (Modo de Comunicación). Al redactar, cuidado con los términos vetados Local-0049 (`empujar`) y Local-0043 (`transcript`).

### Orden

Va después del plan Local-0107: disparar la comunicación más seguido sobre un mecanismo que pierde respuestas multiplica el daño.

### Archivos

Las habilidades en `funcionalidades/amp-comunicacion/skills/{preguntar,resolver,buscar-agentes}/SKILL.md` viajan por el plugin (hoy 0.3.0) y hay que subirle la versión. Según lo que se elija: una regla en `conducta/INDICE.md`, la Pantalla de bienvenida y `herramientas/probar-disparo-de-skills/banco.json`.

### Riesgos

- Una regla de «no hacer de intermediario» puede chocar con la Preferencia Base-0014 (Entregar un handoff cuando el trabajo pasa a otro agente ahora), que pide entregar un handoff cuando el usuario lo pide.
- La Herramienta Local-0012 mide lo instalado: hay que publicar antes de medir.

### Decisiones abiertas

1. ¿Cómo se dispara por intención: ampliando la `description` de `preguntar` (por ejemplo, «…o al estar por pedirle al usuario que abra otra sesión y pegue un texto»), con una regla de conducta (cruza con el plan Local-0130), o las dos?
2. ¿Dónde se avisa que el Índice de comunicación está vacío: en la Pantalla de bienvenida («agentes conocidos: 0 — corré buscar-agentes») o al terminar `amp:inicializar`?
3. ¿Cómo se unifica con `consultar-agente` del Agente Coordinador: el Coordinador migra a `amp-comunicacion` y se adopta su `--stream`, conviven, o queda fuera de este grupo?
4. ¿Se corrige ya la contradicción de `preguntar/SKILL.md:10`?

### Respuestas del usuario a la página de decisiones — 15/11/2026

Página única de tres temas (`.claude/tmp/decisiones-tres-temas-2026-11-14.html`), pestaña «Consultas a otro repo», fichas 7 a 10. El plan no recomendaba; el usuario eligió la recomendación del subagente en las cuatro.

- **#7 = C. Las dos medidas: se amplía la descripción de `preguntar` y se suma una regla de conducta**, una de respaldo de la otra. La regla sigue lo decidido para las reglas en el plan Local-0130: momento `cada turno`, condición en el texto, y cuenta para el tope medido del texto de cada turno.
- **#8 = B. El aviso de que no hay otras instalaciones registradas sale una vez, al terminar `amp:inicializar`**, y sugiere `buscar-agentes`.
- **#9 = C. La habilidad propia del Agente Coordinador queda fuera de este plan.** Acá solo se toma la idea del turno completo (plan Local-0107, #1). Su migración va a un plan propio, después.
- **#10 = A. Se corrige ya `preguntar`** para que diga lo mismo que la descripción de `resolver`: «Para pedirle que haga algo está la habilidad resolver, que se usa cuando el usuario pidió que el otro repo quede modificado».

## Construcción — 16/11/2026

Construido en la rama `c-repo` (grupo C del plan Local-0129), después del plan Local-0107 como pedía el orden.

- **#7 (descripción + regla) — la descripción, hecha; la regla, redactada.** La `description` de `preguntar` suma el disparo por intención: «cuando el agente está por pedirle al usuario que abra una sesión en otro repo, le pegue un texto y traiga lo que contesta». El cuerpo suma la sección «No pedirle al usuario que haga de intermediario», que deja a salvo el handoff de la Preferencia Base-0014 (pasar trabajo a otra sesión no es traer una respuesta). La fila de la regla de conducta (`cada turno`, `Inyectar`) **no se agregó**: el grupo A está tocando `conducta/INDICE.md`; el texto lo agrega el coordinador.
- **#8 (aviso al terminar `amp:inicializar`) — hecho.** El paso «Reportar» avisa una vez, si `.claude/comunicacion/INDICE.md` quedó sin filas, y sugiere `buscar-agentes`.
- **#9 — fuera de este plan**, como se decidió.
- **#10 (corregir `preguntar`) — hecho.** Ya no dice que `resolver` «la elige el usuario tipeándola»: dice que se usa cuando el usuario pidió que el otro repo quede modificado.
- **Medir con la Herramienta Local-0012** — preparado, no medido: el banco suma `preguntar-03`, la consulta del caso del 13/11 vista del lado del usuario que se ofrece de intermediario. Esa Herramienta mide lo instalado, así que hay que publicar `amp-comunicacion` con versión nueva antes de correrla (`--id=preguntar-03`).
