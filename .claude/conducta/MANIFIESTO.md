# Conducta — manifiesto de subsistema

El subsistema `conducta` asegura comportamientos del tipo "cuando hagas X, asegurate de Y": ata **momentos** del flujo (evento de hook + condición sin juicio) a **acciones** (inyectar un texto, correr una Herramienta, bloquear). Vive acá: las reglas en `INDICE.md`, los momentos en `MOMENTOS.md`, y el hook repartidor `establecer-conducta/`, que entrega en cada momento la regla que corresponde. Trae una **Base** y admite reglas del Propósito. Modelo completo en la memoria `feedback_conducta.md`.

Al escribir un `.md` de cualquier parte del repo, el control `detectar-terminologia-vetada/` **rechaza** el texto con un término vetado sin uso legítimo posible e **informa** los que dependen del significado: citarlo no se frena, usarlo sí.

**Disparador:** el agente **no** consulta este registro a mano — lo entrega el hook. Se edita al **agregar, modificar o dar de baja una regla**; toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**Skills:** ninguna de operación; instalación con `inicializar-conducta`.

**Índice: NO se carga siempre**: cargar las reglas al arranque es el modo de falla que este subsistema corrige — una regla cargada al inicio se recita, no se obedece (conocimiento `modos-de-falla-ante-reglas-escritas`). Se consulta solo para gestionarlo. Al cerrar una tarea que tocó `conducta`, correr el lint desde la raíz:

```bash
node .claude/conducta/lint-conducta/lint-conducta.js
```
