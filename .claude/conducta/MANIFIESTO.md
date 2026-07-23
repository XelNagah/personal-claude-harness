# Conducta — manifiesto de subsistema

El subsistema `conducta` asegura comportamientos del tipo "cuando hagas X, asegurate de Y": ata **momentos** del flujo (evento de hook + condición sin juicio) a **acciones** (inyectar un texto, correr una Herramienta, bloquear). Vive en este directorio (`conducta/`): el registro de reglas en `INDICE.md`, el vocabulario de momentos en `MOMENTOS.md`, y el hook repartidor `establecer-conducta/`, que lee el registro vivo y entrega en cada momento la regla que corresponde. Viene con una **Base** instalada (respetar preferencias, no acuñar terminología, contrastar al escribir, registrar cuando algo cambia) y admite reglas del Propósito de cada repo. Modelo completo en la decisión 0021.

**Disparador:** en el flujo normal el agente **no** consulta este registro a mano — lo entrega el hook. Se edita al **agregar, modificar o dar de baja una regla**; toda regla nueva que toque terminología o decisiones pasa por el usuario (0004/0016).

**Índice: NO se carga siempre** (decisión 0017), y es deliberado: cargar las reglas al arranque es el modo de falla que este subsistema corrige (una regla cargada al inicio se recita, no se obedece — conocimiento `modos-de-falla-ante-reglas-escritas`). Llegan por el hook; el registro se consulta a demanda solo para gestionarlo. Al cerrar una tarea que tocó `conducta`, correr el lint desde la raíz del repo:

```bash
node .claude/conducta/lint-conducta/lint-conducta.js
```
