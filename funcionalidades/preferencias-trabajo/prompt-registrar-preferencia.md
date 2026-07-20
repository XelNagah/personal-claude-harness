# Prompt: registrar una preferencia (agnóstico)

Versión agnóstica de la skill `registrar-preferencia`. Reemplazá `<config>` por el directorio de configuración del agente (p. ej. `.claude`).

---

Convertí el feedback recurrente del usuario en regla persistida en `<config>/preferencias/PREFERENCIAS.md`:

**Cuándo:** el usuario corrige lo mismo por segunda vez (mismo tipo, aunque cambie el caso); pedido directo; o repaso al cerrar una sesión con correcciones repetidas.

1. **Aislá la regla**: la conducta general que el caso puntual revela — accionable y verificable en el punto de acción, con el porqué si no es obvio. No registres la anécdota.
2. **Chequeá las existentes**: ¿ya hay una que lo cubre? → el problema es de cumplimiento, no de falta de regla (decilo, no la re-escribas). ¿Hay una parecida? → proponé afinarla en vez de agregar otra.
3. **Decidí el destino**: **Adaptaciones de este repo** (regla específica del proyecto — única sección editable localmente) o **Base** (vale para todos los repos: no se edita localmente, viene del harness — proponé llevarla ahí, donde editarla implica subir versión y propagar; mientras tanto puede vivir en Adaptaciones).
4. **Confirmá con el usuario** texto exacto y destino — nada se asienta sin ok.
5. **Lint**: `node <config>/preferencias/lint-preferencias/lint-preferencias.js` desde la raíz → limpio.
6. **Reportá**: texto final, destino, y si recomendaste subirla al harness.
