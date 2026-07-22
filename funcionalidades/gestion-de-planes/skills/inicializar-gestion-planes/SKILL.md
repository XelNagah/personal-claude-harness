---
name: inicializar-gestion-planes
description: Instala el ciclo de planes del usuario en el repo actual (.claude/planes/ con pendientes/ejecutados/descartados + registro PLANES.md + lint + hook de sesión). Depende de memoria-local. Use when el usuario dice "inicializar gestión de planes", "armá los planes", "configurá el ciclo de planes".
---

# Inicializar gestión de planes

Instala la gestión de planes persistida en el proyecto actual. Si parte ya existe, **extender sin pisar**. Los textos literales están en [PLANTILLA.md](PLANTILLA.md).

**Depende de `memoria-local`**: las memorias del flujo se guardan en `.claude/memoria/`. Si `.claude/memoria/MEMORIA.md` no existe, ejecutar primero `inicializar-memoria-local`.

## Estructura objetivo

```
AGENTS.md              # (raíz del repo) sección "Planes del proyecto" + import de PLANES.md en el Mapa; CLAUDE.md = adaptador
.claude/
├── settings.json      # hook SessionStart → lint-planes --quiet
├── memoria/
│   ├── feedback_flujo_planes.md
│   └── feedback_archivo_de_estado.md
└── planes/
    ├── ESTADOS.md     # estados: Estado | Sentido | Carpeta | Terminal (fuente de verdad, la lee el lint)
    ├── PLANES.md      # registro: Plan | Estado | Creado | Cerrado | Origen | Notas
    ├── pendientes/.gitkeep      # planes vivos (Nuevo · En curso · Diferido)
    ├── ejecutados/.gitkeep
    ├── descartados/.gitkeep
    └── lint-planes/{lint-planes.js, README.md}
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"nivelar"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** La memoria del flujo o la sección de planes puede estar ya con otro título o redacción. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres grupos: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Migración desde el esquema viejo

Dos esquemas anteriores pueden estar instalados; migrar **antes** de instalar lo nuevo. Aplicar los que correspondan (pueden darse juntos):

**(a) Dos carpetas → tres** (`planes-pendientes/` / `planes-ejecutados/`):

1. Renombrar `planes-pendientes/` → `pendientes/`, `planes-ejecutados/` → `ejecutados/`; crear `descartados/`. Si además hay `.md` **sueltos en la raíz** de `planes/`, moverlos a `pendientes/` y marcarlos `Diferido` en el registro (salvo evidencia clara de otra cosa — preguntar en bloque, no uno por uno).
2. ⚠️ **Refs por ruta al nombre viejo**: grep `planes-pendientes|planes-ejecutados` en AGENTS.md, memorias, planes, settings (`additionalDirectories`, reglas de permiso) y hooks. Actualizar en el mismo paso; las de settings reportarlas al user (pueden vivir en el settings global de la máquina).
3. Poblar `PLANES.md` con una fila por plan existente: Creado = fecha del nombre viejo si la tenía (después el archivo **puede** renombrarse a nombre estable — proponerlo, no forzarlo); Cerrado = fecha del nombre en ejecutados; Estado según carpeta. La línea interna `Plan cerrado:` de la convención vieja pasa a la columna Creado.

**(b) Dos ejes → un eje** (registro con columna `Prioridad` foco/estacionado + estados viejos `idea`/`en diseño`/`listo`/`en ejecución`):

1. **Quitar la columna `Prioridad`** de `PLANES.md` — pasa a máquina de un solo eje.
2. **Remapear cada fila** a un único `Estado`: `estacionado`/`idea`/`en diseño`/`listo` → `Diferido`; `en ejecución` → `En curso`; las filas ya cerradas conservan `Ejecutado`/`Descartado`. Los términos viejos se **barren, no se registran como alias**.
3. **Sembrar `planes/ESTADOS.md`** (PLANTILLA §Estados) si falta.

En cualquier caso, la memoria `feedback_flujo_planes.md` vieja se **reemplaza** por la versión de PLANTILLA (es una actualización de la misma convención, no una divergencia — no preguntar, pero reportar el reemplazo).

## Flujo de trabajo

1. **Verificar `memoria-local`.** Si `.claude/memoria/` no existe, instalarla primero.
2. **Migración** (sección anterior) si aplica.
3. **Asegurar `planes/pendientes/`, `planes/ejecutados/`, `planes/descartados/`** (con `.gitkeep` si el repo usa git), **`planes/ESTADOS.md`** (textual de PLANTILLA §Estados) y **`planes/PLANES.md`** (contenido inicial de PLANTILLA §Contenido inicial). Si hay planes sin fila, agregarlas (ver migración).
4. **Asegurar las memorias** `feedback_flujo_planes.md` y `feedback_archivo_de_estado.md` (textual de PLANTILLA) + sus líneas en `memoria/MEMORIA.md`.
5. **Instalar el lint**: `planes/lint-planes/lint-planes.js` + `README.md` (textual de PLANTILLA §Script), co-ubicado con el subsistema en `.claude/planes/lint-planes/`. Es infra del Patrón, **no** una Herramienta: no se registra en `herramientas/INDICE.md` (decisión 0008).
6. **Asegurar el hook** `SessionStart` → `node .claude/planes/lint-planes/lint-planes.js --quiet` con **registro doble** (PLANTILLA §Hook, decisión 0010): en `.claude/settings.json` (Claude Code) y en `.codex/hooks.json` (Codex CLI; avisar que requiere repo trusted y `features.hooks`). **Merge cuidadoso** en ambos: si el archivo o la clave `hooks` ya existen, agregar solo la entrada faltante sin pisar hooks ajenos; JSON válido (sin trailing commas).
7. **En `AGENTS.md`** (punto de entrada en la raíz, decisión 0010): asegurar la sección **"Planes del proyecto"** (PLANTILLA §Sección) y, si existe el bloque "Mapa del repo (siempre cargado)" de `memoria-local`, asegurar la línea `@.claude/planes/PLANES.md` en él.
8. **Correr el lint** → resolver hallazgos hasta 0 (o reportar los que requieren decisión del user).
9. **Reportar** en los tres grupos (`agregado` / `ya estaba` / `divergente`). **No hacer commit** salvo pedido explícito.
