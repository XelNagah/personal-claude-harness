# Prompt: inicializar gestión de planes

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto.
>
> **Depende de la memoria local.** Si todavía no configuraste el sistema de memoria, pegá antes el prompt de `memoria-local`.

---

Configurá en este proyecto la gestión de planes persistida, usando el directorio de configuración **nativo de tu harness** (`.claude/`, `.codex/`, `.cursor/`, `.github/`, o `.agent/` si no hay convención). En lo que sigue, `<config>/` es ese directorio. Si parte ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Este prompt es seguro de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el archivo/carpeta destino. Nunca reescribas de cuajo un archivo existente.
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectá equivalentes.** La memoria del flujo o la sección de planes puede estar ya con otro título o redacción. Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pises**: reportá la divergencia y preguntame antes de reconciliar.
- **Reportá al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere tu decisión).

## 1. Carpetas de planes

Asegurá `<config>/planes/planes-pendientes/` y `<config>/planes/planes-ejecutados/` (creá las que falten, con `.gitkeep` si el repo usa git; si ya existen con planes adentro, no las toques). El ciclo de vida completo queda definido en la memoria `feedback_flujo_planes.md` (abajo) — es la fuente de verdad del flujo.

## 2. Memoria del flujo

Asegurá la memoria `feedback_flujo_planes.md` (contenido completo al final) bajo `<config>/memory/` y su línea en `MEMORY.md`. Si ya existe esa memoria o una equivalente, no la dupliques; si difiere, reportala como `divergente` y preguntame.

## 3. Referencia en las instrucciones del proyecto

En el archivo de instrucciones de tu harness, asegurá una sección **"Planes del proyecto"** con links a `<config>/planes/planes-pendientes/` y `<config>/planes/planes-ejecutados/`, el formato de nombre `AA-MM-DD - [Descripción corta].md` y un puntero a la memoria del flujo.

## 4. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.

---

## Contenido de la memoria

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes en este proyecto — persistencia en <config>/planes/, ciclo pendiente→ejecutado, formato de nombre, secciones obligatorias al ejecutar"
metadata:
  type: feedback
---

Persistir y gestionar planes en este proyecto bajo `<config>/planes/` con dos subcarpetas: `planes-pendientes/` y `planes-ejecutados/`.

**Why:** El user quiere trazabilidad de qué se planificó, cuándo se cerró y cuándo y cómo se ejecutó — sin depender de archivos efímeros de plan-mode que genere el harness.

**How to apply:**

1. **Al cerrar un plan** (listo para ejecutar): copiar a `<config>/planes/planes-pendientes/AA-MM-DD - [Descripción corta].md`. Fecha = día en que se cerró. Formato año dos dígitos.
2. **Cada actualización al plan** se replica en la versión persistida en `planes-pendientes/`. La copia es la fuente de verdad para el seguimiento — no el archivo interno del harness.
3. **Al detectar evidencia de implementación** (commit en repo, mensaje del user, código verificado, otro agente lo informó): mover el archivo de `planes-pendientes/` a `planes-ejecutados/`. Renombrar:
   - Reemplazar fecha del nombre por la fecha de ejecución (o del momento en que se entera el agente).
   - Dentro del `.md`, agregar una línea **`Plan cerrado: AA-MM-DD`** (fecha original del filename antes del renombre — para no perderla).
   - Agregar sección **`## Notas de implementación`** con: cómo se implementó efectivamente vs planificado, hash de commit (preferentemente), cosas notables.
4. **Reparar referencias entrantes al plan.** Mover/renombrar rompe links que apuntaban al plan: buscar y actualizar referencias en memorias y otros planes antes de cerrar.
5. Tras esos pasos el plan se considera implementado.

Importante: borrar el archivo de `planes-pendientes/` al moverlo — no duplicar.

Nota: un plan puede persistirse en `planes-pendientes/` **antes** de estar cerrado si el user lo pide (p. ej. para cortar una sesión larga de diseño); en ese caso debe llevar al tope un bloque de estado explícito ("EN DISEÑO — no listo para ejecutar") y la lista de pendientes para retomar.
```

> Reemplazá `<config>` por el directorio real de tu harness en la memoria.
