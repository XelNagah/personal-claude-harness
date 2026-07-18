---
name: inicializar-gestion-planes
description: Instala el ciclo de planes del usuario en el repo actual (.claude/planes/ con pendientes/ejecutados/descartados + registro PLANES.md + lint + hook de sesión). Depende de memoria-local. Use when el usuario dice "inicializar gestión de planes", "armá los planes", "configurá el ciclo de planes".
---

# Inicializar gestión de planes

Instala la gestión de planes persistida en el proyecto actual. Si parte ya existe, **extender sin pisar**. Los textos verbatim están en [PLANTILLA.md](PLANTILLA.md).

**Depende de `memoria-local`**: las memorias del flujo se guardan en `.claude/memory/`. Si `.claude/memory/MEMORY.md` no existe, ejecutar primero `inicializar-memoria-local`.

## Estructura objetivo

```
.claude/
├── CLAUDE.md          # sección "Planes del proyecto" + import de PLANES.md en el Mapa del repo
├── settings.json      # hook SessionStart → lint-planes --quiet
├── memory/
│   ├── feedback_flujo_planes.md
│   └── feedback_artefacto_estado.md
├── planes/
│   ├── PLANES.md      # registro: Plan | Prioridad | Estado | Creado | Cerrado | Origen | Notas
│   ├── pendientes/.gitkeep      # backlog amplio (foco + estacionado)
│   ├── ejecutados/.gitkeep
│   └── descartados/.gitkeep
└── scripts/
    └── lint-planes/{lint-planes.js, README.md}
```

## Reconciliación (idempotencia)

Segura de re-correr: sirve para **"levelear"** repos que ya tienen algunas partes. Reglas para **todo** paso que escribe:

- **Inspeccionar antes de escribir.** Leer primero el archivo/carpeta destino. Nunca reescribir de cuajo un archivo existente.
- **Crear solo lo ausente.** No existe → crear. Existe → agregar únicamente lo que falte, preservando el resto tal cual.
- **Detectar equivalentes.** La memoria del flujo o la sección de planes puede estar ya con otro título o redacción. Buscar por tema, no solo por nombre exacto. Igual → no tocar. Distinto → **no pisar**: reportar divergencia y preguntar antes de reconciliar.
- **Reportar al final** en tres baldes: `agregado` (faltaba), `ya estaba` (ok), `divergente` (existe distinto, requiere decisión del user).

## Migración desde el esquema viejo (`planes-pendientes/` / `planes-ejecutados/`)

Si el repo tiene el esquema anterior, migrar **antes** de instalar lo nuevo:

1. Renombrar `planes-pendientes/` → `pendientes/`, `planes-ejecutados/` → `ejecutados/`; crear `descartados/`. Si además hay `.md` **sueltos en la raíz** de `planes/`, moverlos a `pendientes/` y marcarlos `estacionado` en el registro (salvo evidencia clara de otra cosa — preguntar en bloque, no uno por uno).
2. ⚠️ **Refs por ruta al nombre viejo**: grep `planes-pendientes|planes-ejecutados` en CLAUDE.md, memorias, planes, settings (`additionalDirectories`, reglas de permiso) y hooks. Actualizar en el mismo paso; las de settings reportarlas al user (pueden vivir en el settings global de la máquina).
3. Poblar `PLANES.md` con una fila por plan existente: Creado = fecha del nombre viejo si la tenía (después el archivo **puede** renombrarse a slug estable — proponerlo, no forzarlo); Cerrado = fecha del nombre en ejecutados; Estado según carpeta. La línea interna `Plan cerrado:` de la convención vieja pasa a la columna Creado.
4. La memoria `feedback_flujo_planes.md` vieja se **reemplaza** por la versión de PLANTILLA (es una actualización de la misma convención, no una divergencia — no preguntar, pero reportar el reemplazo).

## Workflow

1. **Verificar `memoria-local`.** Si `.claude/memory/` no existe, instalarla primero.
2. **Migración** (sección anterior) si aplica.
3. **Asegurar `planes/pendientes/`, `planes/ejecutados/`, `planes/descartados/`** (con `.gitkeep` si el repo usa git) y **`planes/PLANES.md`** (semilla de PLANTILLA §Semilla). Si hay planes sin fila, agregarlas (ver migración paso 3).
4. **Asegurar las memorias** `feedback_flujo_planes.md` y `feedback_artefacto_estado.md` (verbatim de PLANTILLA) + sus líneas en `memory/MEMORY.md`.
5. **Instalar el lint**: `scripts/lint-planes/lint-planes.js` + `README.md` (verbatim de PLANTILLA §Script). Si la funcionalidad `scripts` está instalada, registrar la fila en `scripts/INDICE.md`.
6. **Asegurar el hook** `SessionStart` → `node .claude/scripts/lint-planes/lint-planes.js --quiet` en `.claude/settings.json` (PLANTILLA §Hook). **Merge cuidadoso**: si el archivo o la clave `hooks` ya existen, agregar solo la entrada faltante sin pisar hooks ajenos; JSON válido (sin trailing commas).
7. **En `.claude/CLAUDE.md`**: asegurar la sección **"Planes del proyecto"** (PLANTILLA §Sección) y, si existe el bloque "Mapa del repo (siempre cargado)" de `memoria-local`, asegurar la línea `@planes/PLANES.md` en él.
8. **Correr el lint** → resolver hallazgos hasta 0 (o reportar los que requieren decisión del user).
9. **Reportar** en los tres baldes (`agregado` / `ya estaba` / `divergente`). **No hacer commit** salvo pedido explícito.
