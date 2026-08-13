# Arquitectura del repo

Para ubicarse: qué es cada cosa que se ve en la raíz, cómo se relacionan, y qué hace cada uno de los diecinueve scripts.

Este documento es **documentación del proyecto** —está para leerlo un humano que necesita orientarse—, no conocimiento de agente. Lo que el agente sabe vive en `.claude/conocimiento/`.

---

## 1. Las tres caras, y por qué cuesta ubicarse

Este repo es **tres cosas a la vez**, y casi toda la confusión viene de que dos carpetas parecidas pertenecen a caras distintas.

**(a) Es la fuente del Agente Multipropósito.** El producto: el conjunto de subsistemas que se instala sobre cualquier repo para que un agente de código acumule lo que aprende. Eso vive en `funcionalidades/`.

**(b) Es el marketplace que lo distribuye.** El catálogo de plugins de Claude Code que sirve ese producto, en `.claude-plugin/marketplace.json`. Nueve plugins: el transversal `amp` más uno por subsistema.

**(c) Es él mismo un Agente con Propósito.** Tiene el producto **instalado y en uso**, en `.claude/`. Sus planes, sus decisiones, su glosario son los de este proyecto, no plantillas.

De ahí sale la trampa central: **el mismo contenido existe dos veces**, una como lo que este repo usa (`.claude/`) y otra como lo que viaja al instalarlo (`funcionalidades/amp/skills/inicializar/base/`). No son copias casuales: hay un script que las sincroniza y controles que vigilan que no se separen. Es la sección 3.

Una consecuencia práctica: **nunca se corre `amp:actualizar` sobre este repo**. Actualizar sirve para un repo que *consume* el producto; acá los archivos son la fuente.

---

## 2. Qué es cada cosa de la raíz

| Qué ves con `ls` | Qué es | Cara | Quién lo lee |
|---|---|---|---|
| `AGENTS.md` | **La fuente única de instrucciones del repo.** Describe el proyecto e importa los ocho manifiestos de subsistema. Todo lo normativo se edita acá. | (c) | Codex CLI nativo; Claude Code por el adaptador |
| `CLAUDE.md` | Adaptador de **una línea** (`@AGENTS.md`), porque Claude Code no lee `AGENTS.md` nativo. No se le agrega contenido. | (c) | Claude Code |
| `README.md` | Presentación pública del proyecto: qué es y para qué sirve. | (a) | quien llega al repo |
| `REGISTRO.md` | Catálogo de las nueve funcionalidades: qué plugin y qué skills trae cada una, y el procedimiento para agregar otra. | (a) | quien desarrolla el producto |
| `funcionalidades/` | **El producto.** Una subcarpeta por plugin, cada una con su `plugin.json`, su `README.md` y sus skills. | (a)+(b) | el marketplace al instalar |
| `.claude-plugin/` | Solo `marketplace.json`: el catálogo `xelnagah-harness` con los nueve plugins. Es lo que se agrega con `/plugin marketplace add`. | (b) | el CLI de plugins |
| `.claude/` | **Los datos de los subsistemas de este repo**: sus planes, decisiones, conocimiento, glosario, preferencias. Más `settings.json` (hooks) e `identidad.md` (Título y Propósito). El nombre es cosmético — es la casa de datos para **todos** los agentes, no solo Claude. | (c) | todos los agentes |
| `.codex/` | Solo `hooks.json`: los mismos tres hooks que `settings.json`, en el formato de Codex CLI. Registro doble para que los dos agentes se comporten igual. | (c) | Codex CLI |
| `docs/` | Documentación larga para humanos: `INSTALAR.md` y este archivo. | (a) | el usuario |
| `.gitignore` | Excluye `settings.local.json` (config de máquina), `.claude/tmp/` (temporales y traspasos) y `.claude/.respaldo-amp/` (el respaldo de un solo uso del actualizador). | — | git |
| `.gitattributes` | Normalización de fin de línea. | — | git |
| `.codex-remote-attachments/` | **Sin seguimiento y sin dueño conocido.** Viene de hace varias sesiones; nadie determinó qué es. | ? | ? |

Dentro de `.claude/` hay además dos carpetas que no son subsistemas: `skills/` (skills locales de este repo, como `agregar-funcionalidad`) y `tmp/` (temporales, ignorada por git y excluida de todos los barridos).

---

## 3. El mismo contenido, de los dos lados

```
   .claude/                    ──── sincronizar-base ────▶    funcionalidades/amp/skills/inicializar/base/
   (vivo: lo que este repo usa)                               (lo que viaja adentro del plugin, 74 archivos)
        ▲                                                                    │
        │                                                                    │ amp:inicializar copia el árbol
        │                                                                    ▼
        └──────────  lint-harness compara los dos lados  ────────  el .claude/ de un repo consumidor
```

`base/` tiene **el mismo árbol** que el destino: `base/planes/lint-planes/lint-planes.js` se instala en `.claude/planes/lint-planes/lint-planes.js`. Instalar es copiar ese árbol, no transcribir texto. Por eso no hay ninguna lista de componentes que mantener al día — y no puede quedar afuera uno que nadie agregó a una lista.

