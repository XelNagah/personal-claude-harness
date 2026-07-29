---
indice: Subsistemas
origen: agente-multiproposito
columnas: [Subsistema, Qué guarda, Operación]
---

# Subsistemas

Catálogo de casas persistentes del Agente Multipropósito, separado por origen en **dos archivos** que lo declaran en su frontmatter: este (`origen: agente-multiproposito`, lo mantiene `amp:actualizar`, que lo reemplaza entero) y [`SUBSISTEMAS-LOCAL.md`](SUBSISTEMAS-LOCAL.md) (`origen: agente-desplegado`, las casas que suma el Propósito con `agregar-subsistema`; el nivelador no lo abre).

## Subsistemas del Agente Multipropósito

| Subsistema | Qué guarda | Operación |
|---|---|---|
| [subsistemas](./) | Catálogo y coordinación entre casas | `agregar-subsistema`, `reubicar-aprendizaje` |
| [preferencias](../preferencias/) | Preferencias del usuario, las del Agente Multipropósito y las del repo | `registrar-preferencia` |
| [planes](../planes/) | Planes y su ciclo de vida | `ciclo-de-plan` |
| [conocimiento](../conocimiento/) | Lo que el agente sabe y necesita reutilizar | `registrar-conocimiento`, `buscar-conocimiento` |
| [semantica](../semantica/) | Vocabulario legítimo y relaciones vetadas | `converger-terminologia` |
| [decisiones](../decisiones/) | Decisiones estructurales | `registrar-decision` |
| [herramientas](../herramientas/) | Herramientas repetibles y su registro | `registrar-herramienta` |
| [conducta](../conducta/) | Reglas entregadas en el momento de actuar | `registrar-regla` |
