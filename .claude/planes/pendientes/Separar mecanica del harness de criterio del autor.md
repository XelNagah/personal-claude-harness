# Separar mecánica del harness de criterio del autor

**Estado: Nuevo · Creado 26-07-20.** Surgió el 26-07-20 al decidir dónde escribir una preferencia nueva (no usar analogías deportivas). Javier: *"este repo eventualmente va a servir para otras personas que no tienen porqué compartir mi criterio."*

## El problema

`PREFERENCIAS.md` tiene dos secciones, **Base** (viene del harness, viaja a todos los repos, versionada) y **Adaptaciones** (del repo, el nivelado nunca la toca). Esa línea separa **lo que viaja de lo que no**. No separa **lo que es del producto de lo que es del autor** — y son dos cosas distintas.

Hoy la Base ya está cargada de criterio personal:

| Regla en la Base | ¿Mecánica del harness? |
|---|---|
| "Dar SIEMPRE ejemplos concretos de cada postura" | No — preferencia de comunicación de Javier |
| "Español corriente en todo" | No — criterio de estilo |
| "Nomenclatura en español para el dominio; inglés solo para infraestructura" | No — y para alguien que trabaja en inglés es directamente hostil |
| "Cero invención de datos" | Discutible: casi universal, pero sigue siendo una postura |
| "Conceptual antes que implementación" | No — método de trabajo |

Y fuera de preferencias hay más: la memoria de estilo de commits impone **commits en español y sin co-autoría de IA** a todo repo que se inicialice.

**Consecuencia concreta:** alguien instala el harness para un proyecto en inglés y recibe "nomenclatura en español para el dominio" como si fuera parte del producto. No tiene forma de saber que eso es gusto del autor y no una pieza del sistema — están en el mismo bloque, con el mismo número de versión, y el nivelado se lo va a reimponer cada vez que actualice.

## Direcciones a evaluar

1. **Tres capas** — mecánica del harness / criterio del autor (ejemplo, editable) / adaptaciones del repo. La más clara conceptualmente; hay que ver si el versionado sigue funcionando con tres bloques y qué hace el nivelado con la capa del medio si el usuario la editó.
2. **Dos capas, Base adelgazada** — la Base queda solo con mecánica, y el criterio del autor se distribuye como un *perfil* opcional que el usuario elige aplicar o no al instalar. Más trabajo de instalador, pero el default deja de imponer gusto ajeno.
3. **Dejarlo y documentarlo** — la Base es declaradamente opinada; se avisa en el README y el usuario borra lo que no le sirve. Costo cero, pero cada nivelado se lo devuelve.

## Preguntas abiertas

- ¿Aplica solo a preferencias, o también a las memorias que el orquestador instala (estilo de commits es el caso claro)?
- Si hay una capa de criterio del autor, ¿el nivelado la actualiza o la respeta una vez editada? Es la misma pregunta que ya resuelve la Base por versión, pero acá la respuesta correcta puede ser la opuesta.
- ¿Esto es una decisión estructural (entra al registro de decisiones) o alcanza con el plan?

## Depende de

Conviene resolverlo **antes** de que el repo se comparta con otras personas. Mientras sea de un solo usuario el problema no se nota.
