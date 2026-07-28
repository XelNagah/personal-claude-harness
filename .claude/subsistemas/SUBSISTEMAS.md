# Subsistemas

Catálogo de casas persistentes del Agente Multipropósito. La Base la mantiene `amp:actualizar`; el Propósito puede sumar casas con `agregar-subsistema`.

## Subsistemas Base

| Subsistema | Qué guarda | Operación |
|---|---|---|
| [subsistemas](./) | Catálogo y coordinación entre casas | `agregar-subsistema`, `reubicar-aprendizaje` |
| [preferencias](../preferencias/) | Preferencias del usuario y adaptaciones del repo | `registrar-preferencia` |
| [planes](../planes/) | Planes y su ciclo de vida | `ciclo-de-plan` |
| [conocimiento](../conocimiento/) | Lo que el agente sabe y necesita reutilizar | `registrar-conocimiento`, `buscar-conocimiento` |
| [semantica](../semantica/) | Vocabulario legítimo y relaciones vetadas | `converger-terminologia` |
| [decisiones](../decisiones/) | Decisiones estructurales | `registrar-decision` |
| [herramientas](../herramientas/) | Herramientas repetibles y su registro | `registrar-herramienta` |
| [conducta](../conducta/) | Reglas entregadas en el momento de actuar | `registrar-regla` |

## Subsistemas del Propósito

| Subsistema | Qué guarda | Operación |
|---|---|---|
