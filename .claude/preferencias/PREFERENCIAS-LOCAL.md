---
indice: Preferencias del Agente Desplegado
origen: agente-desplegado
---

# Preferencias del Agente Desplegado

Las que este repo suma para su Propósito. Siempre en contexto (importado desde AGENTS.md). El nivelador no toca este archivo. La convención completa está en [`PREFERENCIAS.md`](PREFERENCIAS.md).

- **Fechas en formato argentino** al hablar con el usuario: `DD/MM/AAAA` (`21/07/2026`) o en palabras (`21 de julio de 2026`). Nunca `MM/DD` ni ISO en la conversación. ⚠️ Esto es **solo la conversación**: los formatos de los registros no se tocan — `AA-MM-DD` en `PLANES.md` y `AAAA-MM-DD` en `decisiones/INDICE.md` son datos con lint.
- Ejemplos y analogías: usar el dominio del repo o casos neutros. **Nada de analogías deportivas** (fútbol, jugadores, plantel). Si un ejemplo necesita un dominio inventado, preferir uno ya presente en el repo o un caso real ya decidido.
- **Archivos temporales de trabajo** (handoffs, notas de sesión, borradores) van en **`.claude/tmp/`** dentro del repo, no en la raíz ni en el directorio temporal del sistema — así se referencian con ruta corta relativa y un agente limpio los encuentra. `.claude/tmp/` está gitignoreado. (Adaptación de este repo: pisa la regla global de usar el scratchpad del sistema.)
- **Al comparar alternativas, no contar como costo de una opción algo que ya está comprometido en todas.** Si el trabajo se va a hacer igual por otro motivo, es precio ya pagado: sumarlo a una sola opción la hace ver artificialmente cara y empuja la decisión hacia el lado equivocado. (Candidato a subir a las preferencias del Agente Multipropósito y propagarse: es un criterio universal de comparación, no específico de este repo.)
- **Al enumerar** tres o más elementos en una respuesta, presentarlos en **lista de bullets**, no en una sola línea de texto corrido — es más fácil de escanear que un párrafo donde todo pesa igual. (Candidato a subir a las preferencias del Agente Multipropósito y propagarse: es estilo universal, no específico de este repo.)
