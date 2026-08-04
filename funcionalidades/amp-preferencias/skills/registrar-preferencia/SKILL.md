---
name: registrar-preferencia
description: Detecta un feedback recurrente del usuario y propone registrarlo como preferencia — redacta la regla, decide si va al Índice del Agente Desplegado o amerita subirla al Agente Multipropósito, y corre el lint. Use when el usuario corrige lo mismo por segunda vez, dice "que esto sea una preferencia", "anotalo como regla", o al cerrar una sesión con correcciones repetidas.
---

# Registrar una preferencia

Convierte un feedback recurrente en regla de conducta persistida (`.claude/preferencias/`), para que deje de depender de que el usuario lo repita. Es la "nivelación de preferencias" que la separación por origen prevé pero que nadie ejecutaba.

## Cuándo dispara

- El usuario corrige **lo mismo por segunda vez** (mismo tipo de corrección, aunque cambie el caso) — señal más fuerte que cualquier pedido explícito.
- Pedido directo: "que esto quede como regla".
- Al cerrar una sesión: repasar si hubo correcciones repetidas que ameriten subirse.

## Flujo

1. **Aislar la regla.** ¿Qué conducta concreta pide el usuario, en general y no solo en el caso puntual? Redactarla como las existentes: **accionable y verificable en el punto de acción**, con el porqué si no es obvio. No registrar la anécdota — registrar la regla que la anécdota revela. Cada preferencia es una fila con cuatro columnas:
   - **Nombre** — qué pide, en una frase con verbo adelante. Único dentro del Índice.
   - **Descripción** — la preferencia en sí: **todo lo que hace falta para obedecerla**. Puede ser larga si todo su texto es norma; este registro está siempre en contexto, así que lo que se saca de la celda deja de estar cargado.
   - **Detalle** — `—`, o la página con su **elaboración**: ejemplos, motivos y casos ya discutidos. Lo que **no** hace falta para obedecer.
   - **Código** — ver el paso siguiente.
2. **Chequear las preferencias existentes**: ¿ya hay una regla que lo cubre? → quizás el problema no es que falte la regla sino que no se cumple (eso no se arregla re-escribiéndola — decirlo). ¿Hay una parecida? → proponer **afinarla** en vez de agregar otra.
3. **Decidir el destino** (la estructura es un archivo por origen):
   - **`PREFERENCIAS-LOCAL.md`** (Índice del Agente Desplegado) — la regla es específica de este proyecto. Destino normal: es el único archivo editable localmente.
   - **`PREFERENCIAS.md`** (Índice del Agente Multipropósito) — la regla vale para todos los repos del usuario. Ese archivo **no se edita localmente**: viene del Agente Multipropósito y se actualiza al nivelar. Proponer llevarla al repo que la publica (donde editarla implica subir la versión del plugin y propagar); mientras tanto puede vivir en el del Agente Desplegado.
4. **Asignar el Código.** El prefijo es el origen: `Base-NNNN` en el Índice del Agente Multipropósito, `Local-NNNN` en el del Agente Desplegado. El número es **el mayor que haya en ese Índice, más uno** — nunca la cantidad de filas más uno: si alguna vez se retiró una entrada, contar filas repite un código ya usado. Un código retirado deja un hueco y **no se reusa**. En el texto que queda escrito el código nunca va solo: se dice `Preferencia Base-0007`, no `Base-0007`.
5. **Confirmar con el usuario** el texto exacto y el destino — las preferencias son conducta del agente: nada se asienta sin ok.
6. **Escribir y cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/preferencias/lint-preferencias/lint-preferencias.js
   ```

7. **Reportar**: regla asentada (texto final), destino, y si se recomendó subirla al Agente Multipropósito.

## Reconciliación (idempotencia)

Releer todos los Índices antes de cada escritura. Una regla equivalente devuelve `ya estaba`; una entrada del mismo tema con contenido distinto devuelve `divergente`. La vista previa y una cancelación no modifican nada. Nunca modificar localmente el Índice del Agente Multipropósito de un Agente Desplegado.
