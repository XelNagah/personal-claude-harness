---
name: adoptar-recomendadas
description: Muestra el catálogo de Preferencias Recomendadas que trae el Agente Multipropósito y adopta las que el usuario elija, una por una, en el Índice del Agente Desplegado. Ninguna se instala sola. Use when el usuario dice "preferencias recomendadas", "qué preferencias me convienen", "traeme tus preferencias", "adoptá las recomendadas", o al terminar de inicializar un repo cuyo Índice de Preferencias quedó vacío.
---

# Adoptar Preferencias Recomendadas

El Agente Multipropósito trae un **catálogo de preferencias recomendadas**: elecciones de quien lo publica, ofrecidas como sugerencia. **Ninguna llega a un repo por instalar el plugin.** Esta habilidad las muestra, el usuario elige y lo elegido entra como Aprendizaje del Agente Desplegado, con Código propio.

Adoptar no crea vínculo con el catálogo: los cambios posteriores del catálogo no se propagan, igual que en cualquier copia puntual entre Agentes.

## Cuándo dispara

- Pedido directo: «mostrame las preferencias recomendadas», «adoptá las recomendadas», «qué preferencias me convienen».
- Después de inicializar un repo, si su Índice del Agente Desplegado quedó sin filas.
- Cuando el usuario quiere llevar a un repo nuevo el mismo criterio que ya usa en otros.

## Dónde vive el catálogo

En `recomendadas/`, dentro de la carpeta de esta habilidad. Tiene la **misma forma que un Índice de Preferencias** —frontmatter que lo declara, tabla `Código | Nombre | Descripción | Detalle` y las páginas de detalle al lado—, así que lo lee el mismo auxiliar que copia entre Agentes.

Los Códigos del catálogo son suyos y **no viajan**: cada adopción recibe un `Local-NNNN` del destino.

**El catálogo es derivado y no se edita a mano.** Quien publica el Agente Multipropósito lo regenera desde su propio Índice del Agente Desplegado con `sincronizar-recomendadas`.

## Flujo

1. **Ubicar el catálogo y el destino.** Resolver `recomendadas/` desde la carpeta de esta habilidad, nunca desde el repo destino. El destino es la raíz del repo actual, salvo que el usuario indique otro.

2. **Leer el subsistema del destino.** Partir de `.claude/preferencias/MANIFIESTO.md` y leer **todos** los Índices declarados. Sirve para no ofrecer lo que el repo ya tiene.

3. **Presentar el catálogo.** Mostrar, para cada recomendada, su Nombre y su Descripción completa —el usuario elige leyendo el texto que va a quedar rigiendo, no un resumen— y marcar el estado frente al destino:
   - **disponible:** no hay nada equivalente;
   - **ya estaba:** el destino tiene una entrada equivalente;
   - **divergente:** el destino tiene el mismo tema con contenido distinto; se informa y no se ofrece pisar.

4. **Que el usuario elija.** Puede tomar todas, algunas o ninguna. No adoptar por omisión ni recomendar «todas» como respuesta por defecto: el sentido del catálogo es que la elección sea explícita.

5. **Vista previa de cada elegida**, una por vez:

   ```bash
   node <ruta-skill>/../registrar-preferencia/scripts/incorporar-preferencia.js --catalogo <ruta-skill>/recomendadas --codigo <Base-NNNN> --destino <repo>
   ```

   Con lo que devuelve la vista previa, mostrar lo que va a quedar escrito en el destino —con el Código local ya asignado— con la forma de abajo, y esperar el visto bueno antes de aplicar: elegirla del catálogo aprueba adoptarla, no el texto con que queda. Acá los tipos son `FILA DE PREFERENCIA` y `PÁGINA DE DETALLE DE PREFERENCIA`.

