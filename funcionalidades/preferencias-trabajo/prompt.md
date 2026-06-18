# Prompt: inicializar preferencias de trabajo

> **Uso:** pegar todo lo que sigue (desde la línea horizontal) a un agente de código parado en la raíz del proyecto.

---

Configurá en el archivo de instrucciones que tu harness carga al inicio de sesión (`CLAUDE.md`, `AGENTS.md`, `copilot-instructions.md`, regla de Cursor, etc. — `<config>` es ese directorio) las siguientes preferencias. Si el archivo ya existe, **extendé sin pisar**.

## Reconciliación (idempotencia)

Este prompt es seguro de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Aplicá a cada paso que escribe:

- **Inspeccioná antes de escribir.** Leé primero el archivo de instrucciones. Nunca lo reescribas de cuajo.
- **Creá solo lo ausente.** No existe → crear. Existe → agregar únicamente las secciones que falten, preservando el resto tal cual.
- **Detectá equivalentes.** Una sección puede estar ya con otro título o redacción. Buscá por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pises**: reportá la divergencia y preguntame antes de reconciliar.
- **Reportá al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere tu decisión).

## 1. Descripción del proyecto

Si el archivo no existe, arrancalo con una sección **"Descripción del proyecto"** de 1 a 3 párrafos inferidos del repo. Si el repo está vacío o es ambiguo, preguntame antes de inventar. Si ya existe, dejalo intacto.

## 2. Preferencias de comunicación

Agregá esta sección literal (si no hay una equivalente):

> Al preguntar por una decisión o analizar alternativas, dar SIEMPRE ejemplos concretos de cada postura (numéricos si aplica): cómo es ahora vs. cómo quedaría y por qué, encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X"). Objetivo: ubicar inmediatamente al lector en la mecánica relevante sin que tenga que reconstruir contexto.

## 3. Principios de trabajo

Agregá esta sección (si no hay una equivalente):

- Conceptual antes que implementación. Ante ambigüedad de diseño, preguntar antes de asumir. Minimizar cambios sustractivos.
- Iterar de alto a bajo nivel: interfaces y contratos antes que implementación.
- Nomenclatura en español para el dominio; inglés solo para infraestructura técnica.
- Cero invención de datos: lo que no salga de una fuente verificada se marca como faltante o como interpretación propia.

## 4. Reporte

Reportá en los tres baldes (`agregado` / `ya estaba` / `divergente`). No hagas commit salvo que te lo pida.
