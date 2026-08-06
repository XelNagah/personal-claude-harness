# Separar origen Base y aprendido en los subsistemas

**Estado: Nuevo · Creado 26-07-24.** Precondición de la mitad `amp-actualizar` (actualizador) del plan de distribución marketplace. Surgió al analizar cómo el actualizador distingue lo que puede pisar de lo que no.

## El problema

Los subsistemas **no distinguen el origen de su contenido**. En casi todos se mezclan dos orígenes:

- **Base** — lo que el diseñador del harness manda y espera que todo Agente Multipropósito cumpla (comportamiento río arriba).
- **Aprendido** — lo que el Agente Multipropósito aprende persiguiendo su Propósito, generando su Producto (comportamiento de dominio).

Hoy eso está separado **en un solo lugar**: `PREFERENCIAS.md` (Base vs Adaptaciones). En el resto está revuelto. Ejemplo: en `memoria/`, el harness siembra `feedback_flujo_planes.md` (Base) y el repo aprende sus propias memorias (aprendido), indistinguibles en la misma carpeta. El actualizador no puede saber cuál es suyo.

## Por qué es precondición del actualizador

Separar por origen **disuelve** el problema de marcar fronteras dentro de archivos mixtos: si Base y aprendido son archivos/secciones distintas, el actualizador **reemplaza lo de Base completo y nunca abre lo del repo**. Sin marcas invisibles, sin parsear títulos. El marcador de comentario era el síntoma de forzar dos orígenes en un archivo.

## Diseño resuelto (planificar 24/07/2026 → Decisión Local-0027, separación por origen en los subsistemas)

La separación se realiza **según la granularidad del subsistema**, no con una forma única:

- **Por fila** (conducta) → dos secciones, tabla propia cada una: `## Reglas Base` / `## Reglas del Propósito`. Molde: Base/Adaptaciones de `PREFERENCIAS.md`. El actualizador reemplaza la sección Base entera, nunca abre la del Propósito. **Ya ejecutado en este repo** (conducta partida el 24/07/2026).
- **Por archivo** (memoria) → los archivos Base (`feedback_*` que siembra el harness) tienen nombre propio; el actualizador los pisa por nombre, los aprendidos quedan intactos. La separación sale sola por nombre; el rediseño de fondo de memoria (prefijo legacy, corte con conocimiento) va en su propio plan.
- **Contenido puro aprendido** (glosario, semántica, conocimiento, decisiones, planes, herramientas) → el harness los instala vacíos; el actualizador de rutina **no reescribe** su contenido. Lo único Base es el mecanismo (lint, MANIFIESTO, estructura), archivos enteramente Base que el actualizador pisa completos. No hay mezcla adentro ⇒ nada que separar.

**Escape a futuro:** no se precluye despachar contenido sembrado en glosario/semántica/conocimiento; sería una migración dedicada, no tarea del actualizador de rutina.

**Por qué registros separados y no una columna de origen:** el choque de ids — el harness manda entradas 1-5, el repo agrega la 6, después el harness quiere mandar su 6 → colisión. Con espacios separados no hay colisión. La decisión 0024 ya empuja a esto (el registro del consumidor arranca en 0001, no hereda la numeración del harness).

## Falta ejecutar

- Aplicar el corte de conducta a su **funcionalidad/plugin** cuando se empaquete conducta (hoy no está empaquetada); va con el plan de crecer/empaquetar conducta.
- Nada en los otros subsistemas: ya quedan separados por la estructura existente.

**Heredado del plan de distribución** (cerrado el 25/07/2026): su abierto *«marcadores de región gestionada — formato exacto de los delimitadores que el actualizador respeta en archivos mixtos»* queda **acá, y ya resuelto por la vía negativa**: la separación por origen elimina los archivos mixtos, así que no hay delimitadores que definir. Si en el futuro algún archivo vuelve a mezclar los dos orígenes, el formato se decide en este plan, no en el de distribución.

**Abierto heredado del registro:** *dos archivos contra dos secciones, qué subsistemas aplican, y cómo se unifica el índice.* Lo responde el plan [Partir los índices por origen y pasar preferencias a tabla](Partir%20los%20indices%20por%20origen%20y%20pasar%20preferencias%20a%20tabla.md), que parte cuatro Índices en dos archivos declarando el origen en el frontmatter.

## Cruces

- **Distinto, no igual:** `Separar mecánica del harness de criterio del autor` — ese es otro eje (gusto personal vs mecánica universal, los dos upstream); este es upstream vs aprendido.
- **Se apoya en:** decisión 0024 (numeración del consumidor), decisión 0002 (Patrón).
- Toca `Versionado del harness dentro del .claude del repo host` (qué se versiona de cada origen).

Correr por `planificar`. Probablemente asiente una o más decisiones estructurales.
