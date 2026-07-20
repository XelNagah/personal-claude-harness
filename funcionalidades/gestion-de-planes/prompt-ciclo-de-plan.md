# Prompt: ciclo de un plan (agnóstico)

Versión agnóstica de la skill `ciclo-de-plan`. Reemplazá `<config>` por el directorio de configuración del agente (p. ej. `.claude`).

---

Operá el ciclo de planes de `<config>/planes/` manteniendo sincronizados archivo, registro y encabezado. **Leé primero `<config>/planes/ESTADOS.md`** — define los estados, su carpeta y cuáles son terminales (configurable por repo; no asumas los nombres).

**Abrir un plan:**
1. Escribí el plan en `planes/pendientes/<nombre-estable>.md` — nombre sin fecha ni paréntesis, que no cambia nunca: es la identidad del plan.
2. Encabezado: `**Estado: <estado> · Creado <fecha>.**`
3. Fila en `PLANES.md`: link, Estado, Creado (`AA-MM-DD`), Cerrado `—`, Origen si se desprende de otro plan, Notas cortas.

**Transicionar:**
1. Validá el estado nuevo contra `ESTADOS.md`.
2. Mové el archivo a la carpeta del estado **sin renombrar** (mover, nunca duplicar).
3. Actualizá la fila: estado, link (cambió la ruta), Cerrado si es terminal, Notas. Ejecutado → sección `## Notas de implementación` en el documento (cómo se implementó vs. lo planificado, hash de commit). Descartado → motivo **obligatorio** en Notas.
4. Actualizá el encabezado del documento para que no contradiga al registro.
5. Reparación de referencias entrantes si las hubiera.

**Detección pasiva:** si hay evidencia de que un plan pendiente ya se implementó (commit, mensaje del usuario, código verificado), proponé pasarlo a Ejecutado.

**Cierre (siempre):** corré `node <config>/planes/lint-planes/lint-planes.js` desde la raíz → 0 hallazgos (caza transiciones a medias). Reportá la transición y el resultado.
