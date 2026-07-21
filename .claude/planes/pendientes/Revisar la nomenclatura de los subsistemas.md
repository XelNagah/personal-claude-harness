# Revisar la nomenclatura de los subsistemas

**Estado: Nuevo · Creado 26-07-20.** Origen: el 26-07-20, en plena sesión de limpieza de terminología, Javier preguntó *"¿Qué es 'en la base'? no te entiendo"* — sobre un concepto central de su propio proyecto, que él mismo definió.

## El síntoma vale más que el caso

No es que faltara explicación: es que **el nombre no comunica**. Si el autor del repo, con el archivo delante, no reconoce qué nombra "Base", ningún usuario nuevo lo va a reconocer. El nombre está haciendo cero trabajo y toda la carga la lleva la documentación alrededor.

## En qué se diferencia del plan de veto

[Vetar términos y ratificar alias](Vetar%20terminos%20y%20ratificar%20alias%20en%20el%20glosario.md) ataca **anglicismos y palabras inventadas**: `gate`, `slug`, `verbatim`. El arreglo es traducir.

Este plan ataca algo que ese no ve: **nombres en español, correctos, y aun así opacos**. "Base" es una palabra castellana impecable que no dice de qué es base. Traducir no lo arregla porque ya está en español. Son dos fallas distintas y hay que correr los dos.

## Candidatos a revisar

Todos los nombres que el harness le impone al usuario:

- **Preferencias:** `Base` (¿base de qué?), `Adaptaciones`, `nivelar`.
- **Subsistemas:** `Subsistema`, `Patrón`, `Funcionalidad` vs `plugin` vs `skill` (tres palabras que a veces nombran lo mismo y a veces no), `Herramienta` vs `tool`.
- **Patrón de índice:** `Entrada`, `Documento`, `Carpeta` — los tres definidos en el glosario, los tres genéricos.
- **Recién acuñados (26-07-20):** `Textual`, `Control`. Ratificados hace días; conviene pasarlos por el mismo examen antes de que se asienten.
- **Archivos:** `INDICE.md`, `PLANES.md`, `ESTADOS.md`, `MEMORIA.md`, `REGISTRO.md` — ¿se distingue `REGISTRO.md` (catálogo de funcionalidades) de `PLANES.md` (registro de planes) por el nombre?
- **Estados de planes:** `Nuevo`, `En curso`, `Diferido`, `Ejecutado`, `Descartado`. Estos parecen sanos; sirven de contraste de qué es un buen nombre acá.
- **Nombres de skills** (categoría nueva, 21/07/2026). Segundo caso confirmado del mismo síntoma, otra vez con el autor delante del archivo: sobre `ciclo-de-plan`, Javier dijo *"lo leo y no sé qué es eso, qué hace, ¿ciclo? ¿cuántos pasos tiene? wtf"*, y propuso el arreglo: *"si fuera lo que efectivamente dice, sería `crear-plan`, `guardar-plan`"*. O sea **verbo + objeto**, que es justo el patrón que ya usan las que sí se entienden (`registrar-memoria`, `registrar-decision`, `buscar-conocimiento`). Los sospechosos son los que se apartan de ese patrón: `ciclo-de-plan`, `converger-terminologia`, `inicializar-custom` (¿custom qué?), `propagar-harness`. Cruza con el plan de skills por subsistema: si de ahí sale una skill nueva por subsistema, conviene fijar el patrón de nombre **antes** de crearlas, no después.

## Criterio propuesto

Un nombre pasa si alguien que ve el repo por primera vez puede decir **qué guarda y para qué sirve** sin leer la definición. La prueba es leerlo en frío, fuera de contexto: *"Base"* solo no dice nada; *"Estados"* solo sí.

Segundo criterio, más duro: si el nombre necesita una glosa cada vez que aparece, el nombre perdió y la glosa es el nombre real. Es lo que ya pasó con `cementerio de tools`, que venía siempre acompañado de *"esa carpeta llena de archivos sueltos"*.

## Entregable

- Barrido de todos los nombres con veredicto: se queda / se renombra / a discutir.
- Los que se renombran: costo de propagación por cada uno (glosario, memorias, SKILL/PLANTILLA de funcionalidades, orquestador, repos consumidores).
- Ratificación de Javier fila por fila, igual que en el plan de veto.

## Preguntas abiertas

- ¿Se hace de una o por tandas? Renombrar `Base`/`Adaptaciones` toca las preferencias de los 9 repos consumidores.
- ¿Entra en el glosario un concepto por cada nombre revisado, o solo los que sobreviven?
- ¿Conviene esperar a [Separar mecánica del harness de criterio del autor](Separar%20mecanica%20del%20harness%20de%20criterio%20del%20autor.md)? Si esa capa se parte en tres, `Base` puede desaparecer como nombre y la discusión se vuelve otra.
