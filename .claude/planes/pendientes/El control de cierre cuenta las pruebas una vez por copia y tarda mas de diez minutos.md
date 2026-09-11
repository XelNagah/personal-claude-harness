**Estado: Nuevo · Creado 26-09-11.**

# El control de cierre cuenta las pruebas una vez por copia y tarda más de diez minutos

## El síntoma

El 10/09/2026, al cerrar la segunda corrida del plan Local-0119 (*Hacer avanzar varios
planes a la vez hasta la próxima decisión del usuario*):

- El control de cierre sobre el árbol integrado marcó el chequeo `pruebas de los controles`
  como **NO CORRIÓ**.
- Corrido a mano, el corredor tardó **más de diez minutos** y cerró con
  «**18 prueba(s) fallaron: hay un control que dejó de controlar**».
- Los casos que fallan son **dos**, siempre los mismos: `actualizar-plugins` (1 caso, ya
  conocido y previo: sin el plugin instalado para ese repo no compara nada) y `lint-harness`
  (que en el listado resumen figura como **NO CORRIÓ**).
- El listado completo de los bancos aparecía **nueve veces** en la salida.
- Corrido en el repo principal, sin una sola diferencia: 18 también. O sea que no es de
  trabajar en una copia.

## El diagnóstico anotado era otro, y es falso

El hallazgo 9 de la segunda corrida del plan Local-0119 lo atribuye a que la Herramienta se
invoca a sí misma:

> La causa está en el propio banco de `ejecutar-control-cierre`: sus casos invocan la
> Herramienta `ejecutar-control-cierre`, que corre `ejecutar-pruebas`, que corre todos los
> bancos incluido el suyo.

**Medido el 11/09/2026, y no es así.** Corrido solo, el banco
`.claude/herramientas/ejecutar-control-cierre/pruebas.js` tarda **11,3 segundos**, cierra
con **27 casos, TODO VERDE**, y en toda su salida el encabezado `PRUEBAS DE LOS CONTROLES`
aparece **una vez**. No hay cascada.

El motivo está en el propio banco: sus casos corren la Herramienta contra un repo de prueba
—`REPO_PRUEBA = .claude/tmp/repo-prueba-cierre`, línea 21— y no contra el repo real. Ese
repo de prueba no tiene corredor adentro, así que el chequeo sale `AUSENTE` y la cadena
termina ahí. Lo mismo vale para el banco hermano
(`.claude/herramientas/ejecutar-pruebas/pruebas.js`, `repo-prueba-corredor`).

Corregir esa explicación importa por sí solo: mientras siga escrita, el arreglo se va a
buscar donde no está.

## El diagnóstico verdadero

**El descubrimiento baja adentro de las copias del repo.** `ejecutar-pruebas` recorre dos
raíces y saltea carpetas por nombre:

```js
// .claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js:47
const EXCLUDE = new Set(['.git', 'node_modules', 'tmp', '.respaldo-amp']);
```

Las copias que arma `preparar-worktree` caen en `.claude/tmp/worktrees/`, adentro de `tmp`,
y por eso nunca se recorrieron. **Las copias del aislamiento por worktree nativo de los
subagentes caen en `.claude/worktrees/`**, que no está en esa lista. Cada copia es un repo
entero, con su `.claude/` y su `funcionalidades/`, así que aporta otra tanda completa de
bancos.

**Y hay un segundo multiplicador, que es el más sutil.** La exclusión de los bancos que
viajan está escrita como **ruta relativa a la raíz** (línea 62):

```js
{ dir: 'funcionalidades', excluir: ['funcionalidades/amp/skills/inicializar/base'] },
```

Adentro de una copia esa misma carpeta es
`.claude/worktrees/<copia>/funcionalidades/amp/skills/inicializar/base`, que no coincide con
la cadena excluida. O sea que **los bancos de `base/` —que son copias de los de `.claude/` y
están excluidos a propósito para no inflar el número— vuelven a entrar por cada copia.** El
comentario de las líneas 49-53 elige la ruta sobre el nombre justamente para que mover el
árbol que viaja haga reaparecer los duplicados en el conteo en vez de apagar algo en
silencio; lo que no previó es un árbol que aparece dos veces bajo raíces distintas.

### Medido hoy, 11/09/2026, sobre el repo principal con tres copias de subagente vivas

