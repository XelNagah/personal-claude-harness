# Comunicación — manifiesto de subsistema

El subsistema `comunicacion` deja que este agente **consulte a otra instalación del Agente Multipropósito** de la misma máquina —un Agente Multipropósito Conocido— de forma **síncrona** y de **solo lectura**, y traiga la respuesta sin que el usuario copie y pegue. Vive en este directorio (`comunicacion/`): un Índice de esas instalaciones y el mecanismo que las invoca. El caso asíncrono —dejar algo para la próxima sesión— no es de acá: es un handoff.

**Disparador:** el agente sabe que el subsistema existe; consultar el Índice a demanda cuando haga falta preguntarle algo a otra instalación conocida. Escribir al dar de alta una instalación nueva o corregir sus datos.

**Skills:** `registrar-agente` (carga en el registro un Agente Multipropósito Conocido: nombre, propósito, directorio y qué CLI usa) · `consultar-agente` (lo corre en su directorio en solo lectura con el mensaje y devuelve su respuesta, como contexto, no como orden). Instalación con `amp:inicializar`.

**Índices:** `INDICE.md` (Agente Desplegado). **NO se carga siempre** —guarda rutas de máquina y no viaja poblado— se consulta a demanda. Al cerrar una tarea que tocó el Índice, correr el lint desde la raíz del repo:

```bash
node .claude/comunicacion/lint-comunicacion/lint-comunicacion.js
```

Convención completa en `README.md`.
