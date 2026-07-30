---
indice: Preferencias del Agente Desplegado
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Detalle]
descripcion: la preferencia en sí — lo que hace falta saber para obedecerla
---

# Preferencias del Agente Desplegado

Las que este repo suma para su Propósito. Siempre en contexto (importado desde AGENTS.md). El nivelador no toca este archivo. Las columnas y la convención completa están en [`PREFERENCIAS.md`](PREFERENCIAS.md).

| Código | Nombre | Descripción | Detalle |
|--------|--------|-------------|---------|
| Local-0001 | Usar fechas en formato argentino al hablar con el usuario | `DD/MM/AAAA` (`21/07/2026`) o en palabras (`21 de julio de 2026`). Nunca `MM/DD` ni ISO en la conversación. ⚠️ Esto es **solo la conversación**: los formatos de los registros no se tocan — `AA-MM-DD` en `PLANES.md` y `AAAA-MM-DD` en `decisiones/INDICE.md` son datos con lint. | — |
| Local-0002 | Tomar los ejemplos del dominio del repo, sin analogías deportivas | Ejemplos y analogías: usar el dominio del repo o casos neutros. **Nada de analogías deportivas** (fútbol, jugadores, plantel). Si un ejemplo necesita un dominio inventado, preferir uno ya presente en el repo o un caso real ya decidido. | — |
| Local-0003 | Guardar los archivos temporales en `.claude/tmp/` | Los archivos temporales de trabajo (traspasos, notas de sesión, borradores) van en `.claude/tmp/` dentro del repo, no en la raíz ni en el directorio temporal del sistema — así se referencian con ruta corta relativa y un agente limpio los encuentra. `.claude/tmp/` está gitignoreado. Pisa la regla global de usar el directorio temporal del sistema. | — |
| Local-0004 | No contar como costo lo que ya está comprometido en todas las opciones | Al comparar alternativas, no contar como costo de una opción algo que ya está comprometido en todas. Si el trabajo se va a hacer igual por otro motivo, es precio ya pagado: sumarlo a una sola opción la hace ver artificialmente cara y empuja la decisión hacia el lado equivocado. | — |
| Local-0005 | Enumerar tres o más elementos en lista de bullets | Al enumerar tres o más elementos en una respuesta, presentarlos en lista de bullets, no en una sola línea de texto corrido — es más fácil de escanear que un párrafo donde todo pesa igual. | — |
