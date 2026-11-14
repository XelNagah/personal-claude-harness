# El agente le pide al usuario que copie un texto a otra sesión en vez de consultar al otro repo

**Estado: Nuevo · Creado 26-11-13.** Origen: plan Local-0129 (plan maestro), arreglo 4 del análisis de un mes de conversaciones. Informe: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\analisis-2026-11\agentes-que-no-usan-lo-guardado.md`.

## El problema

Caso, repo del Agente Multipropósito, 13/11/2026: el agente tenía `amp-comunicacion:preguntar` y le pidió al usuario que abriera una sesión en otro repo y pegara un texto. El usuario: «¿Por qué no usas la herramienta de comunicación y le preguntás directamente? … Para eso tenemos el AMP». Además, el Índice de Agentes Multipropósito Conocidos estaba vacío; una vez señalado, registrar al otro repo y consultarlo llevó un minuto.

Por qué pasa (inferencia del análisis, sin medir):
- La `description` de `preguntar` se dispara por frases del usuario («preguntale al otro agente»), no por lo que el agente está por hacer.
- `buscar-agentes` contempla el Índice vacío, pero solo si antes apareció la intención de consultar. Las dos fallas se encadenan.

## Lo que hay que resolver

1. Que la comunicación se active cuando el agente está por pedirle al usuario que haga de intermediario (abrir otra sesión, copiar un texto). Puede ser `description` o regla de conducta: relacionado con el plan Local-0130.
2. Avisar cuando el Índice de comunicación está vacío (por ejemplo, en la Pantalla de bienvenida).
3. Unificar con la habilidad `consultar-agente` que tiene el repo Agente Coordinador, según el análisis.
4. Medir con la Herramienta Local-0012 `probar-disparo-de-skills`.

## Cruces

- plan Local-0107 (Que la consulta a otro Agente use la credencial correcta de la máquina): mismo subsistema; van en el mismo grupo de trabajo.
- Decisión Local-0065: el modo es la habilidad; cualquier disparo nuevo tiene que elegir entre `preguntar` y `resolver`, no mezclarlos.
- Este repo publica el mecanismo y mantiene su Índice de comunicación sin filas: la fila agregada el 13/11/2026 para consultar a `como-uso-claude` no se commitea.