| Recorrido | En una copia limpia | En el repo principal | De dónde sale la diferencia |
|---|---|---|---|
| bancos que descubre `ejecutar-pruebas` | **26** | **164** | 26 propios + 46 por copia × 3 |
| lints que descubre `ejecutar-control-cierre` | **10** | **67** | 10 propios + 19 por copia × 3 |

Los 46 de cada copia son sus 26 bancos **más 20 de su `base/`**, que es el segundo
multiplicador. Los 19 lints de cada copia son sus 10 más 9 de su `base/`: la Herramienta
tiene su propia lista, y ni siquiera coincide con la del corredor —le falta `.respaldo-amp`
(`ejecutar-control-cierre.js:44`).

**Así cierra la aritmética de la corrida del 10/09.** Los bancos se ordenan por ruta, así que
los de cada raíz salen en un bloque contiguo: el repo aporta un bloque y cada copia aporta
dos —el de su `.claude/` y el de su `base/`—. Con las cuatro copias de esa corrida:
1 + 4 × 2 = **nueve bloques**, que son las nueve repeticiones del listado. Y los dos casos
que fallan, contados una vez por bloque, dan el 18.

### Por qué tarda, y por qué el control lo da por no corrido

- Se corren 164 bancos donde hay 26, y varios no son baratos: `lint-harness/pruebas.js` copia
  `funcionalidades/` entera y casi todo `.claude/` a un repo de prueba, cinco veces por
  corrida.
- **Cada banco se corre con el directorio de trabajo puesto en el repo principal**
  (`spawnSync(..., { cwd: REPO })`, línea 128). O sea que el banco de una copia prueba los
  scripts del repo principal: trabajo idéntico repetido, que no controla nada nuevo.
- Peor: los bancos usan rutas de repo de prueba fijas relativas al directorio de trabajo
  (`.claude/tmp/repo-prueba-harness`, `repo-prueba-cierre`, …), así que las cuatro copias del
  mismo banco se pelean **el mismo directorio**. Es exactamente el plan Local-0110 (*Dos
  corridas de las pruebas a la vez se pisan el directorio de trabajo*), disparado sin que
  haya dos sesiones abiertas.
- El `NO CORRIÓ` del chequeo tiene explicación exacta en el código: `ejecutar-control-cierre`
  le da al corredor **300 s** (`ejecutar-control-cierre.js:105`) y la corrida pasa de diez
  minutos ⇒ `spawnSync` corta ⇒ `r.status === null` ⇒ se informa `NO CORRIO`. El `NO CORRIÓ`
  de `lint-harness` dentro del corredor es el mismo mecanismo con el presupuesto por banco:
  **180 s** (`ejecutar-pruebas.js:128`).

## Por qué importa

El repo cierra tareas con este control, y su última línea dice «18 pruebas fallaron: hay un
control que dejó de controlar» cuando los casos que fallan son dos. Un número que no
corresponde a nada es la forma del conocimiento Local-0013 (*Controles que dejan de controlar
sin avisar*): la señal deja de significar lo que dice, y cuando el número suba porque se rompió
algo de verdad, nadie va a poder distinguirlo del ruido.

Los diez minutos lo agravan de la peor manera: hoy **el control de cierre no se puede correr
al cerrar una tarea**, que es para lo que existe. Y cuando se lo invoca igual, el propio
control informa `NO CORRIÓ` y sale con 0 en modo informativo — el repo se declara mirado sin
haberse mirado.

## Trabajo previsible

- **Que el descubrimiento no baje adentro de otro repo.** Es la misma causa que el plan
  Local-0122 (*Limpiar una copia de subagente avisa de un daño al `.claude/` que no existe*),
  en otro recorrido. Ver la decisión abierta 1 de ese plan: el criterio conviene que sea uno
  solo, en `.claude/common/`, y que los tres recorridos lo consuman.
- **Los tres recorridos, no dos.** Hay tres listas escritas por separado y ya divergen:
  `worktrees.js:24` (`tmp`, `.respaldo-amp`), `ejecutar-pruebas.js:47` (`.git`,
  `node_modules`, `tmp`, `.respaldo-amp`) y `ejecutar-control-cierre.js:44` (`.git`,
  `node_modules`, `tmp` — sin `.respaldo-amp`). Es el caso del conocimiento Local-0016 (*No
  inventar soluciones particulares cuando ya existen mecanismos*).
