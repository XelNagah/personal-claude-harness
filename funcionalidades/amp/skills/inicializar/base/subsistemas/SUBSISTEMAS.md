---
indice: Subsistemas
origen: agente-multiproposito
columnas: [Código, Nombre, Descripción, Operación, Detalle]
descripcion: qué guarda ese subsistema
---

# Subsistemas

Catálogo de casas persistentes del Agente Multipropósito, separado por origen en **dos archivos** que lo declaran en su frontmatter: este (`origen: agente-multiproposito`, lo mantiene `amp:actualizar`, que lo reemplaza entero) y [`SUBSISTEMAS-LOCAL.md`](SUBSISTEMAS-LOCAL.md) (`origen: agente-desplegado`, las casas que suma el Propósito con `agregar-subsistema`; el actualizador no lo abre).

- **Código** — `Base-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — el nombre del subsistema, que es también el de su carpeta.
- **Descripción** — qué guarda, en una línea.
- **Operación** — las skills que lo operan.
- **Detalle** — su casa: la carpeta con su manifiesto y sus Índices.

## Subsistemas del Agente Multipropósito

| Código | Nombre | Descripción | Operación | Detalle |
|---|---|---|---|---|
| Base-0001 | subsistemas | Catálogo y coordinación entre casas | `agregar-subsistema`, `reubicar-aprendizaje` | [subsistemas/](./) |
| Base-0002 | preferencias | Preferencias del usuario, las del Agente Multipropósito y las del repo | `registrar-preferencia` | [preferencias/](../preferencias/) |
| Base-0003 | planes | Planes y su ciclo de vida | familia por verbo (`crear-plan`…`descartar-plan`) | [planes/](../planes/) |
| Base-0004 | conocimiento | Lo que el agente sabe y necesita reutilizar | `registrar-conocimiento`, `buscar-conocimiento` | [conocimiento/](../conocimiento/) |
| Base-0005 | semantica | Vocabulario legítimo y relaciones vetadas | `converger-terminologia` | [semantica/](../semantica/) |
| Base-0006 | decisiones | Decisiones estructurales | `registrar-decision` | [decisiones/](../decisiones/) |
| Base-0007 | herramientas | Herramientas repetibles y su registro | `registrar-herramienta` | [herramientas/](../herramientas/) |
| Base-0008 | conducta | Reglas entregadas en el momento de actuar | `registrar-regla` | [conducta/](../conducta/) |
| Base-0009 | comunicacion | Comunicación en el momento con otras instalaciones del Agente Multipropósito | `buscar-agentes`, `registrar-agente`, `preguntar`, `resolver` | [comunicacion/](../comunicacion/) |
