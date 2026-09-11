**Estado: Nuevo · Creado 26-09-11.**

# Limpiar una copia de subagente avisa de un daño al `.claude/` que no existe

## El síntoma

El 10/09/2026, al cerrar la segunda corrida del plan Local-0119 (*Hacer avanzar varios
planes a la vez hasta la próxima decisión del usuario*), `limpiar-worktree` cerró las
cuatro copias con el mismo texto:

```
    ⚠ faltan 502 archivo(s) en el `.claude/` del repo
⚠ ESTO ES EL DAÑO QUE LA HERRAMIENTA EXISTE PARA EVITAR. Recuperá el `.claude/` del repo
antes de seguir trabajando: `git checkout -- .claude` si está versionado, o el respaldo
más reciente de `.claude/.respaldo-amp/` si no lo está.
```

Verificado en el momento: `git status` limpio, los 302 archivos versionados de `.claude/`
presentes, el árbol intacto. **No faltaba nada.** El conteo que informó la Herramienta pasó
de 2313 a 623, y 623 es el número real.

## El diagnóstico, contra el código

La Herramienta compara el `.claude/` del repo antes y después de borrar, y de esa cuenta
descuenta lo que no es del repo. Qué descuenta está escrito a mano:

| Archivo | Línea | Qué dice |
|---|---|---|
| `.claude/common/worktrees.js` | 24 | `const NO_SE_COPIA = new Set(['tmp', '.respaldo-amp']);` |
| `.claude/common/worktrees.js` | 170, 186 | `inventariarClaude` saltea esos dos nombres, y **solo en el primer nivel** |
| `.claude/herramientas/limpiar-worktree/limpiar-worktree.js` | 107 | toma el inventario previo con esa exclusión |
| `.claude/common/worktrees.js` | 413-438 | `verificarBorrado` compara previo contra actual y emite `claude-danado` |
| `.claude/herramientas/limpiar-worktree/limpiar-worktree.js` | 223-228 | imprime la alarma |

Las copias que arma `preparar-worktree` caen en `.claude/tmp/worktrees/`, o sea adentro de
`tmp`, y por eso nunca se contaron. **Las copias que arma el aislamiento por worktree nativo
de los subagentes caen en `.claude/worktrees/`**, que no está en esa lista: se cuentan como
si fueran archivos del repo, y al borrar una, su baja se lee como destrucción.

Los 502 «faltantes» eran los archivos de las cuatro copias.

**Es la misma forma que el hallazgo 6 del plan Local-0119, dada vuelta.** Allá una ruta con
`tmp` adentro apagaba un control que debía revisar; acá una ruta sin `tmp` adentro enciende
una alarma que no corresponde. Las dos veces el defecto es el mismo: medir contra una ruta
escrita a mano en vez de contra lo que la ruta significa.

### Verificado hoy, 11/09/2026

En el repo principal hay tres copias de subagente vivas, y git las registra:

```
D:/…/Inicializador de Repos Custom jllarens                      [main]
D:/…/.claude/worktrees/agent-a2d372a912bdaa2d4                   [worktree-…] locked
D:/…/.claude/worktrees/agent-a4453d5b42e168c27                   [worktree-…] locked
D:/…/.claude/worktrees/agent-a7739f05bb9b88848                   [worktree-…] locked
```

Dos datos que el arreglo puede usar, los dos comprobados en esta sesión:

1. **git las conoce.** `git worktree list --porcelain` las devuelve, y el propio módulo ya
   tiene el lector: `listarWorktrees` (`worktrees.js:55`).
2. **git las ignora.** `git check-ignore --stdin --no-index` sobre
   `.claude/worktrees/agent-x/README.md` sale con 0; la regla es `**/.claude/worktrees/`, y
   está en `.git/info/exclude`, que es de esta máquina y **no viaja**.

## Por qué importa

- **Es la alarma más fuerte que emite el repo**, y salió cuatro veces seguidas sin que
  hubiera pasado nada.
- **El daño que vigila es real y ya ocurrió**: está asentado en la página de conocimiento
  Base-0007 (*Borrar un worktree con `git worktree remove` vacía el destino del enlace que
  tenga adentro*), y es la razón de existir de la Herramienta.
- Una alarma que grita en falso enseña a ignorarla. El día que el borrado sí vacíe el
  `.claude/` va a estar entre estas cuatro. Es la forma «un control que deja de controlar»
  del conocimiento Local-0013 (*Controles que dejan de controlar sin avisar*), con la
  variante de que acá el control no se apaga: se vuelve ruido, que termina igual.

## Lo que el mismo defecto rompe además

