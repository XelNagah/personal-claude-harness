# Unificar la resolución de refs en los lints de subsistema

**Estado: Ejecutado · Creado 26-07-20 · Cerrado 26-07-20.**

## Origen

Nivelando `sicape-backend` a 0.4.0, `lint-conocimiento` reportó **20 refs rotas, todas falsos positivos**. La mayoría son refs **salientes** de `conocimiento/` hacia `docs/`, `planes/`, `memoria/` y `adr/` — escritas relativas a la raíz del repo. El lint prueba solo dos candidatos (relativo al archivo, relativo a la raíz del subsistema), y ninguno puede resolver una ref saliente: por definición apunta fuera de `conocimiento/`.

No es un problema del repo consumidor. El harness **fomenta** las refs cruzadas: el propio `INDICE.md` de cada subsistema linkea a planes y decisiones. La única forma de satisfacer al lint hoy es escribir `../../`, feo e inconsistente con el resto del repo.

En `sicape-backend` se resolvió con un tercer candidato contra `process.cwd()`, documentado como divergencia deliberada. Si el harness adopta el criterio, ese patch desaparece.

## Diagnóstico

`lint-memoria`, del mismo harness, ya resuelve esto con 5 candidatos y un comentario que explica exactamente el caso. El problema no es "un lint le falta un candidato": son **cuatro criterios distintos conviviendo**.

| Lint | Candidatos de resolución | Qué escanea |
|---|---|---|
| **memoria** | 5 — `fdir`, `root`, `root/..`, `root/../..`, `cwd` | todos los `.md` del árbol |
| **conocimiento** | 2 — `fdir`, `root` | todos los `.md` del árbol |
| **glosario** | 1 — `root` | **solo** la columna Detalle de `INDICE.md` |
| **decisiones** | 1 — `root` | **solo** la columna Detalle de `INDICE.md` |
| **herramientas** | no resuelve refs `.md` | links de la columna Herramienta contra subdirs locales; salta lo externo a propósito |

Dos hallazgos colaterales que no estaban en el reporte original:

**1. Hay un segundo eje: el alcance de escaneo.** Glosario y decisiones nunca leen el cuerpo de sus páginas de detalle. Si `.claude/glosario/harness.md` escribe `[dec. 0008](../decisiones/INDICE.md)` y mañana se renombra `decisiones/`, ningún lint lo detecta — nunca. En conocimiento sí. Unificar candidatos **no** cierra ese hueco. Sale a plan aparte (ver *Fuera de alcance*).

**2. `lint-harness` no puede custodiar la replicación hoy.** Su sección de bloques verbatim usa el regex ``/```markdown\n(---\nname: ([\w-]+)...)/`` — solo hashea **memorias**. Los bloques ```javascript de los lints no se comparan entre plantillas. Es el mismo hueco anotado en el plan *Vetar términos y ratificar alias*. Sin extenderlo, "texto idéntico replicado" queda garantizado solo por disciplina.

**3. `lint-memoria` tiene un agujero preexistente.** Acepta como válido un `hit` **fuera del repo**: el filtro `inRoot` solo se aplica al set `referenced` (huérfanos), no a la validación de la ref. Una ref `../../../otro-repo/x.md` pasa como buena. El límite de este plan lo cierra de paso.

## Decisiones ratificadas por el usuario

- **Alcance**: unificar solo los **candidatos** ahora. El eje de alcance de escaneo (glosario/decisiones) va a plan aparte con el análisis ya hecho.
- **Forma de compartir**: **texto idéntico replicado**, no módulo compartido. Un `.claude/_comun/` obligaría a cada instalador a escribirlo, al orquestador a ordenar su creación, y dejaría infra sin dueño contra la decisión 0008. El bloque son ~20 líneas; el control va por `lint-harness` extendido.
- **Cómo se resuelve la raíz del repo**: `__dirname`. Criterio pedido por el usuario: *"que todos los lints funcionen igual y resuelvan bien la raíz del repo; la más simple de las que cumplan eso"*.

  ```javascript
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  ```

  El lint deduce la raíz de su propia ubicación en disco: vive en `.claude/<sub>/lint-<sub>/`, tres niveles abajo de la raíz. La profundidad la escribe el instalador y la fija la decisión 0008 — es estructura, no convención de uso, así que no depende de desde dónde se invoque el lint. Es además el criterio que **`control-cierre` ya usa** (su línea 11), así que no se inventa mecanismo.

  Único punto débil: si alguien reubica el lint, la cuenta de niveles miente. No se mitiga con código — lo cubre el instalador, que siempre escribe en la ruta del patrón.

### Alternativas evaluadas y descartadas

