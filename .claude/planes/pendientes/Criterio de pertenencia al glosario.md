# Criterio de pertenencia al glosario

**Estado: Nuevo · Creado 26-07-22.** Disparado por el rechazo de "disparador" como concepto (26-07-22): Javier lo bajó por **demasiado genérico** y **no del dominio** —"además podría haber más adelante nuevos conceptos para 'disparador'"—. El glosario ya tiene **gobernanza** (quién propone/ratifica/veta — decisiones 0004/0018), pero **no** un criterio de **pertenencia**: qué ES un concepto que amerita entrar y qué no.

## Qué se pide

Un criterio explícito del subsistema glosario para **dejar claro qué cosas deberían ir al glosario y cuáles no** — que el agente pueda aplicar antes de proponer, y el usuario al ratificar. Hoy la decisión es tácita ("solo términos propios del dominio, no conceptos generales de programación"), y cada sesión la reinterpreta.

## Material que ya lo bordea

- `glosario/INDICE.md` dice: *"Solo términos **propios del dominio** (no conceptos generales de programación)"* — es una regla, pero fina y sin filo para casos borde.
- Conocimiento [terminología farlopa](../../conocimiento/terminologia-farlopa.md): el otro lado — términos ajenos que **no** deben entrar como canónicos (se vetan).
- Contraste vivo: **"disparador"** (rechazado: genérico, transversal, reusable en muchos contextos) vs. **"Manifiesto de subsistema"** (aceptado: concepto propio del harness, con mecánica específica).

## A evaluar (no decidido)

- ¿El criterio es una **prueba** (como la de conocimiento: *"¿seguiría siendo cierto si el repo no existiera?"*) o una **lista de señales** (propio del dominio, no reusable en otros dominios, con mecánica/definición específica, no un adjetivo/rol genérico)?
- ¿Dónde vive? ¿En el `MANIFIESTO.md` del glosario (siempre en contexto, gobierna la propuesta), en la memoria `feedback_glosario.md`, o en ambos?
- ¿Distingue **concepto** de **alias**? Un término genérico podría entrar como alias de un concepto existente sin merecer fila propia.
- Relación con la gobernanza (0004/0018): el criterio filtra **qué** se propone; la gobernanza filtra **quién** lo asienta. Son ejes distintos, se complementan.

## Diseñar con `planificar`

Correr por `planificar` antes de tocar el glosario. Cierra un hueco real: sin criterio de pertenencia, el glosario oscila entre inflarse con términos genéricos y rechazarlos sin regla escrita.
