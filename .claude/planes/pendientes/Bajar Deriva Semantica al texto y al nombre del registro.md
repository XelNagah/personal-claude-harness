# Bajar Deriva Semántica al texto y al nombre del registro

**Estado: Nuevo · Creado 04/08/2026.**

## Contexto

El 04/08/2026 se asentó en el glosario la entrada Local-0035 (Deriva Semántica), con **Deriva Semántica** como nombre canónico y **Terminología Farlopa** como alias ratificado. Hasta entonces el término que ordena el subsistema `semantica` no estaba definido en ninguno de los dos registros que ese subsistema gobierna.

Ratificar el canónico **no alcanza**. El conocimiento Local-0011 (Terminología canónica) ya dejó asentado que una regla escrita con el vocabulario que corrige se auto-refuerza, y que ratificar un término no cierra hasta bajarlo a todo el texto normativo. Hoy el canónico es uno y prácticamente todo el texto del repo usa el alias.

Lo que evita que esto sea urgente: **un alias es válido de usar**. La convención del glosario lo dice explícitamente, así que el texto existente no está incumpliendo nada — está usando una forma legítima. Por eso esto es prolijidad y coherencia, no una rotura.

## Alcance medido el 04/08/2026

- **49 archivos** referencian el nombre `TERMINOLOGIA-FARLOPA`.
- **31 referencias en 17 archivos `.js`**, varios de los cuales viajan al instalador.
- **90 menciones del término en 40 archivos `.md`**, de los cuales **10 viajan**.
- La carpeta del control de escritura se llama `detectar-terminologia-vetada`, sin el término: **no la alcanza este trabajo**.

## Los dos frentes, que conviene no mezclar

### 1. El texto y los títulos — sin riesgo

Pasar el texto normativo y los títulos a **Deriva Semántica**, conservando **Terminología Farlopa** donde sirva como alias reconocible. Son unos 40 markdown y ningún archivo de código.

Es lo que cambia la experiencia de quien lee, y lo que el conocimiento Local-0011 reclama para que la ratificación deje de ser nominal.

Cuidado al redactar: el registro llama **Significado Farlopa** a su columna `Descripción` —el significado que se veta para ese término—. Renombrar el concepto obliga a decidir también cómo se llama esa columna, y ahí el cambio sí toca la forma de un registro.

### 2. El nombre del archivo `TERMINOLOGIA-FARLOPA.md` — con riesgo

Es una **ruta**, no un nombre del dominio; la Preferencia Local-0011 (No reemplazar los nombres del dominio por siglas) excluye explícitamente los identificadores que deban conservarse, y nadie que use el Agente Multipropósito lee este nombre salvo que abra la carpeta. Aporta poco valor visible y cuesta los 31 puntos de código, subir las versiones de los plugins afectados y republicar.

**Precondición obligatoria antes de renombrarlo.** El conocimiento Local-0013 (Controles que dejan de controlar sin avisar) abre su lista con «valida sobre un conjunto vacío». Si alguno de los 17 lectores del registro trata la ausencia del archivo como «no hay términos vetados», al renombrarlo **pasa a dar verde para siempre sin emitir señal**, y el control de terminología queda apagado sin que nadie se entere.

Por eso el orden es: primero verificar, uno por uno, que cada lector **falle ruidoso** si el registro no está; recién después renombrar. Cualquier lector que hoy degrade en silencio se arregla antes, no después.

## Trabajo

1. Verificar que los 17 lectores fallen ruidoso ante un registro ausente; arreglar los que degraden en silencio y dejarles caso negativo.
2. Barrer el texto normativo y los títulos al canónico, conservando el alias donde ayude a reconocerlo.
3. Resolver cómo se llama la columna `Descripción` del registro, hoy **Significado Farlopa**.
4. Decidir el renombre del archivo. Si se hace: en un solo movimiento, con el control de cierre y el banco completo, subiendo las versiones de los plugins que lo llevan.
5. Revisar si el registro merece entrada propia en el glosario, distinta del concepto. Al asentar Local-0035 se resolvió que no —el registro se llama por el concepto y no agrega significado propio—, pero conviene reconfirmarlo si el archivo cambia de nombre.
6. Decidir si el registro lleva **nombre propio en mayúsculas**: el usuario propuso **Registro de Deriva Semántica** el 06/08/2026, escribiéndolo como nombre propio y no como descripción. Queda delegado a este plan, sin ratificar. Hasta que se resuelva, el texto nuevo escribe «el registro de Deriva Semántica» en minúscula —que es lo que el paso 5 ya resolvió— y el alias **Terminología Farlopa** sigue siendo válido. La decisión arrastra al paso 3: si el registro pasa a tener nombre propio, la columna hoy llamada *Significado Farlopa* se nombra en la misma tanda.

## Criterios de cierre

- Ningún texto normativo del repo usa el alias donde corresponde el canónico.
- El registro de vetados y su columna de significado tienen nombres coherentes con el canónico.
- Si se renombró el archivo: los 17 lectores lo encuentran, y **cada uno tiene un caso negativo que prueba que grita si no está**.
- Los bancos del repo y el control de cierre siguen en verde, y las versiones afectadas quedaron publicadas.

## Fuera de alcance

- Traducir el repo al inglés, incluida la idea de *farlop terminology* como demostración pedagógica. Es un proyecto aparte que el usuario ya marcó como tal.
- Renombrar el subsistema `semantica`, que no lleva el término.
- Vetar el alias: **Terminología Farlopa queda ratificada como alias válido**, no se veta ni se barre del repo.