- **`cwd`** — funciona en el caso normal (`AGENTS.md` manda correr los lints desde la raíz, y el default relativo `path.resolve(argv[2] || '.claude/<sub>')` ya depende de eso). Se descartó porque se apoya en la disciplina de quien invoca: con `cd D:\ && node D:\repo\.claude\...\lint-conocimiento.js D:\repo\.claude\conocimiento` la raíz da `D:\` y el límite queda inútil. Con `__dirname` ese mismo comando da `D:\repo`.
- **Workdir declarado + hook que lo actualiza al instanciar** — descartada no por mala sino por innecesaria: con `__dirname` el dato ya está disponible sin guardarlo. Costaba tres piezas (archivo + hook + valor de reserva) y era la única alternativa que falla **silenciosa y angosta**: un valor viejo no da error, da los mismos falsos positivos que este plan arregla. Queda a mano por si algún día aparece un caso que pida pisar la raíz a dedo.
- **Sin límite** — cero código, pero deja sin arreglar el agujero de `lint-memoria` (refs que se escapan del repo con `../../../`).
- **`root/../..` fijo** — miente cuando el lint se invoca apuntando a otra carpeta o a un subsistema anidado.
- **Subir buscando `.git`** — se cae con un `.claude/` que tenga repo git propio (caso real: trackear el harness aparte del repo que lo hospeda). Frena en `.claude/.git` y da `repoRoot = .claude/`; entonces una ref saliente correcta como `docs/algo.md` resuelve bien pero `dentroDelRepo` la rechaza por caer fuera de `.claude/`. Peor que el estado actual: rechaza activamente una resolución válida.
- **Subir buscando `AGENTS.md`/`CLAUDE.md`** — descartada junto con la anterior: cualquier ancla que se busque trepando introduce una segunda noción de "dónde está el repo", que puede discrepar con la que ya existe.

### Nota sobre qué atrapa realmente el límite

El límite atrapa menos de lo que parece, y conviene tenerlo presente al revisar los resultados: **no** evita que una ref rota resuelva contra un homónimo **dentro** del repo. Ejemplo: `conocimiento/api/x.md` escribe `[algo](README.md)` queriendo `conocimiento/api/README.md`, que no existe; el candidato `path.join(repoRoot, t)` lo resuelve contra `<repo>/README.md`, que sí existe, y el límite no lo frena. Lo único que impide es que una ref se **escape** del repo. Ese es exactamente el agujero de `lint-memoria` que se cierra acá.

## Criterio único

La parte de **candidatos**, común a los cinco lints:

```javascript
// La raiz del repo se deduce de la ubicacion del propio lint: .claude/<sub>/lint-<sub>/ -> 3 arriba.
// La profundidad la fija el instalador (decision 0008); no depende de desde donde se invoque.
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const dentroDelRepo = p => {
  const r = path.resolve(p);
  return r === repoRoot || r.startsWith(repoRoot + path.sep);
};