Estos dos no se midieron: salen de leer el código, con la evidencia de rutas verificada
arriba. Hay que confirmarlos al ejecutar el plan.

1. **`preparar-worktree` copiaría las copias hermanas adentro de la nueva.** Es lo más caro
   de los tres. `faltantesEnWorktree` (`worktrees.js:251`) le pregunta a git cuáles de los
   archivos de `.claude/` están ignorados y copia esos al worktree nuevo, porque son los que
   git no puede llevar. Como git ignora `.claude/worktrees/**` —verificado arriba—, cada
   archivo de cada copia hermana entra en esa lista y se copia. Con tres copias en disco,
   armar la cuarta arrastraría el contenido de las otras tres.
2. **Los conteos `[ANTES]` y `[DESPUÉS]` que se le muestran al usuario están inflados**
   (2313 contra 623 en la corrida del 10/09), así que el número que la Herramienta informa
   no describe el `.claude/` del repo.
3. **`escriturasEnClaude` saltea `tmp` y nada más** (`worktrees.js:318`), con la misma forma
   del defecto. Hay que revisar si en algún camino cuenta de más.

## Trabajo previsible

- **Reemplazar la lista de nombres por un criterio que diga qué significa la ruta.** El
  arreglo del hallazgo 6 ya sentó el molde: medir contra la raíz del repo al que pertenece
  el archivo, y no contra la ruta escrita a mano. Acá el equivalente es: **lo que está
  adentro de otro repo no es del `.claude/` de éste**, y el primer ancestro con `.git`
  —que en un worktree es un archivo y no una carpeta— lo dice sin depender de ningún nombre.
- **Conservar `tmp` y `.respaldo-amp`.** Esos dos no son otro repo, son material de trabajo
  de éste, así que la exclusión por nombre sigue haciendo falta al lado del criterio nuevo.
- **Que la alarma distinga el caso bueno del malo.** Si los archivos que faltan son
  exactamente los del árbol recién borrado, no hubo daño y no corresponde la alarma. Si
  faltan archivos de otro lado, sí. Hoy los dos casos dan el mismo texto.
- **Banco, con el caso al revés.** Un caso que pase con la lógica vieja no prueba nada: el
  banco tiene que armar una copia en `.claude/worktrees/<nombre>/`, borrarla y verificar que
  **no** salga `claude-danado` — y verificar que con la lógica vieja puesta a propósito, el
  caso falla. El banco de `limpiar-worktree` ya existe
  (`.claude/herramientas/limpiar-worktree/pruebas.js`).
- **Esto viaja.** `common/worktrees.js`, `limpiar-worktree/` y `preparar-worktree/` están en
  `funcionalidades/amp/skills/inicializar/base/`: al tocarlos hay que correr
  `sincronizar-base --aplicar`, subir la versión de `amp` y pasar `lint-harness`.

## Decisiones abiertas

### 1. ¿El criterio nuevo se resuelve en este plan o junto con el plan Local-0123?

**Contexto.** El plan Local-0123 (*El control de cierre cuenta las pruebas una vez por copia
y tarda más de diez minutos*) tiene exactamente la misma causa: un recorrido que excluye
`tmp` por nombre y no sabe que `.claude/worktrees/` es otro repo. Son dos recorridos
distintos, en dos archivos distintos, escritos por separado:

- `.claude/common/worktrees.js:24` — `NO_SE_COPIA = new Set(['tmp', '.respaldo-amp'])`
- `.claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js:47` —
  `EXCLUDE = new Set(['.git', 'node_modules', 'tmp', '.respaldo-amp'])`
- `.claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js:44` —
  `EXCLUDE = new Set(['.git', 'node_modules', 'tmp'])`, que ni siquiera coincide con los
  otros dos

La página de conocimiento Local-0016 (*No inventar soluciones particulares cuando ya existen
mecanismos*) describe justo esto: tres rincones que se inventaron su propia forma de lo mismo
dan idéntico resultado hasta el primer caso que las distingue, y ese caso ya llegó.

**Alternativa A — cada plan arregla su recorrido.** Local-0122 toca `worktrees.js`,
Local-0123 toca los dos corredores. Ejemplo concreto: el día que aparezca una cuarta ruta de
copia —el aislamiento nativo ya cambió una vez de `.claude/tmp/worktrees/` a
`.claude/worktrees/`—, hay que acordarse de los tres lugares. ⇒ Se vuelve a abrir un plan
por rincón; si no se abriera, es porque alguien se acordó de los tres, y nadie se acuerda de
los tres.