- **Revisar la exclusión por ruta relativa.** Aun sin copias, una exclusión escrita como
  ruta desde la raíz deja de aplicar en cuanto el mismo árbol aparece bajo otra raíz. Al
  arreglar el descubrimiento hay que decidir si sigue siendo una ruta o pasa a ser una
  pregunta sobre el archivo.
- **Medir de nuevo con el número limpio.** Recién ahí se sabe cuánto tarda de verdad el
  control de cierre, y si los dos presupuestos —180 s por banco, 300 s el corredor entero—
  siguen teniendo sentido. Hoy no se puede saber: el número está multiplicado por nueve.
- **Los dos casos que quedan, que son reales y hay que mirarlos aparte:**
  `actualizar-plugins` (1 caso; mira el estado de plugins de la máquina, previo y conocido) y
  `lint-harness` (*un fragmento vigilado se queda sin muestras*). Ninguno de los dos lo causa
  la multiplicación.
- **Banco, con el caso al revés.** Armar un repo anidado de mentira con un `pruebas.js`
  adentro y verificar que el corredor **no** lo descubre; y verificar que con la lógica vieja
  puesta a propósito, el caso falla. Los dos bancos ya existen
  (`ejecutar-pruebas/pruebas.js`, `ejecutar-control-cierre/pruebas.js`).
- **Estas dos Herramientas no viajan**, a diferencia de las del plan Local-0122:
  `ejecutar-pruebas` (Herramienta Local-0007) y `ejecutar-control-cierre` (Local-0001) son
  del Agente Desplegado y no están en `base/`. Pero si el criterio compartido vive en
  `.claude/common/`, **eso sí viaja**: al tocarlo hay que correr `sincronizar-base --aplicar`,
  subir la versión de `amp` y pasar `lint-harness`.

## Hallazgo menor, de paso

El encabezado de `ejecutar-control-cierre.js` (líneas 7-8) dice que la Pantalla de bienvenida
«lo invoca en cada arranque de sesion». No es cierto:
`mostrar-pantalla-bienvenida.js` corre cada lint por su cuenta (líneas 61 y 202) y nunca
invoca esta Herramienta. Es un comentario viejo, la segunda de las cuatro formas del
conocimiento Base-0001 (*Evitar el mismo dato escrito en varios lugares*), y arrastra una
consecuencia: el argumento con que ese encabezado justifica «nunca falla» —que la Pantalla
depende de que salga con 0— hoy no se sostiene sobre lo que el código hace.

## Decisiones abiertas

### 1. Con el número ya limpio, ¿el control de cierre sigue corriendo todo de una, o se parte?

**Contexto.** El control existe para correrse al cerrar una tarea. Aun sacando la
multiplicación quedan 26 bancos, y algunos son caros por diseño: `lint-harness/pruebas.js`
copia `funcionalidades/` entera y casi todo `.claude/` a un repo de prueba, cinco veces por
corrida, y por eso tiene el presupuesto más alto de los 26. Un control que tarda lo que tarda
una tarea chica se deja de correr, y un control que no se corre es lo mismo que no tenerlo.

**Alternativa A — dejarlo entero y medir primero.** Se arregla el descubrimiento, se mide la
duración real y recién después se decide. Ejemplo: si la corrida limpia cae a 70 s, no hay
nada que partir y partirlo habría agregado dos modos y una pregunta más en cada cierre. ⇒ El
costo es esperar una medición ⇒ si no se esperara, se estaría optimizando contra un número
que hoy está multiplicado por nueve.

**Alternativa B — partirlo ahora en barato y caro.** Los lints y los bancos rápidos por
omisión; los caros con una bandera, o solo antes de publicar. Ejemplo: el cierre baja a
segundos desde ya. ⇒ Pero el chequeo que queda afuera por omisión es el que nadie corre ⇒ y
el banco más caro es justo `lint-harness`, que es el que vigila lo que se publica a todos los
Agentes Desplegados: dejarlo del lado opcional es el modo de falla que este mismo plan
describe.

**Recomendación: A.** Medir antes de partir. La decisión de partir es sustractiva —agrega un
modo por omisión que mira menos— y la preferencia Local-0006 pide preferir lo aditivo; además
hoy no hay ningún número honesto contra el cual justificarla.

### 2. ¿Qué debe hacer el control cuando un chequeo se pasa de su presupuesto de tiempo?