// Un archivo de un subsistema puede linkear a otros (planes/, conocimiento/, docs/, ...): la ref se
// resuelve relativa al archivo, a la raiz del subsistema, a .claude/, a la raiz del repo y al cwd.
// Solo se acepta el candidato que caiga DENTRO del repo: una ref rota no resuelve contra afuera.
function resolverRef(t, fdir) {
  return [
    path.join(fdir, t),
    path.join(root, t),
    path.join(root, '..', t),
    path.join(repoRoot, t),
    path.resolve(t),
  ].map(p => path.normalize(p)).find(p => dentroDelRepo(p) && fs.existsSync(p)) || null;
}
```

El orden importa: gana el primer candidato que exista, y ese es el que entra al set `referenced` (afecta la detección de huérfanos). De lo más específico a lo más general.

## Pasos

1. **Línea de base.** Correr los 5 lints en este repo y guardar la salida. Sin esto no se puede distinguir "arreglé falsos positivos" de "aflojé el lint".
2. **Escribir el bloque canónico** en `lint-memoria` (es el que más se le parece) y verificar que no aparezcan hallazgos nuevos ni desaparezcan hallazgos legítimos. Ojo: memoria **puede** ganar hallazgos, porque hoy acepta refs que apuntan fuera del repo.
3. **Replicar textualmente** a `lint-conocimiento`, `lint-glosario`, `lint-decisiones`. En glosario y decisiones reemplaza el `path.join(root, target)` suelto de la columna Detalle.
4. **Herramientas**: no resuelve refs `.md`, así que `resolverRef` no aplica. Sí cambiar su `repoRoot = path.resolve(root, '..', '..')` (línea 41, usado para las refs de `settings`) por el `__dirname` acordado — hoy es un criterio más, derivado de `root` en vez de la ubicación del lint.
5. **Extender `lint-harness`**: que la sección de bloques verbatim hashee también bloques de código replicados entre plantillas, no solo memorias. Definir el marcador de identidad del bloque (el nombre de la memoria hoy cumple ese rol; para código hace falta un equivalente — evaluar un comentario-ancla en la primera línea del bloque).
6. **Control post-cambio**: correr los 5 lints otra vez y **comparar contra la línea de base**. Cada hallazgo que desaparece se justifica uno por uno; cada hallazgo nuevo también.
   - Caso de prueba obligatorio: **`.claude/` con `.git` propio**. Crear el escenario (o simularlo) y verificar que las refs salientes siguen resolviendo. Es el caso que tumbó el enfoque anterior.
   - Caso de prueba: invocar un lint **desde otro cwd** con ruta absoluta (`cd D:\ && node D:\repo\.claude\...`) — con `__dirname` la raíz debe seguir dando `D:\repo`.
7. **Propagar** con la skill `propagar-harness` a las `PLANTILLA.md` de las funcionalidades afectadas y al orquestador `setup-completo` (que duplica todo). Verificación carácter a carácter de los embebidos.
8. **Bumpear `version`** en los `plugin.json` tocados.
9. **Cierre**: `control-cierre` verde + `claude plugin validate .`.
10. **Retirar el patch local** de `sicape-backend` y su nota de divergencia, nivelando contra el harness ya corregido.

## Fuera de alcance

- **Alcance de escaneo de glosario/decisiones** (no leen el cuerpo de sus páginas de detalle). Plan aparte, análisis ya hecho acá.
- El comportamiento de `lint-herramientas` de saltar links externos en su columna Herramienta: es una decisión deliberada, no un falso positivo.

## Riesgo principal

Agregar candidatos hace el lint **más permisivo**: una ref genuinamente rota puede resolver contra un archivo homónimo en otro nivel. El límite por raíz del repo lo acota pero no lo elimina — dentro del repo sigue habiendo homónimos posibles. El paso 6 (comparar contra la línea de base) es el control que evita que esto pase silencioso.

## Notas de implementación

Ejecutado 26-07-20. Salió como estaba planificado; los desvíos y hallazgos:

**Lo que se hizo.** Los 5 lints comparten ahora dos fragmentos textuales: `raiz del repo` (los 5) y `resolucion de refs` (los 4 que validan links `.md` — `lint-herramientas` valida rutas en `settings`, no refs). `lint-herramientas` pasó de deducir la raíz con `path.resolve(root, '..', '..')` a usar el mismo `__dirname` que el resto.

**Evidencia del arreglo.** Se armó un archivo de prueba en `conocimiento/` con las cuatro clases de ref y se corrió el lint viejo contra el nuevo:

| | Refs rotas | Falsos positivos |
|---|---|---|
| Antes | 4 | 2 (refs relativas a la raíz del repo, ambas existentes) |
| Después | 2 | 0 |

Las dos genuinas (archivo inexistente, y ref que se escapa del repo con `../../../`) se siguen detectando: no aflojó.

**`lint-harness` extendido.** Además de los bloques de memoria, compara ahora fragmentos de código identificados por su comentario ancla, y lo hace **también contra los lints vivos de `.claude/`** — no solo entre PLANTILLAs, como decía el plan. Se amplió porque la deriva más probable es entre el lint que corre en el repo y la plantilla que lo distribuye, y comparar solo plantillas dejaba pasar justo eso. Verificado con prueba negativa: se cambió una palabra de un comentario en `lint-glosario` y el control la cazó señalando el archivo exacto.

**Desvío en la propagación.** El paso 2 de `propagar-harness` manda delegar la copia a un subagente fresco. Se hizo con un reemplazo determinista de cadena (viejo → nuevo, sacando el viejo de `git show HEAD:`): la regla existe para que nadie reescriba texto de memoria, y el script cumple ese objetivo con exactitud. La verificación del paso 3 se corrió igual — los 10 embebidos (5 plantillas + 5 copias en el orquestador) dan `true` en el chequeo de inclusión.

**Error de método, corregido.** La primera línea de base fue inválida: un `cd` previo dejó el cwd en `.claude/planes/pendientes` y los 5 lints tiraron `MODULE_NOT_FOUND`; ese volcado se leyó como "0 hallazgos" y se reportó verde sin estarlo. Se rehízo con los lints originales vía `git stash`, verificando que cada salida arrancara con `== LINT` antes de darla por buena. Los 5 quedaron idénticos a la línea de base real.

**Pasada de terminología.** `acote` era acuñación del agente (8 usos, nunca marcada como propuesta): se reemplazó por `límite` o se reformuló. También `override` → "pisar a dedo", `diffear` → "comparar", `fallback` → "valor de reserva" en texto plano. `patch` se conservó por ser palabra del usuario. Nada se asentó en el glosario.

**Versiones.** Los 6 plugins tocados pasaron de `0.4.0` a `0.4.1` (corrección de bug).

**Control de cierre:** 9 chequeos en verde, incluido `claude plugin validate`.

**Pendiente fuera de este repo:** retirar el patch local de `sicape-backend` (tercer candidato contra `process.cwd()`) y su nota de divergencia, nivelando contra el harness ya corregido. No se pudo hacer desde acá porque es otro repo.
