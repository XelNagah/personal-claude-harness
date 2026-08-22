# inventariar-componentes-sueltos

Barre `.claude/` y lista los **componentes (archivos y carpetas) que no pertenecen a nada declarado**. Es el único control que mira lo que quedó fuera de todo subsistema: los lints barren cada uno adentro de su propia casa, y nadie miraba el pasillo.

**Inventaría, no juzga.** Solo dice "esto está fuera de todo lo declarado"; qué hacer con cada cosa lo decide un humano, contra el **Test de demarcación**.

```bash
node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js            # este repo (cwd)
node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js <rutaRepo> # apuntar a otro repo
node .claude/herramientas/inventariar-componentes-sueltos/inventariar-componentes-sueltos.js --quiet     # calla si no hay hallazgos
```

## Alcance: solo `.claude/`

La raíz del repo **no se toca**: ahí vive el Producto del Propósito, que legítimamente no pertenece a ningún subsistema, y barrerla marcaría el trabajo real de cada repo como sospechoso. Lo resolvió en ese sentido el Test de demarcación.

## Cómo sabe qué es legítimo

De los **registros del propio repo**, no de una lista escrita adentro del código. La lista escrita existió, se declaraba «corta y estable a propósito» y se rompió apenas el Agente Multipropósito sumó una carpeta: medido el 20/08/2026, los diez Agentes Desplegados de la máquina marcaban `output-styles/` —que el propio Agente Multipropósito les había instalado— como suelto. Un hallazgo permanente que nadie puede llevar a cero es defecto del control (el conocimiento *controles que dejan de controlar sin avisar*).

Cada hijo directo de `.claude/` cae en uno de cinco grupos, evaluados en este orden:

1. **Subsistema reconocido** — lo declara el catálogo de `subsistemas/`, tiene su lint co-ubicado, o tiene adentro un Índice que se declara a sí mismo en su frontmatter. Las tres señales se suman: un Agente Desplegado con el harness viejo no tiene catálogo, y una casa recién creada todavía no está anotada.
2. **Declarado por un Índice de Subsistema** — algún Índice lo enlaza. Así se reconoce `common/`, que no es subsistema ni infraestructura; y así una Herramienta o una skill del Propósito quedan reconocidas apenas se registran, sin tocar este código.
3. **Infraestructura conocida** — los únicos nombres escritos a mano, porque son justamente lo que ningún Índice declara: lo que el Agente Multipropósito pone sin copiarlo (`identidad.md`, y los fragmentos que le escribe a `settings.json`), el Estilo de Respuesta del Modelo del Agente (`output-styles/`) y las carpetas estándar del CLI (`skills/`, `commands/`, `agents/`, `hooks/`). Envejece solo si Claude Code suma una carpeta estándar — no cada vez que el harness crece, que era el ritmo que rompió la lista anterior.
4. **Material de trabajo** — lo que git no versiona. Se informa en su propio grupo y **no** cuenta como hallazgo, pero se informa: una carpeta del Propósito mal ubicada que además esté gitignoreada tiene que seguir a la vista.
5. **Componente suelto** — todo lo demás. Es lo que el chequeo reporta.

### Por qué no se lista la carpeta que viaja en el plugin

La decisión que fijó que lo que está en `base/` viaja nombra el árbol de `base/` como la fuente del destino. No se implementó así: `base/` no llega al repo sino al depósito de plugins de la máquina, con una versión adentro. Alcanzarla obligaría a leer la configuración de plugins —distinta en Claude Code y en Codex— y no tendría respuesta en un repo instalado por copia. Leer los registros del repo además lo describe **a él**, y no a la versión del plugin que haya en el depósito, que es la trampa asentada en *el repo que un script describe*.

### El criterio de git se apaga solo, y lo dice

Si `.claude/` **entero** está fuera del control de versiones, el grupo 4 se traga todo y el reporte contesta cero. Medido el 21/08/2026 en un Agente Desplegado con el harness viejo: sus hallazgos reales —el `memory/` de la generación retirada entre ellos— desaparecían, y un reporte en cero se lee como "está todo bien". Ahí el criterio se apaga, el reporte avisa que se apagó, y lo no declarado vuelve a salir como hallazgo.

## Salida

Formato `[SECCIÓN] (N)` como el resto de la familia de lints. Con `--quiet` calla si no hay componentes sueltos. Sin `process.exit(1)`: reporta, no frena (capa mecánica).

Corre a demanda, no cableada al control de cierre: cablearla convertiría el inventario en veredicto, y además el control de cierre no viaja, así que en un Agente Desplegado no hay dónde engancharla.

## Pruebas

```bash
node .claude/herramientas/inventariar-componentes-sueltos/pruebas.js
```

Fabrica un repo sintético entero, con su propio `git init`. Cada fuente de reconocimiento se prueba con su par —algo que esa fuente tiene que reconocer y algo que no, y que sí tiene que salir como hallazgo—: un banco que solo probara el reconocimiento no distinguiría una fuente que anda de una que reconoce todo.
