# Preferencias

Las **preferencias** son las reglas de conducta del agente en este repo: qué espera el usuario de cómo trabaja y de cómo se comunica. Se asientan en una tabla `Código | Nombre | Descripción | Detalle`, separada **por origen** en dos archivos que lo declaran en su frontmatter: `PREFERENCIAS.md` (`origen: agente-multiproposito`, el nivelador lo reemplaza entero) y `PREFERENCIAS-LOCAL.md` (`origen: agente-desplegado`, lo suma cada repo; el nivelador no lo abre).

**Para qué:** que el usuario no tenga que repetir la misma corrección. Una preferencia asentada es una corrección que no vuelve a hacer falta — y una que no está asentada vuelve en la sesión siguiente.

**Qué las distingue de las reglas de `conducta`:** las de conducta las entrega un hook en un momento del flujo, y por eso su registro no se carga. Las preferencias están **siempre en contexto**: los dos archivos se importan desde `AGENTS.md`. Eso cambia cómo se escriben.

## Cómo se aplica

1. **Qué registrar** — la regla que revela la corrección, no la anécdota. Accionable y verificable en el punto de acción, con el porqué si no es obvio. Antes de agregar una, revisar si ya hay una que la cubre: si la hay y no se cumple, el problema no se arregla reescribiéndola.
2. **Dónde va** — al Índice del Agente Desplegado si es específica de este repo, que es el caso normal y el único archivo editable acá. Si vale para todos los repos del usuario, va al del Agente Multipropósito, que se edita en el repo que lo publica y obliga a subir la versión del plugin.
3. **Norma contra elaboración** — la `Descripción` lleva **todo lo que hace falta para obedecer**, aunque sea larga. Lo que no hace falta para obedecer —ejemplos, motivos, casos ya discutidos— baja a una página de detalle, que declara la columna `Detalle`. El corte es por función, no por largo: lo que sale de la celda deja de estar cargado, y una regla que el agente tiene que ir a buscar es una regla que no se aplica.
4. **El Código** — `Base-NNNN` o `Local-NNNN` según el origen. Se asigna como **el mayor del Índice más uno**, nunca la cantidad de filas más uno: si alguna vez se retiró una entrada, contar filas repite un código ya usado. Un código retirado deja un hueco y no se reusa. En lo que queda escrito el código nunca va solo — se dice `Preferencia Base-0007`.
5. **El texto exacto se muestra antes de escribirlo.** Las preferencias son un registro canónico: el usuario ratifica el contenido, no solo la acción de registrar.
6. **Al cerrar** una tarea que tocó preferencias, correr el lint desde la raíz del repo:

   ```bash
   node .claude/preferencias/lint-preferencias/lint-preferencias.js
   ```

## Incorporar y copiar

`amp-preferencias:registrar-preferencia` es la única operación de alta. Puede redactar una regla nueva desde el texto del usuario o copiar puntualmente una ya asentada en otro Agente Desplegado. En ambos casos:

1. lee los dos Índices y compara el tema y el contenido;
2. muestra la fila y el detalle exactos antes de escribir;
3. incorpora en el Índice del Agente Desplegado con un Código `Local-NNNN` nuevo;
4. copia la página declarada en `Detalle`, si existe, y repara las referencias al Código fuente;
5. devuelve `agregado`, `ya estaba`, `divergente` o `rechazado` y corre el lint.

La copia no convierte una elección personal en Base, no crea una suscripción y no propaga cambios posteriores. Si la Preferencia depende de Conducta, Herramientas u otro subsistema, esa dependencia se informa y se resuelve con su operación dueña.

## Páginas de detalle

- [`archivo-de-estado.md`](archivo-de-estado.md) — Base-0013: la convención del archivo de estado en tareas exploratorias.
- [`handoff.md`](handoff.md) — Base-0014: por qué el nombre es variable y por qué la ruta va en el texto para copiar.
- [`nombrar-que-es-cada-codigo.md`](nombrar-que-es-cada-codigo.md) — Base-0016: por qué el código no va solo y por qué el título va en la conversación.
