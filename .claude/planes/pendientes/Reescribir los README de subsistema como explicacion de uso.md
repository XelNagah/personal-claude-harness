# Reescribir los README de subsistema como explicación de uso

**Estado: Nuevo · Creado 26-08-10.** Origen: la reescritura de `.claude/comunicacion/README.md` del 10/08/2026, que dejó el molde. Este plan lo aplica a los otros ocho.

## Por qué existe

El usuario pidió que le explicaran cómo funciona el subsistema `comunicacion` y que esa explicación quedara escrita. Al buscar dónde ponerla apareció que el lugar ya existía —el `README.md` del subsistema, que la Decisión Local-0036 (b) creó como *«su explicación entera, a demanda»* y al que el `MANIFIESTO.md` ya delega en los nueve casos— pero que **nadie había definido a quién le habla**. Se llenaron con lo que cada uno tenía a mano cuando se construyó.

Medido el 10/08/2026, antes de tocar nada:

| subsistema | palabras | qué es hoy |
|---|---|---|
| comunicacion | 781 | el modelo, con el porqué de cada decisión de diseño |
| planes | 730 | seis pasos de operación del registro, dirigidos al agente |
| conducta | 687 | — |
| preferencias | 664 | — |
| semantica | 371 | — |
| herramientas | 352 | — |
| decisiones | 272 | — |
| conocimiento | 231 | convención + justificación de diseño |
| subsistemas | 118 | tres párrafos de diseño, cero sobre cómo se usa |

Los nueve existen y **los nueve viajan a la Base**, así que lo que diga cada uno lo hereda todo Agente Desplegado. El rango 118–781 no responde a que unos subsistemas necesiten más explicación que otros: responde a cuánto había para contar el día que se escribieron.

Ejemplo del desajuste, textual de `planes/README.md`: *«copiar a `.claude/planes/pendientes/<nombre-estable>.md` (sin fecha en el nombre) y agregar su fila en `PLANES.md`: Código (`máximo + 1`, nunca `cantidad + 1`, sin reusar huecos)»*. Eso instruye al agente a escribir una fila, y además ya está en la `SKILL.md` de `crear-plan`. Un usuario que quiere saber qué es un plan y cómo se usa el subsistema no encuentra por dónde empezar.

## El molde

Acordado con el usuario y ya aplicado en `.claude/comunicacion/README.md`, que es la referencia a mirar antes de escribir cada uno:

1. **Qué es**, en dos frases — y qué **no** es, cuando hay un vecino con el que se confunde.
2. **Cómo se arranca** — el recorrido numerado desde el estado inicial real (registro vacío), con la invocación literal.
3. **Las decisiones de uso**, con ejemplos llanos — cuándo va cada habilidad, en tabla si son más de dos.
4. **Qué esperar al usarlo** — lo que cuesta, lo que tarda, lo que hay que leer además del resultado.
5. **Lo que no cubre** — los límites que cambian cómo se lo usa.
6. **Dónde está el detalle** — punteros a los README de mecanismo y al lint.

**Lo que baja al detalle:** el *por qué se decidió cada cosa*. En `comunicacion` eso sacó cuatro textos que estaban escritos dos y tres veces (por qué el modo `plan` no sirve, por qué la habilidad se llama `preguntar`, por qué cada modo es una habilidad, por qué no se enumeran las herramientas del consultado). Buscar el equivalente en cada subsistema: la duplicación entre el README del subsistema y el del mecanismo o el lint es el hallazgo esperado, no una excepción.

## Condicionantes por subsistema

- **Decisión Local-0048** — a la Base sube lo que le sirve al Agente Desplegado para hacer su trabajo; lo que este repo aprendió construyendo el harness se queda acá como documentación del proyecto. Distingue **por beneficiario, no por tema**.
- **Decisión Local-0036 (b)** — el README es la explicación entera, a demanda; el manifiesto delega y no repite.
- **Conocimiento Base-0001** — antes de escribir una sección, chequear si ya está en la `SKILL.md` de la habilidad o en el README del lint. Si está, se apunta, no se copia.
- **Lo que viaja no cita decisiones de este repo** (`lint-harness` lo marca) ni trae ejemplos suyos: la razón se enuncia sin el número.
- **El manifiesto puede necesitar el campo `Flujo de trabajo`** (Decisión Local-0023) si el subsistema es multi-paso y no lo declara. Ojo con el tope de 220 palabras: al 10/08/2026, `semantica` estaba en 220, `herramientas` en 218, `conducta` y `planes` en 215.

## Cómo se ejecuta

De a un subsistema por vez. Cada uno cierra con:

```bash
node .claude/herramientas/sincronizar-base/sincronizar-base.js --aplicar
node .claude/herramientas/ejecutar-control-cierre/ejecutar-control-cierre.js
```

Y al terminar la tanda, subir la versión del plugin `amp` (los README viajan adentro) y publicar; si no, ningún Agente Desplegado recibe el cambio.

## Pendiente de decidir

- **Si el registro es impersonal o de tuteo.** `comunicacion` quedó impersonal, como el resto de la Base. Si se cambia, se cambian los nueve.

El rol del README y el molde de seis secciones ya no están pendientes: se asentaron en la **Decisión Local-0066** (*El README de subsistema explica al usuario cómo se usa*) el 10/08/2026.

## Planes relacionados, que no lo cubren

- **Plan Local-0049 (*Skill del Agente Multipropósito para explicar el harness completo*)** — explica la **articulación entre** subsistemas; este explica **cada uno por dentro**. Complementarios: si aquel se ejecuta, toma estos README como fuente.
- **Plan Local-0036 (*Revisar cada subsistema — sentido, disparador y skill de operación*)** — trata de que cada subsistema tenga con qué dispararse para poblarse. Distinto problema.
