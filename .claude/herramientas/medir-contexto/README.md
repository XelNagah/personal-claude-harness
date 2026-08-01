# medir-contexto

Herramienta del Agente Desplegado (este repo). Mide **el texto que se carga en cada arranque de sesión** y lo compara contra un tope, con el desglose por archivo.

```bash
node .claude/herramientas/medir-contexto/medir-contexto.js [rutaRepo]
```

## Qué mide

Lo que entra al contexto sin que nadie lo pida: arranca por `CLAUDE.md` y `AGENTS.md` y sigue las líneas `@ruta`, que son importaciones. Hoy eso es el punto de entrada, los `MANIFIESTO.md` de cada subsistema, y los Índices que esos manifiestos importan.

Los registros que se consultan a demanda —planes, semántica, decisiones, conducta— **no cuentan**, justamente porque no se cargan.

Reporta y no falla: sale 0 siempre. Describe el estado del repo, y pasar el tope es información, no error.

## Por qué es una Herramienta de este repo y no algo que viaje

Estuvo un tiempo adentro de la Pantalla de bienvenida, que viaja a cada Agente Desplegado. Se sacó de ahí porque **no le sirve al que la recibe**:

- **El tope no es suyo para mover.** La constante vive en el código, y el código es mecanismo que el nivelador repone entero. Un Agente Desplegado que la edite pierde el cambio en la próxima corrida de `amp:actualizar`. Informarle un número sobre el que no puede actuar es ruido.
- **Decidir si el tope sube es potestad de acá.** Es este repo el que decide cuánto contexto puede permitirse mandar el Agente Multipropósito. Esa vigilancia le corresponde a quien publica, no a quien instala.
- **Lo único que sí está en manos de cada repo —bajar su propio contexto— no necesita esta Herramienta.**

Es una aplicación directa de la Decisión Local-0048.

## De dónde sale el tope de 48 KB

Se fijó el 30/07/2026 midiendo lo que había ese día —43,9 KB en 17 archivos— y dejando unos 4 KB de margen. **No sale de un límite del modelo ni de ningún cálculo**: es una disciplina auto-impuesta. Como referencia, ese texto son unos 13 a 16 mil tokens, del orden del 7% de las ventanas de contexto actuales.

Lo que aporta el control es **que haya un número**, no cuál sea. El contexto siempre cargado no lo vigila nadie y crece de a poco: cada Índice liviano que se suma no pesa nada por sí solo. El modelo de carga por manifiesto se adoptó justamente para bajarlo —el registro de planes llegó a pesar casi la mitad del total—, y sin un número a la vista ese ahorro se vuelve a consumir sin que se note.

## Qué hacer cuando lo pase

No es una alarma que haya que apagar: es el momento de decidir a mano entre dos cosas.

- **Subirlo**, porque el Agente Multipropósito legítimamente creció y lo que manda vale su costo.
- **Recortar.** El primer lugar donde mirar son las celdas de `Descripción` de los Índices cargados, que son de una línea por convención y tienden a crecer a párrafo. El desarrollo va en la página, y lo que sale de la celda deja de estar cargado. El desglose que imprime la Herramienta está ordenado por peso para eso.

## Pruebas

```bash
node .claude/herramientas/medir-contexto/pruebas.js
```

Ocho casos sobre repos de prueba armados en `.claude/tmp/`, nunca sobre el repo real: afirmar algo del repo real metería un número absoluto adentro de la prueba, que envejece igual que adentro de un registro. Cubren el caso bueno y el malo del tope, que se sigan las líneas `@`, que un repo sin punto de entrada lo diga en vez de informar 0 KB, y que se mida el repo que se le pasa y no el propio.
