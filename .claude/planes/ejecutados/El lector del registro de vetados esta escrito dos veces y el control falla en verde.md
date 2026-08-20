# El lector del registro de vetados está escrito dos veces y el control falla en verde

**Estado: Ejecutado · Creado 26-08-20 · Cerrado 26-08-20.**

## Diagnóstico

El registro `semantica/TERMINOLOGIA-FARLOPA.md` tiene **dos lectores** con contratos incompatibles, y ninguno de los dos controla al otro:

- `semantica/lint-semantica/lint-semantica.js` — `splitFarlop` quita las comillas simples invertidas si están y separa por `,`, `;` y `/`. Tolera las dos formas.
- `conducta/detectar-terminologia-vetada/detectar-terminologia-vetada.js` — extrae los tramos entre comillas simples invertidas y saltea la fila si no hay ninguno. **Sin comillas, la fila desaparece del control.**

Cuando todas las filas de un repo vienen sin comillas, el registro se lee **vacío** y el control del momento `al escribir` **contesta en verde sin frenar nada**. Es el primer modo del conocimiento Local-0013 (*Controles que dejan de controlar sin avisar*): validar sobre un conjunto vacío.

**El formato no está documentado en ninguna parte.** El encabezado del registro dice de la celda `Nombre` solo «el término, o los términos hermanos que comparten el veto», el README del subsistema no lo menciona, y —lo decisivo— la copia que viaja en `base/` llega **con la tabla vacía**: un Agente Desplegado recibe encabezado y separador, sin una sola fila de la que deducir el formato. Que las 48 filas de este repo usen comillas es intención tácita que nunca salió de acá.

Hay una tercera divergencia, que hace que «tolerar la ausencia» no alcance: **el separador**. La fila `Local-0005` es `` `levelear` / `leveleo` / `leveling` ``; el lint saca tres términos separando por `/`, el control saca tres porque hay tres pares de comillas. Si el control se limitara a tomar la celda entera cuando no hay comillas, una fila sin comillas le daría la variante literal `levelear / leveleo / leveling`, que no aparece en ningún texto: el control seguiría en verde y encima creyendo que leyó la fila.

## Lo medido

Reportado por el Agente Desplegado de *Correr IAs locales* (Propósito: correr LLMs locales), con el control **Textual** —idéntico carácter a carácter— en las tres instalaciones:

| Repo | Filas del registro | ¿Con comillas? | ¿Detecta? |
|---|---|---|---|
| Agente-Coordinador | 1 | sí | sí |
| Correr IAs locales | 7 | no | **ninguna** |
| analisis-particion-sucesion-melody | 14 | no | **ninguna** |

Y midió el banco de pruebas del control en un árbol de prueba fuera del repo (no bajo `tmp/`, que el control excluye por diseño y contaminaba la medición):

- registro sin comillas → **8 de 20** casos fallan;
- el mismo registro con comillas agregadas a las 7 filas → **6 de 20** fallan.

Las **seis** que fallan en las dos condiciones son independientes del formato: `pruebas.js` declara que corre **contra el registro real del repo** y usa como testigos `churn` (4 casos) y `capa de plugins` (2 casos), que son filas de *este* repo y no existen en ningún otro. Las otras dos dependen del formato porque usan `plomería`, el único testigo que aquel repo sí tiene vetado.

O sea: son **dos defectos superpuestos**, y el segundo no se arregla arreglando el primero. El banco que viaja mide el registro de este repo, no el mecanismo — el modo «fabrica medio escenario y el entorno pone el resto» del mismo conocimiento Local-0013.

## Los tres frentes

### (a) Lector único del registro de vetados

Mudar a `.claude/common/` la lectura del registro —cabecera, celdas con tuberías escapadas, y el desarme de la celda `Nombre` en términos— y que la requieran los dos: `lint-semantica.js` y `detectar-terminologia-vetada.js`. Precedente directo: `frontmatter.js` e `indices.js` ya viven ahí como única copia por esta misma razón, y el conocimiento Base-0001 (*Evitar el mismo dato escrito en varios lugares*) dice que lo decisivo no es que el dato esté dos veces sino que haya un control que compare. Acá el dato duplicado es el **contrato de lectura de la celda**, y no había ninguno.

**Dirección: tolerar, no exigir.** Quien puebla ese registro es un agente cualquiera de un repo cualquiera, y las comillas no tienen ninguna virtud funcional. Exigirlas y castigar el incumplimiento apagando el control es lo peor de los dos mundos; además dejaría descubierto a cada repo hasta que termine de corregir sus filas. El módulo común quita las comillas si están y separa por `,`, `;` y `/`.

