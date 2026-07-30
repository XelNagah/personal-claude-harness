# Conducta — manifiesto de subsistema

El subsistema `conducta` asegura comportamientos del tipo "cuando hagas X, asegurate de Y": ata **momentos** del flujo a **acciones** de una **clase** — `Inyectar` un texto, `Ejecutar` una Herramienta, `Bloquear` la acción. Los momentos viven en `MOMENTOS.md` (y los propios del repo en `MOMENTOS-LOCAL.md`), las clases en `CLASES.md` —que no se extiende por repo: están en el código del repartidor—, y el hook `establecer-conducta/` entrega las reglas. Modelo completo en `README.md`.

Al escribir un `.md` de cualquier parte del repo, el control `detectar-terminologia-vetada/` **rechaza** el texto con un término vetado sin uso legítimo posible e **informa** los que dependen del significado: citarlo no se frena, usarlo sí.

**Disparador:** el agente **no** consulta este registro a mano — lo entrega el hook. Se edita al **agregar, modificar o dar de baja una regla**; toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**Skills:** `registrar-regla` (alta, modificación o baja guiada de una regla y su momento); instalación con `amp:inicializar`.

**Índices:** `INDICE.md` (Agente Multipropósito) · `INDICE-LOCAL.md` (Agente Desplegado). **No se cargan siempre**: una regla cargada al inicio se recita, no se obedece (conocimiento `modos-de-falla-ante-reglas-escritas`). Al cerrar una tarea que tocó `conducta`, correr el lint desde la raíz:

```bash
node .claude/conducta/lint-conducta/lint-conducta.js
```
