**Estado: Nuevo · Creado 26-08-06.**

# Barrer «nivelar» y reemplazarlo por «actualizar»

El 06/08/2026 el usuario ratificó que el término del dominio para poner al día una instalación existente es **`actualizar`**, y que al mecanismo que lo hace se lo llama **el actualizador**. `nivelar` se había colado en la conversación y de ahí al texto escrito, sin que nadie lo ratificara nunca: *"la verdad que «nivelar» se debe haber colado en nuestras conversaciones como terminología, pero yo en mi cabeza tengo «actualizar»"*.

Asentado en el glosario (Local-0019, redefinido de `Nivelar` a `Actualizar`) y vetado en Terminología Farlopa (Local-0042). Este plan es el **barrido del texto vivo**, que quedó afuera de esa ratificación por tamaño.

## Por qué es el barrido más grande medido

Medido el 06/08/2026 sobre el texto vivo, sin `.claude/tmp/` ni el histórico de planes ejecutados y descartados:

| Zona | Apariciones | Qué arrastra |
|---|---|---|
| `funcionalidades/` (viaja en los plugins) | 130 | subir versión de plugin y publicar |
| — de esas, en `base/` | 76 | se instalan en **cada** Agente Desplegado |
| `.claude/decisiones/` + registros | 104 | decisiones asentadas, texto que no se reescribe a la ligera |
| `.claude/planes/pendientes/` | 79 | planes vivos |
| **Total a barrer** | **432** | en **137 archivos** |

El lint marca hoy **311** de esas: la diferencia son las que autoexcluye —`.claude/semantica/`, `.claude/tmp/` y el histórico—.

**El sustantivo es el 61% del trabajo.** Las formas, contadas:

| Forma | Veces |
|---|---|
| `nivelador` | 304 |
| `nivelar` | 120 |
| `nivela` | 28 |
| `nivelado` | 26 |
| `nivelan` | 10 |
| `nivelarlos` · `nivelarlo` · `nivelarse` | 9 |

## El reemplazo

- `nivelar` / `nivela` / `nivelan` → **`actualizar`** y sus conjugaciones.
- `nivelador` → **`el actualizador`**.
- `nivelación` → **`la actualización`**.

Frases que hoy están instaladas en los Agentes Desplegados y cambian: *"El nivelador no toca este archivo"* pasa a *"El actualizador no toca este archivo"*, en los cinco Índices que la llevan.

⚠️ **No es buscar y reemplazar a ciegas.** Hay tres poblaciones, como en el barrido de `harness`:

1. **Texto plano** — se reescribe.
2. **Identificadores** — `amp-actualizar.js` ya se llama bien, pero hay variables, funciones y nombres de caso de prueba con la palabra adentro. Tocarlos es refactor: se listan, no se reemplazan solos.
3. **Registros históricos** — planes ejecutados y descartados no se tocan: reescribir el pasado falsea el registro.

## Por qué el veto entró como `avisa` y no como `bloquea`

Con 432 apariciones vivas, `bloquea` haría que editar cualquiera de esos 137 archivos se rechace, y el barrido dejaría de poder hacerse por partes. Cuando el barrido cierre, **evaluar si la fila Local-0042 pasa a `bloquea`**: `nivelar` no tiene uso corriente en este repo —no se nivelan terrenos ni cargas—, así que el falso positivo sería improbable.

## Trabajo

1. ~~**Barrer lo que viaja**~~ · 2. ~~**Barrer `.claude/`**~~ — hechos el 06/08/2026, de una sola pasada. Ver abajo.
3. ~~**Subir versiones**~~ — `amp` 0.35.0, `amp-preferencias` 0.10.0, `amp-semantica` 0.10.0. **Falta publicar.**
4. ~~**Verificar**~~ — hecho: 20 bancos en verde, 11 chequeos del control de cierre en verde salvo los tres avisos de «falta publicar».
5. **Decidir** si Local-0042 pasa a `bloquea`. Ahora que el texto vivo está barrido, la razón para haberla puesto en `avisa` desapareció.

## Ejecutado el 06/08/2026

**360 apariciones barridas en 124 archivos**, con un script de reemplazo morfológico de once formas, largo a corto para que `nivelar` no se coma a `nivelarlos`. Quedó cero en el texto vivo: lo único que sobrevive es cita legítima —la fila del veto y este plan, que hablan *sobre* el término—.

El barrido pudo ser mecánico por un dato que se midió antes de tocar nada: **no había un solo identificador** con la palabra pegada a otras letras. Las 119 apariciones en `.js` eran comentarios, mensajes de consola y las expresiones regulares de prueba que buscan esos mensajes — que cambian juntas y por eso no rompieron nada.

### Las tres trampas que aparecieron, y qué las causó

1. **Enlaces del registro al histórico.** `PLANES.md` enlaza a dos planes ejecutados con la palabra en el nombre del archivo, y esos archivos no se renombran. Reemplazar el texto del enlace lo rompía. Se protegieron las filas cuyo Detalle apunta a `ejecutados/` o `descartados/`: son histórico, y su Nombre es la identidad de un archivo que no cambia.
2. **La protección por línea es gruesa.** Una línea que mezcla un enlace al histórico con texto vivo se saltea entera: sobrevivió una aparición en el plan `Subagentes como componente distribuible del AMP`, corregida a mano. Con más volumen habría que proteger el enlace, no la línea.
3. **Excluir una carpeta excluye de más.** Se dejó afuera `.claude/semantica/` para no tocar el registro que define el veto, y eso alcanzó también al lint co-ubicado, que sí debía barrerse. Lo cantó `lint-harness` con `LO QUE VIAJA DIFIERE DE LO INSTALADO`: la copia de `base/` se había barrido y la viva no. La exclusión correcta era de los dos registros, no de la carpeta.

**Dos planes vivos tenían la palabra en el título.** El Local-0092 pasó a `Garantizar que actualizar un Agente Desplegado no rompa nada` y su archivo se renombró con `git mv`. Este plan **conserva** la palabra en el título y en el nombre de archivo: es la cita de lo que barre.

**Origen:** se desprende del plan Local-0092 (Garantizar que actualizar un Agente Desplegado no rompa nada), en cuya sesión salió a la luz al revisar la terminología de una decisión.
