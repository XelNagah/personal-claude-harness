# Prompt: inicializar preferencias

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto.

---

Configurá en este proyecto mi sistema de preferencias: un archivo `<config>/preferencias/PREFERENCIAS.md` (donde `<config>` es el directorio de configuración nativo de tu harness: `.claude/`, `.codex/`, `.cursor/`, etc.) **cargado siempre al contexto** — si tu harness soporta imports en el archivo de instrucciones (como `@ruta` en CLAUDE.md), usalos; si no, una instrucción de carga obligatoria al inicio. Las preferencias son reglas de conducta: tienen que estar inline en el contexto, no disponibles-a-pedido.

## Reconciliación (idempotencia)

Seguro de re-correr ("levelear"): inspeccioná antes de escribir; creá solo lo ausente; detectá equivalentes por tema; reportá en tres baldes (`agregado` / `ya estaba` / `divergente`). Específico de preferencias:

- La sección **Base** es versionada: si el repo tiene una Base de versión anterior, reemplazala entera por la actual (reportar como actualización, no divergencia). Si la Base fue editada a mano, mové lo ajeno a **Adaptaciones** y reinstalá la Base limpia.
- La sección **Adaptaciones de este repo** no se toca nunca.
- Si el archivo de instrucciones tiene bloques viejos "Preferencias de comunicación" / "Principios de trabajo" inline: si coinciden con la Base, eliminalos y dejá solo la carga de PREFERENCIAS.md; si difieren, las diferencias van a Adaptaciones.

## 1. Descripción del proyecto

Si el archivo de instrucciones no existe, arrancalo con una sección **"Descripción del proyecto"** de 1 a 3 párrafos inferidos del repo. Si el repo está vacío o es ambiguo, preguntame antes de inventar.

## 2. El archivo de preferencias

Creá `<config>/preferencias/PREFERENCIAS.md`:

```markdown
# Preferencias

Reglas de conducta del agente en este repo. Siempre en contexto. La sección **Base** viene de mi harness y se actualiza al levelear (no editarla acá: los ajustes de este repo van en **Adaptaciones**).

## Base (harness v2)

**Comunicación:**

- Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.
- Ante un informe o visualización de **formato nuevo**: mostrar primero el esqueleto con datos de juguete marcados como DUMMY, acordar la representación, recién después calcular en serio. **Nunca re-producir completo un formato rechazado**: volver al esqueleto y realinear.
- Tareas en background: esperar la notificación de finalización; no reportar ni consultar estado a cada rato — solo ante sospecha de cuelgue.

**Principios de trabajo:**

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.
- Terminología: no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo**: nada de palabras inventadas o raras (aunque suenen técnicas), ni en prosa ni en diagramas — no solo en los registros. **Gate duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación del usuario. En prosa/diagramas se puede usar, marcado como propuesto.

## Adaptaciones de este repo

(ninguna todavía — agregar acá lo específico de este proyecto)
```

## 3. Carga garantizada

En el archivo de instrucciones, asegurá una sección **"Preferencias (siempre cargadas)"** que cargue PREFERENCIAS.md al contexto en cada sesión (import `@` si existe; instrucción explícita si no), con el paso de correr el lint al tocar las preferencias.

## 4. Lint de integridad

Instalá el tool en **su propia carpeta**: `<config>/scripts/lint-preferencias/lint-preferencias.js`. Es un script Node sin dependencias ni red que chequea (estructural, **no** semántico): que `PREFERENCIAS.md` tenga las secciones `## Base` y `## Adaptaciones` y no esté vacío, y que el archivo de instrucciones lo cargue con `@preferencias/PREFERENCIAS.md`. Corré `node <config>/scripts/lint-preferencias/lint-preferencias.js` al tocar las preferencias.

(El contenido exacto del script está en la plantilla de la versión Claude Code de esta funcionalidad — `skills/inicializar-preferencias-trabajo/PLANTILLA.md` §Script.)

## 5. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
