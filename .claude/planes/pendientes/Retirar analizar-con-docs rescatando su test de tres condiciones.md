# Retirar analizar-con-docs rescatando su test de tres condiciones

**Estado: Nuevo · Creado 26-07-26.** Origen: viajó en seis traspasos consecutivos
(24/07 al 26/07/2026) sin llegar nunca a un plan, así que vivía solo en
`.claude/tmp/`, que está gitignoreado.

## Qué se retira y por qué

La habilidad `analizar-con-docs` (`~/.claude/skills/analizar-con-docs/`) es el
ancestro de `amp:planificar` — el linaje es `grill-with-docs` →
`analizar-con-docs` → `amp:planificar` — y su sentido ya está incorporado en la
descendiente. Queda como copia vieja que compite por el mismo disparo.

`deep-research`, que vive en el mismo directorio, **no** se toca: es una
herramienta general, ajena al Agente Multipropósito.

## Precondición: rescatar el test antes de borrar

`analizar-con-docs` tiene un criterio que la descendiente perdió. Dice cuándo
vale la pena ofrecer asentar una decisión, y hoy `amp-decisiones:registrar-decision`
y `amp:planificar` dicen apenas "solo si es estructural", que no es operable.
Las tres condiciones, y hacen falta las tres:

1. **Difícil de revertir** — el costo de cambiar de opinión más adelante es relevante.
2. **Sorprendente sin contexto** — un futuro lector se va a preguntar "¿por qué lo hicieron así?".
3. **Resultado de una elección con alternativas reales** — había opciones genuinas y se eligió una por razones específicas.

Si falta cualquiera de las tres, no se ofrece asentar la decisión.

Incorporarlo a `amp-decisiones:registrar-decision` y a `amp:planificar` **antes**
de borrar la habilidad. Es texto que viaja, así que sube versión de plugin.

## A decidir

- Si el test entra como criterio de la habilidad o como definición en el
  manifiesto de `decisiones` (hoy el manifiesto dice "estructurales al propósito
  del repo, no las operativas triviales", que es la misma vaguedad).
- Qué significa "retirar" una habilidad servida por enlace: borrar el enlace, la
  carpeta fuente, o las dos.
