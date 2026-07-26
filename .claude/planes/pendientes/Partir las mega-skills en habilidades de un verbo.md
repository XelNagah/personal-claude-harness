# Partir las mega-skills en habilidades de un verbo

**Estado: Nuevo · Creado 26-07-26.** Origen: sesión de `planificar` sobre el rework de memoria (26/07/2026). Se desprende para no meter un cambio transversal al Agente Multipropósito adentro de un plan de un subsistema.

## La molestia (Javier, 26/07/2026)

> *"Tampoco una habilidad es un sustantivo para mí. ¿Qué es `ciclo-de-plan`? Que sé yo. En cambio, `registrar-plan`, `analizar-plan`, `contrastar-plan`, `ejecutar-plan`, `explicar-plan`, `priorizar-planes`. Eso sí se ve como skills. El ciclo por ahí es determinado flujo de esos skills, pero así parece un subsistema con estados, con mil cosas, y eso es parte del subsistema de planes, no de la habilidad como si tuviera 34.000 cosas."*

Dos defectos distintos, y el segundo es el grave.

**1. El nombre es una frase nominal.** `ciclo-de-plan` no dice qué hace. La **decisión 0015** ya lo prohíbe — *"el nombre es una acción (verbo + objeto)… no un adjetivo ni una frase nominal"* — así que es una violación vigente que nadie pescó. Es exactamente lo que `converger-terminologia` tendría que haber marcado y no marcó.

**2. La habilidad se comió el subsistema.** `ciclo-de-plan` no es una acción: es el ciclo de vida entero (abrir, transicionar, mover de carpeta, completar fechas, partir un plan a medias, cerrar con lint). Eso es el **modelo del subsistema**, y el subsistema es su dueño. La prueba de que está mal ubicado: `.claude/planes/ESTADOS.md` **ya tiene la máquina de estados**, configurable, y el lint la lee — la skill la duplica adentro suyo. La mega-skill no solo se comió el subsistema, le copió un archivo que el subsistema ya tenía.

## El principio

- **Una habilidad = un verbo.** Hace una cosa, se nombra por lo que hace, y trae **solo sus pasos**.
- **El modelo, el ciclo y los estados son del subsistema**, y viven una sola vez en su `README.md` y sus registros (`ESTADOS.md`, `MOMENTOS.md`).

Efecto colateral bueno: **baja la duplicación**. Hoy el ciclo está escrito en la skill y en el subsistema; con verbos chicos queda una sola vez.

## Alcance: no es solo planes

Hay que revisar todas. Candidatas por la misma forma:

- **`ciclo-de-plan`** — el caso que originó esto.
- **`converger-terminologia`** — nombre verbal, pero hace varias cosas (barrer el repo, detectar sinónimos y anglicismos, proponer ratificar, proponer vetar, proponer reescribir).
- **`amp:inicializar`** — instala nueve subsistemas de una. Puede que acá la mega-forma esté justificada (es un instalador), pero hay que decidirlo, no heredarlo.
- Las nuevas que salen del rework de memoria: **`registrar-herramienta`**, **`registrar-regla`**, **`agregar-subsistema`** y la de reparto (nombre provisorio `actualizar-subsistemas`) nacen con el mismo riesgo.

## A decidir

- **Qué verbos** por subsistema. La lista de Javier para planes es el punto de partida, no la respuesta: hay que ver cuáles existen de verdad y cuáles son especulación.
- **Dónde vive un flujo que encadena varias habilidades.** Si el ciclo es "determinado flujo de esos skills", ¿se escribe en el `README.md` del subsistema, o hay una habilidad que orquesta? Cuidado: una habilidad que orquesta vuelve a ser una mega-skill.
- **El costo de partir.** Cada habilidad nueva es una carpeta, un `SKILL.md` y una descripción que el modelo tiene que discriminar al elegir. Diez habilidades de planes compiten entre sí en el momento de disparar; una sola nunca se equivoca de destino. Hay un punto donde partir empeora.
- **Renombres publicados.** `ciclo-de-plan` viaja en `amp-planes`, así que cambiarlo arrastra el procedimiento de nombre retirado (instalar lo nuevo → desinstalar lo viejo con su alcance → reiniciar). Los nombres los ratifica el usuario (decisión 0016).

## Ya resuelto en la sesión que lo originó

- **`ciclo-de-plan` queda vetado** como nombre de habilidad (Javier, 26/07/2026: *"muy farlopa"*). El reemplazo lo define este plan.

## Cruces

- `Nombres y distribucion de las skills del harness` — sus dos ejes están **cerrados** (nombre del repo → 0014; prefijo de plugin → 0013). Esto es un tercer eje que ese plan no cubre: la **granularidad** de la habilidad, no su nombre ni su prefijo.
- `Revisar cada subsistema - sentido, disparador y skill de operacion` — el barrido por subsistema donde caerían los verbos.
- `Rework de memoria` — de ahí salió, y le deja tres habilidades nuevas para revisar con este criterio.
