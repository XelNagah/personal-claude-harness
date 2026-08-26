# Veintiocho decisiones tienen por nombre el tema y no lo que se decidió

**Estado: Nuevo · Creado 26-08-25.**

## Qué pasó

El 25/08/2026 el usuario cortó una discusión sobre el nombre de una decisión nueva con un reclamo que venía de largo: los nombres que le proponía el agente *"no representan decisiones sino afirmaciones genéricas que no dicen nada"*.

La causa no era del agente. `decisiones/INDICE.md` definía la columna como **"Nombre — de qué trata la decisión, en una frase corta"**. *De qué trata* pide un tema, y eso es lo que el registro tiene.

La convención ya se corrigió el mismo día, en el Índice y en la habilidad `registrar-decision`: el Nombre pasa a ser **qué se decidió**, en una afirmación con sujeto concreto, que nombra también la alternativa descartada cuando la hubo. Queda pendiente lo viejo.

## Lo medido

De las 78 decisiones del registro, **28 tienen nombre-tema**. Casi todas son anteriores a la 0044; de ahí en adelante la práctica ya había mejorado sola, sin que la convención cambiara.

Las cuatro peores solo nombran la cosa, y leídas solas no dicen nada de lo que se resolvió:

- Local-0020 — *Test de demarcación*
- Local-0021 — *Subsistema conducta*
- Local-0028 — *Diseño del actualizador*
- Local-0043 — *Núcleo del Índice de Subsistema*

Las otras 24: 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0010, 0011, 0013, 0014, 0015, 0017, 0018, 0019, 0022, 0023, 0025, 0026, 0027, 0029, 0039, 0057.

## Por qué importa

El manifiesto del subsistema manda consultar las decisiones **al planificar y analizar**, para no re-decidir ni contradecir lo asentado. Un registro de 78 filas se recorre por la columna Nombre: la Descripción de estas filas es larga y no se lee entera. Un nombre que dice el tema y no la resolución obliga a abrir la Descripción de cada candidata, y en la práctica lo que pasa es que no se abre ninguna y la decisión se vuelve a tomar.

## Qué hay que hacer antes de renombrar

El Código es la referencia estable, no el Nombre, pero el Nombre igual se cita. Antes de tocar nada hay que barrer quién nombra estas decisiones por su nombre y no por su código:

- El propio registro, en las Descripciones que se refieren entre sí.
- Las páginas de detalle `NNNN-*.md` del subsistema, cuyo nombre de archivo también arrastra el nombre viejo.
- Los planes, el conocimiento y los README del repo.
- Lo que viaja en `base/`, con la salvedad de que ahí no se citan decisiones por código (Decisión Local-0024), así que la cita, si existe, es por nombre.

## Puntos a decidir

1. **Si los archivos de detalle se renombran también.** Hay once, con el número adelante (`0020-test-de-demarcacion.md`). Renombrarlos rompe los enlaces del Índice, que hay que actualizar en la misma pasada; dejarlos deja el nombre viejo escrito en el disco.
2. **De a cuántas por vez.** Cada nombre nuevo es una redefinición de algo asentado y la ratifica el usuario, no el agente. Veintiocho ratificaciones de a una es caro; conviene proponerlas por tandas con la fila vieja y la nueva enfrentadas.
3. **Si el nombre viejo se conserva en algún lado.** El registro no tiene columna de alias y sumarle una por esto sería mucho; la alternativa es no conservarlo, asumiendo que quien busque por el nombre viejo no lo encuentre.

## Alcance del trabajo

- `.claude/decisiones/INDICE.md` — las 28 celdas de Nombre.
- Los archivos de detalle, si se decide renombrarlos, y sus enlaces.
- Las citas por nombre en el resto del repo.
- `lint-decisiones` y `lint-harness` al cerrar.

## Origen

Reclamo del usuario, 25/08/2026, al proponerle el nombre de la decisión sobre dónde vive el texto del aviso al cerrar tarea.
