# Conducta — manifiesto de subsistema

El subsistema `conducta` asegura comportamientos del tipo "cuando hagas X, asegurate de Y": ata **momentos** del flujo a **acciones** (inyectar un texto, correr una Herramienta, bloquear). Sus reglas viven en `INDICE.md`, sus momentos en `MOMENTOS.md` y el hook `establecer-conducta/` las entrega. Trae una **Base** y admite reglas del Propósito. Modelo completo en `README.md`.

Al escribir un `.md` de cualquier parte del repo, el control `detectar-terminologia-vetada/` **rechaza** el texto con un término vetado sin uso legítimo posible e **informa** los que dependen del significado: citarlo no se frena, usarlo sí.

**Disparador:** el agente **no** consulta este registro a mano — lo entrega el hook. Se edita al **agregar, modificar o dar de baja una regla**; toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**Skills:** `registrar-regla` (alta, modificación o baja guiada de una regla y su momento); instalación con `amp:inicializar`.

**Índice: NO se carga siempre**: cargar las reglas al arranque es el modo de falla que este subsistema corrige — una regla cargada al inicio se recita, no se obedece (conocimiento `modos-de-falla-ante-reglas-escritas`). Se consulta solo para gestionarlo. Al cerrar una tarea que tocó `conducta`, correr el lint desde la raíz:

```bash
node .claude/conducta/lint-conducta/lint-conducta.js
```
