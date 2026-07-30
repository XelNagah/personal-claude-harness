# Preferencias — manifiesto de subsistema

Las **preferencias** son las reglas de conducta del agente en este repo: qué espera el usuario de cómo trabaja y se comunica. Viven acá (`preferencias/`), en una tabla `Código | Nombre | Descripción | Detalle`. A diferencia de las reglas de `conducta`, no las entrega un hook en un momento del flujo: están **siempre en contexto**. Por eso la `Descripción` lleva todo lo que hace falta para obedecer, y solo la elaboración —ejemplos, motivos, casos discutidos— baja a una página de detalle: lo que sale de la celda deja de estar cargado.

El registro se separa **por origen** en dos archivos que lo declaran en su frontmatter. Lo que suma este repo va al del Agente Desplegado.

**Disparador:** el agente **no** consulta este registro a mano — ya lo tiene cargado. Se escribe cuando el usuario corrige lo mismo por segunda vez, o pide que algo quede como regla.

**Skills:** `registrar-preferencia` (aísla la regla, elige el origen, asigna el Código y confirma el texto exacto antes de asentarlo); instalación con `amp:inicializar`.

**Índices:** `PREFERENCIAS.md` (Agente Multipropósito) · `PREFERENCIAS-LOCAL.md` (Agente Desplegado). **Se cargan siempre.** Al cerrar una tarea que tocó preferencias, correr el lint desde la raíz del repo:

```bash
node .claude/preferencias/lint-preferencias/lint-preferencias.js
```

Convención completa en `README.md`.

@PREFERENCIAS.md
@PREFERENCIAS-LOCAL.md
