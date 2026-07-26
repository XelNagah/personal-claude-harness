# Migrar los repos instalados al alcance local

**Estado: Nuevo · Creado 26-07-26.** Origen: ejecución pendiente de la **decisión 0035**, que fijó el alcance `local` para el Agente Multipropósito el mismo día.

## Qué falta

La decisión está tomada y los textos ya la anuncian (marketplace, descripción del plugin, `REGISTRO.md`, manual). Lo que falta es **mover las instalaciones que quedaron en `project`**:

| Repo | Alcance actual |
|------|----------------|
| Inicializador de Repos Custom (este) | `project` |
| Agente-Coordinador | `project` |
| Impresión3d | `local` ✅ (ya migrado) |

## Cómo

Por repo: desinstalar los siete de `project` e instalar `amp` en `local`. **El orden importa** —instalar antes de desinstalar deja el repo sin skills en el medio— y desinstalar `amp` **no arrastra** sus seis dependencias, así que van los siete nombres uno por uno.

⚠️ Después queda `enabledPlugins: {}` en `.claude/settings.json`, que **sí está versionado** en estos repos. Hay que decidir si se commitea vacío o se saca la clave.

## Por qué no se hizo el mismo día

Este repo estaba en medio de la sesión que autoraba los cambios: migrarlo dejaba los plugins sin cargar a mitad de trabajo. El Coordinador espera su propia sesión desde antes (ver el frente A del handoff).
