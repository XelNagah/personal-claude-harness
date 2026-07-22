# Conocimiento — manifiesto de subsistema

Todo lo que el agente **sabe** vive en una ubicación única: este directorio (`conocimiento/`), indexado por `INDICE.md`. Nunca en la raíz del repo. Los `.md` de la raíz (README y REGISTRO) son **documentación del proyecto**, no conocimiento de agente.

**Disparador:** asentar al averiguar algo del dominio que costó descubrir y que va a hacer falta de nuevo — cómo funciona un sistema externo, un formato, una restricción real. La prueba que lo separa de la memoria: **¿seguiría siendo cierto si este repo no existiera?** Sí → conocimiento; no → memoria o decisión. Usar la skill `registrar-conocimiento`. Un hallazgo que se explica y no se asienta se vuelve a averiguar en la sesión siguiente.

**Índice: se carga siempre** (liviano — decisión 0017). Al cerrar una tarea que escribió conocimiento, correr el lint desde la raíz del repo:

```bash
node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js
```

Chequea refs rotas, índice incompleto y huérfanos. Convención en la memoria `feedback_base_conocimiento.md`.

@INDICE.md