Por el conocimiento Base-0004 (*La carpeta `.claude/common/`*), un módulo compartido viaja entero y **necesita prueba propia**: sus casos van al banco de `common/`.

### (b) Banco de pruebas con registro propio

`pruebas.js` deja de leer el registro del repo y trae su propio registro de prueba, co-ubicado. Se le indica al control por variable de entorno, así el contrato del hook no cambia.

Los términos testigo pasan a ser **datos de prueba**: palabras corrientes del español que no están vetadas en ningún registro real, declaradas como sintéticas (Preferencia Base-0009). Así el banco no depende de lo que este repo haya vetado ni de lo que vete el repo destino, y escribir el propio archivo de prueba no dispara el control.

El registro de prueba cubre a propósito las cuatro formas de la celda: con comillas, **sin comillas**, hermanas separadas por `/`, y expresión de varias palabras con acento. El caso sin comillas es la regresión que faltaba.

### (c) Formato documentado

El encabezado de `TERMINOLOGIA-FARLOPA.md` dice qué se acepta en la celda `Nombre` — y la copia que viaja en `base/`, que llega vacía, también. Es el único archivo del que un Agente Desplegado puede deducir el formato.

## Alcance

Toca `semantica`, `conducta`, `common` y `herramientas` (el módulo nuevo se registra). Lo de `common/`, `semantica/` y `conducta/` **viaja**: hay que sincronizar `base/` y publicar versión, o el arreglo no llega a ningún consumidor. Un parche local en el repo destino lo pisa el actualizador en la corrida siguiente, sin ninguna señal de que se perdió.

## Notas de implementación

Los tres frentes se implementaron el 20/08/2026, en la misma sesión en que se abrió el plan.

**(a) Lector único.** Nace `.claude/common/terminos-vetados.js`, que ubica las columnas por nombre —con la forma vieja `Término` aceptada—, respeta las tuberías escapadas y desarma la celda del término quitando las comillas simples invertidas **si están** y separando por `,`, `;` y `/`. Lo requieren los **tres** lectores, no dos: al implementar apareció que `lint-harness` tenía una tercera forma propia, que además no respetaba las tuberías escapadas. Se registró como Herramienta Base-0006 en el Índice del Agente Multipropósito, así que viaja (Decisión Local-0049).

**(b) Banco con escenario propio.** `pruebas.js` del control escribe su registro en un directorio temporal, apunta el control ahí con la variable de entorno `AMP_REGISTRO_VETADOS` —cuyo nombre vive en el módulo común, no en cada llamador— y lo borra al terminar. Los testigos son datos sintéticos. De 20 casos pasó a **25**: los nuevos cubren la fila sin comillas, las hermanas separadas por barra, la celda con resaltado, la columna vieja, el registro ausente, y uno que **ata la variable** —nombra un término que el registro real sí veta y exige silencio—, sin el cual el banco entero podría estar midiendo otra cosa.

**Verificado que el banco caza la regresión:** reintroducido el defecto original en el módulo común (extraer solo lo que está entre comillas y saltear la fila que no las trae), el banco pasa a **5 de 25 en rojo**. Restaurado el módulo, vuelve a verde. Sin esa comprobación el banco podría estar verde por no medir nada.

El módulo común sumó además **24 casos** al banco de `common/` (Base-0004, *La carpeta `.claude/common/`*: lo compartido viaja entero y necesita prueba propia). El banco pasó de 46 a 70 casos.

**(c) Formato documentado** en el encabezado del registro y en la copia que viaja, más una nota que dice quién lee la celda y por qué el lector es uno solo.

**Corrección al diagnóstico inicial:** se había dicho que las ocho pruebas rojas fallaban con o sin comillas. Son **seis**; las otras dos dependían del formato, porque usaban el único testigo que aquel repo sí tenía vetado. Medición del Agente Desplegado consultante, en un árbol de prueba fuera del repo.

**Cierre:** control de cierre con los diez lints, las pruebas de los controles y `claude plugin validate` en verde. Decisión Local-0072. Publicado en `amp` 0.47.0.

**Salvedad de proceso:** el plan se abrió y se cerró en la misma sesión, así que no pasó por los estados intermedios que prevé el grafo de `ESTADOS.md` (`Análisis`, `Listo`, `En curso`). El registro guarda el estado actual, no la historia.