**La regla de qué se copia la declara cada archivo en su propio frontmatter**, no una lista:

| Lo que dice el archivo | Qué es | Qué viaja |
|---|---|---|
| sin frontmatter, u `origen: agente-multiproposito` | mecanismo o registro que manda el producto | **el archivo entero** |
| `origen: agente-desplegado` | registro que puebla cada repo | **solo hasta el separador de su tabla** |

El corte importa en los dos sentidos. Si un registro del repo viajara entero, todo repo nuevo nacería con las entradas de este —ya pasó una vez, con seis Herramientas coladas—. Si no viajara nada, el encabezado quedaría viejo para siempre: arriba de la tabla están la convención y las columnas, que las manda el producto y cambian con él.

**Editar un lint, un manifiesto o una preferencia = editar el archivo de `.claude/` y correr `sincronizar-base --aplicar`.** Nunca al revés.

---

## 4. Anatomía de un subsistema

Los ocho tienen la misma forma (el *Patrón*), y `.claude/<sub>/` contiene siempre:

- **`MANIFIESTO.md`** — descripción breve que va **siempre en contexto**: qué es, cuándo consultarlo, qué skills lo operan, y qué Índices tiene. Es lo que `AGENTS.md` importa.
- **Uno o dos Índices** — el registro en sí. Hay dos cuando el contenido viene de dos orígenes: lo que manda el producto y lo que suma el repo.
- **`README.md`** — la convención completa. No va en contexto: se lee cuando hace falta.
- **`lint-<sub>/`** — el control mecánico del subsistema.

| Subsistema | Qué guarda | Índices | ¿El manifiesto carga su Índice? |
|---|---|---|---|
| `subsistemas` | El catálogo de las casas que existen | `SUBSISTEMAS.md` · `SUBSISTEMAS-LOCAL.md` | **sí** |
| `preferencias` | Cómo el usuario espera que el agente trabaje | `PREFERENCIAS.md` · `PREFERENCIAS-LOCAL.md` | **sí** |
| `conocimiento` | Lo que el agente averiguó y va a necesitar de nuevo | `INDICE.md` | **sí** |
| `herramientas` | Las tools del Propósito y cómo se invocan | `INDICE.md` · `INDICE-LOCAL.md` | **sí** |
| `planes` | Los planes y su ciclo de vida | `PLANES.md` (+ `ESTADOS.md`, configurable) | no — es el registro más pesado |
| `semantica` | Vocabulario legítimo y relaciones vetadas | `GLOSARIO.md` · `TERMINOLOGIA-FARLOPA.md` | no — a demanda |
| `decisiones` | Las decisiones estructurales del repo | `INDICE.md` | no — a demanda |
| `conducta` | Reglas atadas a un momento del flujo | `INDICE.md` · `INDICE-LOCAL.md` (+ `MOMENTOS.md`, `CLASES.md`) | no — **a propósito**: una regla cargada al inicio se recita, no se obedece |

El sufijo `-LOCAL` solo distingue dos archivos que conviven. **Lo que decide el trato es el `origen` del frontmatter, no el nombre.**

---

## 5. Los diecinueve scripts, por familia

Todos son Node sin dependencias, sin red y sin modelo de lenguaje. Ninguno necesita instalación.

### 5.1 Lints de subsistema (8) — «¿este subsistema está bien?»

Cada uno mira **solo adentro de su propio subsistema**. Todos **reportan y no fallan**: salen con código 0 aunque encuentren cosas, porque describen el estado del repo y no un error. Se corren a demanda al cerrar una tarea que tocó ese subsistema, y todos juntos con `ejecutar-control-cierre`.

| Script | Qué controla |
|---|---|
| `lint-subsistemas` | Que el catálogo coincida con el disco: casas duplicadas, faltantes, manifiestos |
| `lint-preferencias` | Un Índice por origen, el núcleo de columnas de cada fila, las páginas de detalle y la cadena de importación |
| `lint-planes` | Estado contra carpeta, sueltos en la raíz, cierres a medias, ejecutados sin notas, activos envejecidos. Lee los estados de `ESTADOS.md`, no los tiene escritos adentro |
| `lint-conocimiento` | Referencias rotas, índice incompleto, páginas huérfanas |
| `lint-semantica` | Los dos registros pares: colisiones término↔vetado, propuestos pendientes, apariciones de vetados en el repo |
| `lint-decisiones` | Numeración, links de detalle, huérfanos, reemplazos |
| `lint-herramientas` | README por Herramienta, filas colgadas, referencias por ruta en `settings` |
| `lint-conducta` | El registro de reglas contra el vocabulario de momentos |

⚠️ **`lint-decisiones` toma el primer argumento como carpeta**, así que pasarle `--quiet` lo manda a una ruta inexistente y **contesta en verde sobre cero decisiones**. Correrlo sin flags.

### 5.2 Los del subsistema `conducta` (3) — no se invocan a mano

