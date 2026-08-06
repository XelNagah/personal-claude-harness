**Estado: Análisis · Creado 26-08-05.**

# Garantizar que actualizar un Agente Desplegado no rompa nada

**Migrar los Agentes Desplegados no es trabajo de este repo: lo hace el Agente Coordinador.** Lo que sí es de acá es garantizar que, cuando los migre, **no se rompa nada**: que el actualizador maneje sin sorpresas cada forma que existe hoy allá afuera, y que el contrato que se publica no obligue a ningún repo a desdecirse de algo que decidió bien.

Reencuadre acordado con el usuario el 05/08/2026. El alcance anterior —correr `amp:actualizar` repo por repo y reclasificar planes ajenos— sale del plan.

## Censo (verificado el 05/08/2026)

Verificado archivo por archivo sobre los doce repos, no inferido.

### En la forma actual del registro — 4 repos

`Contabilidad-Personal-IA` (23 planes), `analisis/como-uso-claude` (3), `analisis/compraventa-nuevo-inmueble` (16) y `analisis-particion-sucesion-melody` (2). Tienen frontmatter, el núcleo de columnas, `ESTADOS.md` de cinco, `ESTADOS-LOCAL.md` sin filas, manifiesto y lint co-ubicado. Actualizar los deja verdes sin tocar una fila.

### Con estados propios — 1 repo

`Agente-Coordinador` (8 planes) declaró en su `ESTADOS-LOCAL.md` los tres estados que el contrato agrega. **Resuelto: lo resolvió bien y el contrato se ajustó a él** (ver más abajo). Al actualizar, sus tres filas locales quedan repetidas y el lint las marca; se borran y el repo queda cubierto por la Base, sin perder ninguna de sus transiciones.

### Con el registro de la generación anterior — 5 repos

`bs-overlay/BeatSaber-Overlay` (8), `analisis/Correr IAs locales` (12), `local-wispflow` (3), `analisis/Impresion3d` (1) y `analisis/Salud` (1). Su `PLANES.md` es `Plan | Estado | Creado | Cerrado | Origen | Notas` —sin `Código`, `Nombre` ni `Descripción`—, sin frontmatter. Les falta la forma actual del registro, no tres estados.

⚠️ **Corrige el censo anterior**, que daba por migrados a los tres de `analisis/` porque «se migran por reconciliación al reusarse». No lo estaban: tres de los cinco tienen `lint-planes/` instalado, corren, y **contestaban `hallazgos: 0`** sobre un registro de otra generación. Es el conocimiento Local-0013 (controles que dejan de controlar sin avisar).

`bs-overlay` además tiene `.claude/` fuera del control de versiones: ahí no hay red de git y conviene el respaldo del actualizador.

### Sin subsistema planes — 2 repos

`analisis/Integral-Collective` y `Analisis Whatsapp` no tienen `PLANES.md` ni `ESTADOS.md`. No hay nada que migrar.

## Lo resuelto en este repo

### El contrato incorporó tres transiciones — hecho el 05/08/2026

`Agente-Coordinador` no se había desviado: su decisión propia del 27/07/2026 —nueve días **antes** de la Decisión Local-0057— define `En pausa` como *espera de una decisión*, y con ese significado sus cuatro salidas son las cuatro respuestas posibles a una consulta pendiente.

La restricción del contrato, en cambio, **nunca se decidió**: el contrato de la reingeniería enumeraba destinos para `Nuevo`, `Análisis`, `Listo` y `En curso`, pero de `En pausa` y `Diferido` solo declaraba reglas sobre la retomada, y al bajarlo a la tabla legible por máquina esas reglas se volvieron enumeración cerrada. Lo confirma que `diferir-plan` ya aceptaba `En pausa` como origen: la habilidad publicada contradecía la tabla publicada.

Asentado en la Decisión Local-0058. Cambios aplicados: `ESTADOS.md` (dos filas del grafo, el diagrama y la regla de `estado_a_retomar`), `README.md` del subsistema, `lint-planes.js` y su banco de pruebas, sincronizados a `base/`; `amp` a 0.34.0.

### El lint dejó de derivar mal `estado_a_retomar` — hecho el 05/08/2026

Al ensanchar la fila `En pausa` con salidas de cierre, el lint habría dado por válido un `estado_a_retomar: Descartado` **sin avisar**, porque para él era un valor declarado. Ahora los valores válidos se derivan de las **entradas** a `En pausa`: retomar es deshacer la pausa, así que el destino de retomada es por definición el origen de la pausa. Hoy sigue dando `Análisis, En curso`, y no se ensancha solo cuando el grafo suma cierres. Con caso de prueba propio.

### El banco de `lint-planes` volvió a controlar — hecho el 05/08/2026

La prueba «forma vieja» exigía **cero hallazgos** sobre un registro de la generación anterior, y ese cero era justamente el silencio que hacía que los cinco repos de arriba dieran verde. El commit `aa50037` agregó el aviso pero dejó la prueba afirmando lo contrario, así que el banco fallaba desde entonces. Ahora controla las dos cosas por separado: que las filas se sigan leyendo, y que el aviso se emita.

⚠️ Esa falla sobrevivió una sesión entera porque **`ejecutar-control-cierre` no corre `ejecutar-pruebas` completo** —corre los lints, `plugin validate` y el banco de la propia `ejecutar-pruebas`—, y el cierre de la sesión anterior solo usó el control de cierre. Pendiente de decidir aparte si el control de cierre debe correrlo entero.

### El actualizador quedó probado contra las cuatro poblaciones — hecho el 06/08/2026

