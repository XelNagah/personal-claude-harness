# 0071 — La Base declara lo que trae

> **Reemplazada por la Decisión Local-0076** (*La Base no lleva índice de lo que trae: se lista la
> carpeta `base/`*) el 21/08/2026. El índice generado que esta página describe **no se construyó**:
> se descartó por sobreingeniería antes de escribirlo. `base/` ya declara qué trae por el solo hecho
> de tener el archivo adentro, y un índice derivado del mismo recorrido que lo genera no puede
> contradecirlo ni agregarle nada — solo puede quedar viejo. La página se conserva por lo que sí
> sigue en pie: las tres formas de llegada (`copiado`, `generado`, `fragmentos`), que son el problema
> real que la regla nueva no cubre sola y que el plan Local-0106 resuelve del lado del destino.

## Qué se decidió

La carpeta `base/` lleva un **índice generado** que enumera lo que el Agente Multipropósito instala
en `.claude/`. Una fila por componente de primer nivel, con **cómo llega**:

| Cómo llega | Qué significa | Ejemplos |
|---|---|---|
| `copiado` | El archivo viaja tal cual desde `base/` | las nueve casas, `common/`, `output-styles/` |
| `generado` | Lo crea `amp:inicializar` en el destino, con contenido propio del repo | `identidad.md`, `tmp/` |
| `fragmentos` | El Agente Multipropósito le escribe partes por merge a un archivo que no es suyo | `settings.json` |

Lo genera `sincronizar-base` al publicar; `lint-harness` lo compara contra `base/` en los dos
sentidos. Ratificado el 2026-08-20.

## Por qué

Dos controles necesitan la misma respuesta —*¿esto lo puso el Agente Multipropósito?*— y hoy ninguno
la tiene:

- **`sincronizar-base` recorre `base/`, que es el destino.** Un Componente de Subsistema nuevo de la
  Base es invisible: nunca viaja, y ninguna corrida lo menciona.
- **`inventariar-componentes-sueltos` decide con una lista escrita a mano.** Medido el 20/08/2026
  sobre los diez Agentes Desplegados de la máquina: marca `output-styles/` como suelto en los diez.
  Es un hallazgo permanente y sin acción posible, que el conocimiento Local-0013 (*Controles que
  dejan de controlar sin avisar*) ya fijó como defecto del control.

El índice **viaja adentro del plugin** —igual que `base/`, que `amp-actualizar.js` ya resuelve como
carpeta hermana—, así que las dos puntas leen la misma fuente.

## Por qué esta lista sí, y las que 0045 eliminó no

La Decisión Local-0045 dice que *«la estructura reemplaza a toda lista: no hay catálogo de qué
instalar ni de qué comparar»*. Los tres defectos que enumera —el Componente que nadie agregó no
viaja, el que nadie agregó no se actualiza, y las dos copias se separan sin aviso— tienen la misma
causa: **dependían de que una persona se acordara**.

Un índice derivado del recorrido y comparado por lint no depende de eso. La estructura sigue
mandando; el índice es su lectura escrita, no una fuente paralela.

## Lo que no se deriva

`generado` y `fragmentos` no salen del recorrido: son tres renglones escritos en `sincronizar-base`.
Es el precio, y es también lo que hace que el índice aporte algo que recorrer las carpetas de `base/`
no daría — sin esas filas, el inventario del destino seguiría marcando `identidad.md` y `tmp/` como
sueltos.

## Alternativas descartadas

- **Un Tipo nuevo en el Índice de Herramientas del Agente Multipropósito**, siguiendo la línea de las
  Decisiones Local-0032 y Local-0050. Habría sido la tercera ampliación de qué es una Herramienta,
  para cosas que no se invocan.
- **Que cada archivo declare su `origen` en el frontmatter**, que es lo más afín a 0045. Cubre uno de
  los tres casos: `identidad.md` no tiene frontmatter, `tmp/` es una carpeta vacía, y meterle una
  clave ajena al frontmatter del Estilo de Respuesta arriesga que Claude Code lo ignore — y un estilo
  apagado no avisa.
- **Un Índice nuevo de componentes sin casa.** La Decisión Local-0032 ya descartó la categoría
  estructural nueva por un motivo que aplica igual: suma un componente que el Patrón no contempla.
