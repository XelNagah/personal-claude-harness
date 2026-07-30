# Prefijo en los IDs de decisiones para legibilidad

**Estado: Ejecutado · Creado 26-07-24 · Cerrado 26-07-30.** No se ejecutó por sí solo: lo cumplió el núcleo del Índice de Subsistema. Ver las notas de implementación al final.

**Idea de Javier (24/07/2026), en caliente por confusión real:** los IDs de decisiones son números pelados (`0004`, `0013`, `0022`). El número solo no dice **que es una decisión** ni **qué dice**. Imposibles de retener; se confunden con memorias, páginas de conocimiento o números de plan. En una conversación, citar "0022" no le comunica nada al usuario.

## Propuesta

Prefijar los IDs con algo que señale "esto es una decisión": `Dec0013`, `D0013` u otra forma a ratificar.

## A resolver (correr por `planificar`)

- **Forma del prefijo:** `Dec` / `D` / otra. Ratifica el usuario.
- **Alcance:** no es un renombre suelto sino una **migración**. Toca el registro `decisiones/INDICE.md` **y todas las citas del repo** — el número de una decisión aparece referenciado en muchos lados (preferencias, glosario, otras decisiones, memorias, planes). Hay que barrerlas todas.
- **Cruza con** la decisión de *no exponer el registro de decisiones del harness en el texto que se instala en un consumidor*: un prefijo haría más claras las pocas citas que sí sobreviven ese filtro.
- **Complemento de conducta (no registro):** además del prefijo, la costumbre de **nombrar la decisión en palabras** al citarla —no solo el ID— ya está adoptada como comportamiento; evaluar si merece regla explícita.

## Notas de implementación

**Cerrado el 30/07/2026 sin trabajo propio: lo cumplió el núcleo del Índice de Subsistema**, decidido y ejecutado entre el 29 y el 30 de julio de 2026. Los tres puntos quedaron resueltos por esa vía:

- **La forma del prefijo** no es `Dec` ni `D` sino el **origen** de la entrada: `Base-` para lo que manda el Agente Multipropósito y `Local-` para lo que suma el Agente Desplegado. Resuelve lo que este plan pedía —que el identificador diga que es una decisión y de dónde sale— y de paso lo generaliza: la misma forma rige en los diez Índices, no solo en decisiones.
- **La migración** se hizo al llevar el registro al núcleo: sus 43 entradas pasaron a `Local-0001`–`Local-0043`.
- **La dependencia** con la regla de no exponer el registro de decisiones del Agente Multipropósito en el texto que se instala se resolvió por el lado contrario al previsto: los archivos de detalle **conservan** su nombre `NNNN-nombre.md` y las 213 referencias en texto plano quedan en la forma vieja, sin apuntar mal. Prefijar el archivo habría roto los links sin comprar nada.

Queda vivo el complemento de conducta —nombrar la decisión en palabras al citarla—, que ese mismo núcleo convirtió en regla del Índice: en lo que queda escrito el código nunca va solo, lleva adelante el sustantivo de la entidad. Ya no necesita plan.
