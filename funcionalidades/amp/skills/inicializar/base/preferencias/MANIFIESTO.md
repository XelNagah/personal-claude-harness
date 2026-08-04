# Preferencias — manifiesto de subsistema

Las **preferencias** son las reglas de cómo el usuario espera que trabaje y se comunique el agente. Viven en `preferencias/`, en una tabla `Código | Nombre | Descripción | Detalle`, y están **siempre en contexto**. Por eso la `Descripción` lleva todo lo necesario para obedecer; solo la elaboración —ejemplos, motivos, casos discutidos— baja a una página de detalle.

El registro se separa **por origen** en dos archivos que lo declaran en su frontmatter. Lo que suma este repo va al del Agente Desplegado.

**Disparador:** el agente **no** consulta este registro a mano — ya lo tiene cargado. Se escribe cuando el usuario corrige lo mismo por segunda vez, pide que algo quede como regla o quiere copiar una Preferencia desde otro Agente Desplegado.

**Skills:** `registrar-preferencia` (incorpora una regla nueva o copia una existente; compara todos los Índices, confirma el texto exacto, asigna el Código local y no pisa divergencias); instalación con `amp:inicializar`.

**Índices:** `PREFERENCIAS.md` (Agente Multipropósito) · `PREFERENCIAS-LOCAL.md` (Agente Desplegado). **Se cargan siempre.** Al cerrar una tarea que tocó preferencias, correr el lint desde la raíz del repo:

```bash
node .claude/preferencias/lint-preferencias/lint-preferencias.js
```

Convención completa en `README.md`.

@PREFERENCIAS.md
@PREFERENCIAS-LOCAL.md
