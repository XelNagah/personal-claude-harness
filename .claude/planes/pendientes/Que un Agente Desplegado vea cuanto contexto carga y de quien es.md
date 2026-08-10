**Estado: Nuevo · Creado 26-08-10.**

# Que un Agente Desplegado vea cuánto contexto carga y de quién es

## De dónde sale

De la Decisión Local-0067, que puso el tope de contexto de arranque sobre lo que aporta el Agente Multipropósito y dejó lo que aprende cada repo como dato sin veredicto. Al cerrarla quedó a la vista que **ese dato hoy no lo ve nadie más que este repo**: la Herramienta `medir-contexto` y la regla de conducta que la dispara al arrancar son del Agente Desplegado que es este repo y no viajan en ningún plugin.

Está bien que el **tope** no viaje —es una restricción que se puso quien construye el Agente Multipropósito, no le representa nada a quien lo instala y no es suyo para mover—. Lo que sí le serviría es el **desglose**: al arrancar, ver que el Agente Multipropósito le agrega unos 30 KB y que su propio Aprendizaje le agrega tantos otros. Dos números, sin veredicto.

## Qué habría que resolver

- **Qué se le muestra.** Los dos números y nada más, o también el desglose por archivo a demanda. Sin tope, sin verde ni rojo: un número que nadie sabe interpretar es ruido, así que el texto tiene que decir qué es cada cosa sin explicar el modelo entero.
- **Qué mecanismo lo lleva.** Hoy hay dos candidatos ya construidos: sumarlo a la Pantalla de bienvenida (Decisión Local-0030, que ya corre al arrancar y ya viaja) o hacer viajar una versión sin tope de `medir-contexto` con su propia regla Base. El primero no agrega Componentes de Subsistema; el segundo mantiene separado lo que se mide de lo que se muestra.
- **Cuánto cuesta al arrancar.** El evento es bloqueante y el presupuesto es de menos de 100 ms (conocimiento Local-0005). Medir implica leer y seguir los `@` del punto de entrada más recorrer `base/` para cada archivo cargado: hay que medirlo antes de cablearlo, y si no entra, decidir si se muestra solo a demanda con `amp:info`.
- **De dónde saca la contraparte.** Acá el número sale de comparar contra la carpeta `base/` del repo que publica. Un Agente Desplegado no la tiene: tiene los archivos ya instalados y mezclados. Hay que resolver contra qué compara — el frontmatter `origen` de cada Índice es el candidato, porque ya distingue lo que manda el Agente Multipropósito de lo que suma el repo, pero no dice dónde termina el encabezado que viaja y empiezan las filas propias. Sin esto resuelto, el plan no tiene cómo dar el segundo número.

## Cuestión abierta que arrastra

**Un Agente Desplegado no puede bajar su propio contexto de arranque.** La única palanca es sacar la línea `@INDICE-LOCAL.md` del `MANIFIESTO.md` del subsistema; pero el manifiesto es del Agente Multipropósito, no lleva frontmatter (Decisión Local-0019) y el actualizador lo pisa entero (Decisión Local-0045), así que el cambio se deshace en la próxima corrida de `amp:actualizar`, sin ninguna señal.

Importa para este plan porque mostrarle el número a alguien que no puede actuar sobre él es el mismo defecto por el que el tope no viaja. Los tres caminos ya relevados, sin decidir:

1. **Partir la declaración en dos archivos por origen** — el del Agente Multipropósito importa su Índice, y uno `origen: agente-desplegado` importa el local. Respeta intactas las Decisiones Local-0017 y Local-0045, pero son nueve archivos nuevos y hay que resolver desde dónde se importan sin llegar al cuarto salto que la Decisión Local-0019 ya rechazó.
2. **Que el actualizador no reponga la línea si el repo la sacó** — barato, pero reintroduce una excepción de contenido dentro de un archivo que se pisa entero, que es lo que la Decisión Local-0045 eliminó.
3. **Declarar que no hay palanca** — los Índices cargados lo están porque su función lo exige (una preferencia hay que obedecerla sin ir a buscarla), así que descargarlos no ahorra contexto, rompe el subsistema.

## Lo que ya está hecho y no hay que rehacer

- El reparto en tres categorías y su medición, en `medir-contexto` (con banco de 19 casos).
- La medición del bloque de cableado del punto de entrada por su encabezado.
- La decisión de qué entra en el número controlado y qué no: Decisión Local-0067.