**Alternativa B — una sola función en `.claude/common/`, y los tres la usan.** Algo de la
forma «¿esta carpeta pertenece a otro repo?», con su prueba propia en `common/pruebas.js`.
Los dos planes la consumen. Costo: un componente compartido más, que viaja entero y necesita
prueba propia (conocimiento Base-0004, *La carpeta `.claude/common/`*). Y acopla los dos
planes: el que se ejecute segundo depende del primero. ⇒ Si el criterio queda en un solo
lugar, la cuarta ruta de copia se arregla una vez ⇒ si no fuera así, es porque los tres
recorridos quieren criterios distintos, y hoy los tres quieren el mismo.

**Recomendación: B, con una salvedad de orden.** El criterio es uno solo y ya se escribió
tres veces mal. Pero `worktrees.js` viaja a todo Agente Desplegado y los dos corredores no
(`ejecutar-pruebas` y `ejecutar-control-cierre` son Herramientas del Agente Desplegado, no
están en `base/`), así que la función compartida tiene que vivir en `common/` —que sí viaja—
y no adentro de una de las dos Herramientas locales. Ejecutar primero este plan, que es el
que ya obliga a tocar `common/`, y que Local-0123 la consuma.

### 2. ¿La exclusión alcanza a cualquier repo anidado, o solo a los worktrees que git registra?

**Contexto.** Hay dos formas de reconocer que una carpeta no es de este repo, y no cubren lo
mismo.

**Alternativa A — preguntarle a git** (`listarWorktrees`, que ya existe en el módulo). Es
exacta para lo que hay hoy: las tres copias de subagente están registradas y aparecen.
Ejemplo del hueco: una carpeta que alguien copió a mano, o una instalación de otro repo
dejada adentro de `.claude/`, no está registrada ⇒ se cuenta como del repo ⇒ vuelve la
alarma en falso, y esta vez sin que nadie sepa por qué.

**Alternativa B — el primer ancestro con `.git`.** Cubre worktrees registrados, worktrees
huérfanos, clones anidados y copias a mano, porque los cuatro tienen `.git` adentro. Es
además el mismo criterio con que se arregló el hallazgo 6, así que el repo ya lo usa en otro
lado. Ejemplo del hueco: una copia a la que le borraron el `.git` no se reconoce ⇒ se cuenta
⇒ alarma en falso. Es un caso más raro que el de A.

**Recomendación: B, y usar A solo para explicar.** B cubre más y ya es el criterio del repo
para esta misma pregunta; A sirve para que el mensaje diga «son las N copias que git
registra» en vez de un número pelado. Adoptar A sola repite el defecto con otro nombre:
sigue siendo una lista de rutas conocidas, solo que ahora la mantiene git.

## Propuestas para asentar

No se asentó nada: quedan acá para que las ratifique el hilo principal.

- **Página de conocimiento (candidata).** *Excluir por nombre de carpeta falla en las dos
  direcciones.* Hay dos casos medidos del mismo defecto y salen opuestos: el hallazgo 6 del
  plan Local-0119 (una ruta con `tmp` adentro **apagó** el control de términos vetados y el
  banco de `establecer-conducta`) y éste (una ruta sin `tmp` adentro **encendió** la alarma
  de destrucción). La afirmación que la página sostendría: una exclusión escrita como nombre
  de carpeta no dice lo que quiere decir, y cuál de los dos daños produce depende de si el
  nombre sobra o falta — apagar un control y encender una alarma falsa terminan en lo mismo,
  que es dejar de leer la señal. Emparenta con el conocimiento Local-0013 y con el Local-0016.
- **Dato para la página Base-0007.** El daño que esa página describe hoy no tiene ningún
  detector confiable mientras la alarma grite en falso. Puede valer una línea que lo diga,
  pero es de la página, no de este plan.

## Planes relacionados

- [Hacer avanzar varios planes a la vez hasta la próxima decisión del usuario](Hacer%20avanzar%20varios%20planes%20a%20la%20vez%20hasta%20la%20proxima%20decision%20del%20usuario.md)
  (Local-0119) — de donde sale la evidencia, hallazgo 10 de la segunda corrida.
- Local-0120 (*Paralelizar planes en worktrees es casero y en Windows borra el `.claude` del
  repo*), ya `Ejecutado` — es el plan que creó estas dos Herramientas, y el que asentó el
  conocimiento Base-0007.
- [El control de cierre cuenta las pruebas una vez por copia y tarda más de diez minutos](El%20control%20de%20cierre%20cuenta%20las%20pruebas%20una%20vez%20por%20copia%20y%20tarda%20mas%20de%20diez%20minutos.md)
  (Local-0123) — misma causa, otro recorrido. Ver la decisión abierta 1.
