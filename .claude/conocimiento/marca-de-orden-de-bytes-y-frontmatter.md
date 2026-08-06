# La marca de orden de bytes tapa el frontmatter

Un `.md` guardado con **marca de orden de bytes** —el carácter U+FEFF al principio del archivo— deja
de matchear `/^---/`. El parseo del frontmatter no encuentra nada y devuelve "sin frontmatter". No
hay error: hay un archivo que perdió todo lo que declaraba de sí mismo.

Es la peor combinación posible de un defecto: **el archivo se lee idéntico en cualquier editor**, el
lector no falla sino que contesta, y lo que contesta —"este archivo no declara nada"— suele ser una
respuesta legítima que el código ya sabe manejar, porque es la forma vieja que se acepta a propósito
mientras haya instalaciones sin actualizar. El camino de la falla y el camino previsto son el mismo.

## Lo que cambia según quién lee

El frontmatter no dice lo mismo para todos, así que taparlo tampoco hace lo mismo:

- **Un lector que decide cuánto copiar por el `origen`** —el que sincroniza lo que viaja en el
  plugin— trata un registro sin origen como mecanismo, y el mecanismo se copia **entero**. O sea: las
  filas que ese repo puso se publican a todos los consumidores. Es el caso destructivo.
- **Un lector que descubre Índices por el campo `indice`** —los lints de subsistema, el repartidor de
  reglas, la pantalla de estado— lee un Índice declarado como **no declarado**. Los chequeos que
  dependen del origen dejan de correr y el lint sale en verde sobre lo que ya no mira.
- **El actualizador** lee el origen del archivo que viaja, no del instalado, así que la marca en el
  destino no le cambia la decisión: solo produce marcas de más.

## El arreglo es de a N, no de a uno

El parseo del frontmatter es un fragmento **duplicado en trece piezas de código** de este repo. Con
el fragmento replicado, taparlo en una sola no es una mejora parcial: es una divergencia, y acá
además la caza un control que exige que ese fragmento sea idéntico carácter a carácter entre lints.
Un defecto en código duplicado se arregla en todas las copias a la vez o no se arregla.

Segunda trampa, encontrada al arreglarlo: **escribir el carácter U+FEFF literal dentro del regex**
funciona, pero deja en el código fuente exactamente el carácter invisible del que trata el defecto —y
lo mismo vale para esta página, que se escribió dos veces con la marca adentro antes de notarlo. Va
siempre por su escape (`\uFEFF`) o construido por código (`String.fromCharCode(0xFEFF)`), que se ven.

**El barrido que esta página proponía existe desde el 31/07/2026**, como sección de `lint-harness`:
recorre todo el repo y marca cualquier aparición del carácter, distinguiendo la del inicio —la marca
que tapa el frontmatter— de las del medio —el literal colado en el texto—. Su primer hallazgo real
apareció mientras se lo escribía: el medidor con el que se levantó el estado inicial se marcó a sí
mismo, porque se había escrito con el carácter literal adentro. De 337 archivos del repo, el único
con la marca era el que la buscaba. Es la evidencia de que el defecto se reintroduce solo.

**Cómo se verificó:** medido en este repo el 30 y 31 de julio de 2026. El defecto era **latente**:
ninguno de los 238 `.md` del repo tenía la marca. Se reprodujo sembrándola en un banco de pruebas —un
Índice con la marca hace aparecer `no declara frontmatter` y los chequeos de columnas dejan de
correr— y el arreglo se verificó al revés, revirtiéndolo y confirmando que el caso vuelve a fallar.

**Cuándo aplica:** a cualquier código que parsee frontmatter, o que ancle un patrón al principio del
archivo con `^`. **Cuándo no:** no es un problema de lectura humana ni de renderizado — quien abre el
archivo no ve ninguna diferencia, que es justamente por qué el defecto sobrevive. Tampoco aparece
solo: lo introduce guardar el archivo con una herramienta que agrega la marca (varios editores de
Windows y `Out-File`/`Set-Content` de PowerShell lo hacen), así que el riesgo entra por la máquina
donde se edita, no por el repo.