Vista previa corrida sobre **los doce repos**, no sobre una muestra. Ninguno rompe: el actualizador clasifica cada archivo, ningún registro pierde filas y todo lo ambiguo cae en `DIVERGENTE`, que no se toca sin confirmación.

| Población | Acciones Base | Renombres | Divergentes |
|---|---|---|---|
| Forma actual del registro (4) | 24 c/u | 0 | 0 |
| `Agente-Coordinador` | 30 | 0 | 0 |
| Generación anterior (5) | 25 a 71 | 7 a 26 | 1 a 5 |
| Sin subsistema planes (2) | 26 | 5 | 0 — `planes/` nace entero |

En los cuatro de la forma actual, lo único que toca de `planes/` es el encabezado de `PLANES.md` y `ESTADOS.md`: las filas quedan intactas, como preveía el censo.

**`Agente-Coordinador`, simulado y verificado.** Se copió su `planes/` a un directorio temporal, se pisó `ESTADOS.md` y `lint-planes/` con los de la Base y se corrió el lint: `estados definidos: 8 | filas en registro: 8 | archivos en ciclo: 8 | hallazgos: 4`. Los cuatro son los tres estados repetidos en su `ESTADOS-LOCAL.md` —que se borran— y un activo envejecido propio del repo, ajeno a la migración. **Ningún plan queda con estado inválido y ninguna transición se pierde.**

## Trabajo pendiente

1. ~~**Publicar** `amp` 0.34.0~~ — hecho: `2590c70` publicado, marketplace bajado al día, la sesión corre 0.34.0.
2. ~~**Probar el actualizador contra las tres formas**~~ — hecho el 06/08/2026 contra las doce, arriba.
3. **Resolver el divergente de columnas**, único bloqueante conocido del actualizador — **resuelto en parte el 06/08/2026**, ver abajo. Lo que queda se documenta para quien migre: las dos historias posibles —el repo sumó la columna, o la Base renombró la suya— dejan la misma evidencia, y solo el usuario conoce la de su repo (Decisión Local-0046).
4. **Entregar el censo al Agente Coordinador** como insumo, con la advertencia de que los repos de generación anterior dan verde con su lint viejo hasta que se los actualiza.

### El divergente de columnas, medido (06/08/2026)

Son **13 divergentes en 5 repos**, todos de la población de generación anterior, y aparecen en **cuatro registros distintos**, no solo en el de planes:

| Registro | Columnas ajenas a la Base | Repos | Filas afectadas |
|---|---|---|---|
| `planes/PLANES.md` | Plan, Creado, Cerrado, Notas | los 5 | 8 · 12 · 3 · 1 · 1 |
| `decisiones/INDICE.md` | N°, Decisión | 3 | 2 · 0 · 0 |
| `semantica/GLOSARIO.md` | Concepto, Definición | 1 | 3 |
| `semantica/TERMINOLOGIA-FARLOPA.md` | Término, Significado vetado | 1 | 0 |

Además, tres de los cinco arrastran el divergente `memoria/ → subsistemas/`, que es migración, no columnas.

Dos observaciones que la Decisión Local-0046 no tuvo a la vista:

- **Cuatro de los trece tienen cero filas.** El daño que la 0046 evita —dejar filas bajo una cabecera que no las describe— no existe cuando no hay filas. Ahí la ambigüedad es formal, no real.
- **El encabezado ajeno es idéntico en los cinco repos.** `Plan | Estado | Creado | Cerrado | Origen | Notas` con el mismo texto de convención en los cinco no es cinco personalizaciones: es el encabezado de una generación anterior de la Base. La 0046 contempla dos historias («el repo sumó» / «la Base renombró») y esta es una tercera, distinguible: el repo no sumó nada, se quedó atrás.

Ninguna de las dos se aplica sin decisión del usuario: cambiar cuándo el actualizador frena refina la 0046, que es potestad suya.

### Resuelto: un Índice sin Entradas ya no frena — hecho el 06/08/2026

El usuario ratificó la primera de las dos: cuando la tabla divergente **no tiene ninguna fila**, el actualizador pisa el encabezado sin preguntar. Asentado en la Decisión Local-0059.

Aplicado en `amp-actualizar.js` y probado. El banco pasó de 40 a 41 casos: el que probaba la columna renombrada tenía la tabla vacía y por eso **medía otra cosa** de la que decía —se le agregó una fila para que siga probando el rastro por orden de columnas—, y se sumó uno nuevo para el caso sin filas. Verificado contra los consumidores: `Impresion3d` bajó de 5 divergentes a 3 y `Salud` de 3 a 2; los trece divergentes de columnas quedaron en nueve.

La segunda —reconocer los encabezados que la Base tuvo en generaciones anteriores— **no se aplicó**: obliga a mantener un registro histórico permanente para ahorrar confirmaciones en una migración que se hace una vez.

Fuera de alcance, para quien migre: en `Contabilidad-Personal-IA`, 14 de 23 planes están en `Diferido` por el remap anterior —que mandó `estacionado`, `idea`, `en diseño` y `listo` todos ahí porque `Listo` no existía— y parte de esos catorce hoy serían `Análisis` o `Listo`. El lint no lo marca: `Diferido` es válido. Cuántos están mal es **inferencia**, no dato: no se abrió cada plan.

**Origen:** se desprende del plan ejecutado Local-0011 (Migrar repos consumidores a los estados nuevos), que hizo la migración anterior y dejó explícito que los dormidos se migran por reconciliación al reusarse — supuesto que este censo desmiente.