**Contexto.** Hoy un chequeo que se pasa del tiempo se informa como una fila más con el
estado `NO CORRIÓ`, y en modo informativo la Herramienta igual sale con 0. Pasó en la corrida
del 10/09 con el corredor entero y con `lint-harness`. `NO CORRIÓ` no es un estado como los
otros: `OK` y `FALLA` describen el repo, `NO CORRIÓ` dice que el repo **no se miró**.

**Alternativa A — dejarlo como está.** Ejemplo: la corrida del 10/09 informó `NO CORRIÓ` en
una fila del medio de la lista y se siguió adelante; hizo falta correr el corredor a mano
para enterarse de algo. ⇒ Un chequeo que no corrió se lee igual que uno que corrió y encontró
algo ⇒ y el que lee la lista concluye «hay un rojo más», no «esto no se miró».

**Alternativa B — que `NO CORRIÓ` se informe aparte y con su propio texto**, diciendo qué
chequeo no se miró y con qué presupuesto se cortó. Ejemplo: la última línea pasaría de
«N chequeo(s) requieren atencion» a decir además «1 chequeo no se pudo correr: `pruebas de
los controles`, cortado a los 300 s». ⇒ El lector distingue lo mirado de lo no mirado ⇒ y si
no lo distinguiera, el verde parcial se leería como verde, que es la forma del conocimiento
Local-0013.

**Alternativa C — que un `NO CORRIÓ` haga fallar al control aun en modo informativo.**
⇒ Rompe el contrato que la Herramienta declara y que su banco controla —reporta y no falla—,
y por una condición que depende de la máquina. No se recomienda.

**Recomendación: B.** Es aditiva, no toca el contrato de códigos de salida y ataca lo que
hizo daño: no que el chequeo se cortara, sino que cortarse se leyera igual que cualquier otro
rojo.

## Propuestas para asentar

No se asentó nada: quedan acá para que las ratifique el hilo principal.

- **Corregir el hallazgo 9 del plan Local-0119.** Su diagnóstico —«la Herramienta se invoca a
  sí misma en cascada»— está refutado por medición (11,3 s, 27 casos, TODO VERDE, sin
  cascada). Hay precedente de hacerlo: el diagnóstico del hallazgo 6 se reemplazó en ese
  mismo archivo el 08/09/2026. No se tocó desde acá porque este trabajo tenía el alcance
  acotado a escribir los dos planes.
- **Página de conocimiento (candidata).** *Una exclusión escrita como ruta relativa a la raíz
  deja de excluir adentro de una copia del repo.* La exclusión de `base/` está escrita como
  ruta a propósito —para que mover el árbol que viaja haga reaparecer los duplicados en el
  conteo en vez de apagar algo en silencio— y esa misma elección la desactiva en cuanto el
  árbol aparece bajo otra raíz: medido, 20 bancos duplicados por copia, 46 en vez de 26. La
  afirmación: elegir la ruta sobre el nombre protege de que la exclusión se agrande sola, y
  no protege de que deje de aplicar; las dos formas fallan, en direcciones opuestas.
- **Comparte candidata con el plan Local-0122**, la de excluir por nombre de carpeta fallando
  en las dos direcciones. Si se asientan las dos, revisar que no se pisen.

## Planes relacionados

- [Hacer avanzar varios planes a la vez hasta la próxima decisión del usuario](Hacer%20avanzar%20varios%20planes%20a%20la%20vez%20hasta%20la%20proxima%20decision%20del%20usuario.md)
  (Local-0119) — de donde sale la evidencia, hallazgo 9 de la segunda corrida.
- [Limpiar una copia de subagente avisa de un daño al `.claude/` que no existe](Limpiar%20una%20copia%20de%20subagente%20avisa%20de%20un%20dano%20al%20.claude%20que%20no%20existe.md)
  (Local-0122) — misma causa, otro recorrido. Su decisión abierta 1 decide si el criterio se
  comparte.
- [Dos corridas de las pruebas a la vez se pisan el directorio de trabajo](Dos%20corridas%20de%20las%20pruebas%20a%20la%20vez%20se%20pisan%20el%20directorio%20de%20trabajo.md)
  (Local-0110) — la multiplicación dispara ese mismo choque sin que haya dos sesiones
  abiertas.
- Local-0086 (*Darle banco a las dos Herramientas que deciden qué viaja y qué está verde*),
  ya cerrado — es el plan que le dio banco a `ejecutar-control-cierre`; el banco existe y es
  verde, y aun así este defecto pasó, porque el banco mira un repo de prueba sin copias
  adentro.
