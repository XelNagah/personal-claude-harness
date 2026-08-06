# El repo que un script describe sale del directorio de trabajo, no de su ubicación

Un script que inspecciona "el repo" —diagnosticarlo, medirlo, actualizarlo— tiene que tomar la raíz del **directorio de trabajo** (`process.cwd()`), no deducirla desde su propia ubicación (`path.resolve(__dirname, '..', '..', '..')`).

Deducirla desde `__dirname` funciona mientras el script viva adentro del repo que describe. Deja de funcionar en cuanto existe **una segunda copia del script**, que en un proyecto distribuible aparece siempre:

- la copia **instalada** en cada repo consumidor;
- la del **marketplace bajado**, que es un clon del repo autor entero;
- la que viaja **dentro del plugin**;
- la del repo autor, donde el script se escribe.

Corrido desde cualquiera de esas copias, `__dirname/../../..` devuelve **la raíz de esa copia**, no el repo que el usuario está mirando.

## Por qué es peor que un error común

No falla ruidosamente: **contesta**. Y contesta algo coherente sobre el objeto equivocado, así que se lee como un diagnóstico válido. Tres consecuencias observadas el 26/07/2026, todas en la misma tarde:

- Una Herramienta de diagnóstico de plugins, corrida desde el marketplace bajado con el directorio de trabajo en el repo del usuario, informó los siete plugins como **no instalados** (ciertos para el marketplace, falsos para el repo) y **ningún nombre retirado** habiendo nueve.
- La misma Herramienta, con la opción de aplicar, **instaló siete plugins contra el marketplace bajado** en vez del repo, y le escribió un `settings.json` que ensució el clon de git.
- La Pantalla de bienvenida, probada desde un repo vacío, pintó el Título, el Propósito y las métricas **del repo del harness** — 35 decisiones y 65 planes que ese repo no tenía.

## La forma correcta

```js
// La ruta explícita gana; si no, el directorio de trabajo. Nunca __dirname.
const RUTA_ARG = process.argv.slice(2).find(a => !a.startsWith('--'));
const REPO = RUTA_ARG ? path.resolve(RUTA_ARG) : process.cwd();
```

Dos corolarios que se siguen de lo mismo:

- **Imprimir siempre el repo que se está describiendo**, en la primera línea de la salida. Es lo que destapó los tres casos de arriba: `== ACTUALIZAR PLUGINS: C:\Users\…\marketplaces\xelnagah-harness ==` decía exactamente lo que pasaba, y se leyó por encima.
- **Lanzar los subcomandos con `cwd: REPO`.** Un `claude plugin install --scope local` resuelve "el repo" contra el directorio donde corre, así que sin `cwd` explícito diagnostica un repo y escribe en otro.
- **Distinguir el repo apuntado del propio.** Lo que dependa de la sesión viva (qué plugins cargó, qué proceso arrancó cuándo) solo tiene sentido para el repo donde corre la sesión: con ruta explícita, ese chequeo se omite en vez de responder sobre una sesión que no existe.

**Cómo se verificó:** los tres casos son de esta máquina, el 26/07/2026, con salida textual del CLI y lectura del registro de plugins. El arreglo se probó en las tres situaciones —script corrido desde otra copia con el directorio de trabajo en el repo destino, corrido desde el repo propio, y apuntado por argumento— y en las tres devolvió el repo correcto.

**Cuándo aplica / cuándo no:** aplica a cualquier script que describa o modifique "el repo actual" y que se distribuya (por plugin, por copia o por clon). **No** aplica a los lints co-ubicados que validan su propio subsistema por ruta relativa a sí mismos: esos sí quieren su ubicación, porque su objeto es la carpeta que los contiene.

## El mismo error, un nivel más arriba

Arreglar **dónde está** el script no arregla **qué repo mira** el script: son dos preguntas distintas y la segunda sobrevive al arreglo de la primera.

El caso encontrado el 29/07/2026: al pasar los hooks de este repo a ruta absoluta, la raíz se tomó de `CLAUDE_PROJECT_DIR` dando por sentado que esa variable contesta *cuál es la raíz del repo*. Contesta otra cosa — *dónde arrancó la sesión* — y con la sesión abierta en un subdirectorio el hook se cae con `Cannot find module`. Misma familia: un dato que parece la respuesta, no falla ruidosamente, y contesta sobre otro objeto. Detalle y forma corregida en [`hooks-claude-code.md`](hooks-claude-code.md) §5.6.