<!-- forma-de-mostrar-lo-que-se-guarda: inicio -->
**Cómo se muestra lo que se va a guardar.** Antes de escribir, mostrarle al usuario lo que va a quedar escrito, con esta forma, y esperar su visto bueno. Un «sí» a «¿lo registro?» aprueba la acción, no un texto que el usuario no vio.

- **Lo primero, en una línea sola, es qué cosa se va a guardar**, como título en mayúsculas y negrita: `## **<TIPO> — NUEVA**` o `## **<TIPO> — MODIFICADA**`. El tipo dice la forma y de qué es: `FILA DE HERRAMIENTA`, `PÁGINA DE CONOCIMIENTO`, `PÁGINA DE DETALLE DE DECISIÓN`. Debajo, en qué archivo va a quedar. Nunca «la página», «la fila» o «el texto» a secas.
- **Fila nueva:** una línea por columna, con el nombre de la columna en negrita y la celda textual. Nunca la fila cruda `| … | … |`.
- **Fila modificada:** solo las columnas que cambian, cada una con su texto de antes y el de ahora —una celda larga va entera en los dos—; después se nombran las columnas que no cambian.
- **Página** (de conocimiento, de un plan, el detalle de una decisión): primero los datos del frontmatter, si los tiene, como lista igual que una fila nueva; después la lista de títulos de sección; después cada sección bajo su título, completa y renderizada, no dentro de un bloque de código. **Página modificada:** se nombran las secciones sin cambios y se muestran antes y ahora de las que cambian.
- Si se guardan varias cosas juntas —una fila y su página—, cada una lleva su propio título.

> ## **FILA DE HERRAMIENTA — NUEVA**
> Va a quedar en `.claude/herramientas/INDICE-LOCAL.md`.
>
> - **Código:** Local-0013
> - **Nombre:** …
> - **Descripción:** …

> ## **FILA DE DECISIÓN — MODIFICADA**
> Va a quedar en `.claude/decisiones/INDICE.md`.
>
> - **Estado:** antes `vigente` · ahora `reemplazada por Local-0043`
> - Sin cambios: Código, Nombre, Descripción, Fecha, Detalle.

> ## **PÁGINA DE CONOCIMIENTO — NUEVA**
> Va a quedar en `.claude/conocimiento/buscar-con-acentos.md`.
>
> **Datos de la página:**
> - **caduca:** no
>
> **Secciones:**
> 1. Qué pasa
> 2. Por qué
> 3. Cómo evitarlo
>
> **1. Qué pasa**
> …
<!-- forma-de-mostrar-lo-que-se-guarda: fin -->

6. **Aplicar**, repitiendo el mismo comando con `--aplicar`. El auxiliar asigna `Local-NNNN` como el mayor del Índice local más uno, copia la página de detalle si la hay, repara dentro de ella la referencia al Código del catálogo y no pisa nada divergente.

7. **Cerrar con el lint** desde la raíz del repo destino:

   ```bash
   node .claude/preferencias/lint-preferencias/lint-preferencias.js
   ```

8. **Reportar** en tres grupos: `agregado`, `ya estaba` y `divergente`, cada uno con su Preferencia resultante, Código y rutas. Informar además cualquier recomendada que el usuario no eligió, para que no parezca omitida por error.

## Límites

- Adopta preferencias y su página declarada en `Detalle`. Una recomendada que necesite Conducta, Herramientas u otro subsistema para cumplirse informa la dependencia y se coordina con el subsistema dueño.
- No promueve nada a la Base del destino: lo adoptado es siempre Aprendizaje del Agente Desplegado.
- No sincroniza. Si el catálogo cambia después, lo ya adoptado no se entera.

## Reconciliación (idempotencia)

Releer los Índices del destino antes de cada escritura. Una recomendada equivalente devuelve `ya estaba` sin escribir; una del mismo tema con contenido distinto devuelve `divergente` y no se pisa; una página de detalle preexistente con otro contenido tampoco. La vista previa y una cancelación no modifican nada. Correr la habilidad dos veces seguidas deja el repo igual que la primera.
