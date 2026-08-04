---
name: registrar-preferencia
description: Incorpora una preferencia nueva o copia puntualmente una existente desde otro Agente Desplegado — compara todos los Índices, detecta equivalencias y contradicciones, muestra el texto exacto, escribe solo en el origen correcto y corre el lint. Use when el usuario corrige lo mismo por segunda vez, pide "que esto sea una preferencia", quiere agregar una regla o llevar una preferencia a otro agente o repo.
---

# Registrar una preferencia

Incorpora **una** regla de conducta persistida en `.claude/preferencias/`. La entrada puede nacer de un feedback del usuario o venir de otro Agente Desplegado. Copiarla es una operación puntual: en el destino se vuelve Aprendizaje local, recibe un Código nuevo y no conserva sincronización con la fuente.

## Cuándo dispara

- El usuario corrige **lo mismo por segunda vez**, aunque cambie el caso.
- Pedido directo: «que esto quede como regla» o «agregá esta preferencia».
- Pedido de reutilización: «llevá/copiá esta preferencia a este agente o repo».
- Al cerrar una sesión, si hubo correcciones repetidas que ameriten persistirse.

## Contrato de incorporación

**Entrada:** contenido candidato, detalle opcional, procedencia informativa y modo `vista previa` o `aplicar`.

**Salida:** `agregado`, `ya estaba`, `divergente` o `rechazado`, con las entradas y rutas alcanzadas.

**Garantías:** leer todos los Índices antes de escribir; buscar equivalencias y contradicciones por tema, no solo por texto; mostrar el contenido canónico exacto; asignar el Código en el destino; no pisar divergencias; copiar solo la página de detalle declarada; repetir sin duplicar.

El auxiliar `scripts/incorporar-preferencia.js` materializa la operación y entrega una salida estructurada. **No decide equivalencias semánticas ni ratifica contenido:** esas dos responsabilidades quedan en esta skill.

## Flujo

1. **Determinar el modo.**
   - **Nueva:** aislar la conducta general que revela el pedido; no registrar la anécdota.
   - **Copia puntual:** identificar repo fuente, Preferencia fuente y repo destino. La procedencia sirve para explicar el movimiento; no crea un vínculo permanente.

2. **Construir la propuesta.** Cada Preferencia tiene:
   - **Nombre:** qué pide, en una frase con verbo adelante; único dentro del Índice.
   - **Descripción:** todo lo necesario para obedecerla. Debe ser accionable y verificable en el punto de acción, con el porqué si no es obvio.
   - **Detalle:** `—`, o una página con elaboración, ejemplos, motivos y casos discutidos. Lo necesario para obedecer no baja al detalle porque esa página no está siempre cargada.
   - **Procedencia:** repo y Código fuente, o «texto del usuario». Es informativa y no se agrega como una columna nueva.

3. **Leer el subsistema completo en el destino.** Partir de `.claude/preferencias/MANIFIESTO.md` y leer **todos** los Índices declarados, cualquiera sea su nombre. Comparar la propuesta por tema, intención, alcance y contenido:
   - equivalente: devolver `ya estaba`; si no se cumple, señalar que es un problema de cumplimiento, no de registro;
   - mismo tema con diferencias compatibles: proponer afinar la entrada local existente;
   - incompatibilidad: devolver `divergente`, explicar la contradicción y no escribir;
   - ausente: continuar.

4. **Resolver el destino.**
   - Una Preferencia nueva o copiada se incorpora normalmente al Índice con `origen: agente-desplegado`.
   - Una copia **siempre** entra como local, aunque la fuente tenga Código `Base-NNNN`: reutilizar una elección no la convierte en Base.
   - Solo editar el Índice con `origen: agente-multiproposito` cuando el repo actual sea explícitamente la fuente pública del Producto y el usuario esté promoviendo esa regla a mecanismo público. En cualquier otro repo, registrar localmente y proponer la promoción como una operación separada.

5. **Preparar la vista previa mecánica.** Resolver la ruta de `scripts/incorporar-preferencia.js` desde la carpeta de esta skill, no desde el repo destino.

   Para una copia:

   ```bash
   node <ruta-skill>/scripts/incorporar-preferencia.js --fuente <repo-fuente> --codigo <Base-NNNN|Local-NNNN> --destino <repo-destino>
   ```

   Para texto nuevo, crear una propuesta JSON temporal con este esquema y pasarla con `--propuesta`:

   ```json
   {
     "nombre": "...",
     "descripcion": "...",
     "detalle": null,
     "procedencia": { "tipo": "texto del usuario" }
   }
   ```

   Si hay detalle: `"detalle": { "archivo": "nombre.md", "contenido": "..." }`. La vista previa no escribe. El auxiliar busca coincidencias exactas en todos los Índices, calcula `máximo local + 1`, comprueba colisiones de archivo y muestra la fila y las rutas resultantes. Su coincidencia textual complementa, pero no reemplaza, el control semántico del paso 3.

6. **Mostrar y ratificar.** Presentar al usuario el texto exacto de la fila, el contenido completo del detalle si lo hay, el destino, la procedencia y las rutas alcanzadas. Esperar el visto bueno. Aprobar «registrarla» no equivale a aprobar un texto que todavía no vio.

7. **Aplicar la misma propuesta.** Repetir el comando de vista previa con `--aplicar`. No reconstruirla después de la ratificación. El auxiliar:
   - asigna `Local-NNNN` como el mayor del Índice local más uno, sin reusar huecos;
   - reemplaza las referencias al Código fuente dentro del detalle;
   - copia la página declarada sin pisar un archivo divergente;
   - devuelve `ya estaba` en una segunda corrida.

8. **Cerrar con el lint** desde la raíz del repo destino:

   ```bash
   node .claude/preferencias/lint-preferencias/lint-preferencias.js
   ```

9. **Reportar:** estado, Preferencia resultante con tipo y Código, procedencia, Índice y rutas modificadas, lint y cualquier dependencia externa que no se haya copiado.

## Límites de la primera versión

- Copia una Preferencia y, como máximo, su página declarada en `Detalle`.
- Si esa página depende de otros archivos locales o la regla necesita Conducta, Herramientas u otro subsistema para cumplirse, informar la dependencia y coordinar al subsistema dueño; no copiarla en silencio ni ampliar el alcance por cuenta propia.
- No copia conjuntos, no crea un tercer origen y no propaga cambios posteriores.

## Reconciliación (idempotencia)

Releer todos los Índices antes de cada escritura. Una regla equivalente devuelve `ya estaba`; una entrada del mismo tema con contenido distinto devuelve `divergente`; un archivo de detalle preexistente con otro contenido tampoco se pisa. La vista previa y una cancelación no modifican nada. Nunca modificar localmente el Índice del Agente Multipropósito de un Agente Desplegado.
