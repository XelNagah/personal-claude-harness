# Plantilla del setup completo

Textos verbatim que el orquestador escribe. (Réplica de los textos de las piezas individuales; mantener sincronizado al cambiar una preferencia.)

## §Preferencias — secciones de `.claude/CLAUDE.md`

### Preferencias de comunicación

> Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.

### Principios de trabajo

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.

## §Formato — frontmatter de una memoria

```markdown
---
name: <slug-kebab-case>
description: <resumen de una línea — se usa para decidir relevancia>
metadata:
  type: user | feedback | project | reference
---

<el hecho; para feedback/project seguir con líneas **Why:** y **How to apply:**>
```

Tipos: `user` (quién es el usuario), `feedback` (correcciones y enfoques confirmados, con el porqué), `project` (objetivos/restricciones no derivables del código), `reference` (punteros externos). Antes de crear una nueva, revisar si una existente ya la cubre. Fechas siempre absolutas.

## Memorias verbatim

### `feedback_flujo_planes.md`

```markdown
---
name: flujo-planes
description: "Cómo gestionar planes en este proyecto — persistencia en .claude/planes/, ciclo pendiente→ejecutado, formato de nombre, secciones obligatorias al ejecutar"
metadata:
  type: feedback
---

Persistir y gestionar planes en este proyecto bajo `.claude/planes/` con dos subcarpetas: `planes-pendientes/` y `planes-ejecutados/`.

**Why:** El user quiere trazabilidad de qué se planificó, cuándo se cerró y cuándo y cómo se ejecutó — sin depender de archivos efímeros de plan-mode que genere el harness.

**How to apply:**

1. **Al cerrar un plan** (listo para ejecutar, post-ExitPlanMode o equivalente): copiar a `.claude/planes/planes-pendientes/AA-MM-DD - [Descripción corta].md`. Fecha = día en que se cerró. Formato año dos dígitos.
2. **Cada actualización al plan** se replica en la versión persistida en `planes-pendientes/`. La copia es la fuente de verdad para el seguimiento — no el archivo del plans-folder del harness.
3. **Al detectar evidencia de implementación** (commit en repo, mensaje del user, código verificado, otro agente lo informó): mover el archivo de `planes-pendientes/` a `planes-ejecutados/`. Renombrar:
   - Reemplazar fecha del nombre por la fecha de ejecución (o del momento en que se entera el agente).
   - Dentro del `.md`, agregar una línea **`Plan cerrado: AA-MM-DD`** (fecha original del filename antes del renombre — para no perderla).
   - Agregar sección **`## Notas de implementación`** con: cómo se implementó efectivamente vs planificado, hash de commit (preferentemente), cosas notables.
4. **Reparar referencias entrantes al plan.** Mover/renombrar rompe links que apuntaban al plan: buscar y actualizar referencias en memorias y otros planes antes de cerrar.
5. Tras esos pasos el plan se considera implementado.

Importante: borrar el archivo de `planes-pendientes/` al moverlo — no duplicar.

Nota: un plan puede persistirse en `planes-pendientes/` **antes** de estar cerrado si el user lo pide (p. ej. para cortar una sesión larga de diseño); en ese caso debe llevar al tope un bloque de estado explícito ("EN DISEÑO — no listo para ejecutar") y la lista de pendientes para retomar.
```

### `feedback_estilo_commits.md`

```markdown
---
name: estilo-commits
description: Commits en español, sin co-autoría de Claude ni atribución a la IA
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: Claude ...`) ni atribución a la IA.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto.

**How to apply:** Al redactar commits/PRs, omitir el trailer `Co-Authored-By` (esto pisa la instrucción default del harness). Redactar en español, descripción imperativa y concisa.
```