Viven en `.claude/conducta/`, no en `herramientas/`, y **no están en el registro de Herramientas**: son infraestructura del subsistema. Los dispara el agente en momentos del flujo, cableados en `.claude/settings.json` y `.codex/hooks.json` en tres eventos: al arrancar la sesión, en cada mensaje del usuario, y antes de escribir un archivo.

| Script | Qué hace |
|---|---|
| `establecer-conducta` | **El repartidor.** Lee el registro vivo de reglas, resuelve qué momento realiza el evento que lo disparó, y despacha las reglas de ese momento según su clase (inyectar un texto, ejecutar algo, bloquear) |
| `detectar-terminologia-vetada` | Chequea el contenido que se está por escribir contra el registro de relaciones vetadas **antes de que el archivo exista**. Rechaza el término sin uso legítimo posible; informa los que dependen del significado |
| `mostrar-pantalla-bienvenida` | La caja de estado del arranque: Título, Propósito y métricas de cada subsistema. La entrega una regla de conducta, así que la dispara el repartidor — no se corre a mano |

### 5.3 Herramientas del repo (7)

Las tools que el Propósito de este repo necesita. Las dos primeras son del producto y viajan a cada repo instalado; el resto son de este repo y no viajan.

| Script | Qué hace | Cuándo se corre |
|---|---|---|
| `actualizar-plugins` | Diagnostica los plugins de esta máquina y detecta los cuatro desfases (marketplace viejo, plugin faltante, el silencioso —traído pero no cargado— y la dependencia sin declarar, que deja al plugin que la pide sin cargar y sin señal). Con `--aplicar` los pone al día | Antes de actualizar, y al publicar |
| `instalar-plugins-codex` | Instala el paquete en Codex CLI resolviendo las dependencias en orden, que Codex no resuelve solo | Al configurar Codex |
| `sincronizar-base` | **Decide qué viaja.** Copia de `.claude/` a `base/` aplicando el corte por frontmatter de la sección 3. Sin `--aplicar` solo informa | Después de editar cualquier componente |
| `lint-harness` | El control de coherencia del producto: disco contra marketplace contra `REGISTRO.md`, los dos lados de la sección 3 en ambos sentidos, tamaño y estructura de los manifiestos, versión en disco contra la instalada, y terminología vetada en lo que viaja | Al cerrar cualquier tarea |
| `ejecutar-control-cierre` | **Decide si el repo está verde.** Corre los ocho lints —descubiertos, no escritos adentro—, las pruebas de los controles, el banco de `ejecutar-pruebas` y `claude plugin validate`. Reporta y sale con 0; con `--estricto` sale con 1 si algo no está verde, para el guion que tiene que frenar | Al cerrar; y la invoca la Pantalla de bienvenida |
| `ejecutar-pruebas` | Corre los dieciséis bancos de pruebas. Contesta lo que el control de cierre no puede: si los controles que lo declaran verde **siguen funcionando** | Al cerrar |
| `inventariar-componentes-sueltos` | Barre `.claude/` y lista lo que no es subsistema ni infraestructura conocida. **Hoy no lo invoca nada**: nació para un plan que sigue pendiente | A mano |

### 5.4 El actualizador (1)

| Script | Qué hace |
|---|---|
| `amp-actualizar` | El motor mecánico de `amp:actualizar`. Barre el `.claude/` de un repo **consumidor**, clasifica cada archivo contra lo que viaja en `base/` y emite el plan en cuatro grupos (instalar/pisar, renombres, divergente, ya estaba). Con `--vista-previa` no escribe; con `--respaldo` respalda fuera del repo, o lo omite si git ya cubre `.claude/`. **La aplicación no la hace él**: la ejecuta el agente leyendo el `SKILL.md` |

Vive en `funcionalidades/`, no en `.claude/`, porque viaja adentro del plugin y encuentra la carpeta que compara relativa a su propia ubicación.

### 5.5 Los bancos de pruebas (16)

Un `pruebas.js` co-ubicado con lo que prueba. A diferencia de los lints, **el código de salida sí manda**: una prueba que falla dice que un control está roto, no que el repo tenga algo.

La regla del repo: **un banco solo sirve si lo rompiste.** Cada uno se verificó rompiendo su control a propósito y viendo fallar el caso que corresponde.

---

## 6. Cómo verificar que todo está bien

Tres comandos que contestan **tres preguntas distintas**, y hacen falta los tres:

```bash
node .claude/herramientas/ejecutar-pruebas/ejecutar-pruebas.js          # ¿los controles sirven?
node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js   # ¿el repo está bien?
node .claude/herramientas/sincronizar-base/sincronizar-base.js          # ¿lo que viaja está al día?
```

El orden importa: el control de cierre **les cree** a los lints, así que preguntar primero si los lints funcionan es lo que evita el verde vacío. Un control que valida sobre un conjunto vacío contesta que todo está bien.

Al 31/07/2026 daban 16 bancos verdes, 10 chequeos verdes y 74 archivos al día.

Para el estado de los plugins de la máquina, que es otra cosa:

```bash
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --agente claude
```
