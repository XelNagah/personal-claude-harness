# Migrar repos consumidores a los estados nuevos

**Estado:** Ejecutado · Creado 26-07-18 · Cerrado 26-07-19.

## Objetivo

Los repos que ya instalaron el harness quedaron con esquemas viejos de planes. Barrerlos para mantener consistencia con la máquina de un solo eje (decisión 0005). La lógica de migración ya vive en el skill `inicializar-gestion-planes` (paso 3) y es **idempotente** → cada repo se migra solo la próxima vez que se corre el skill ahí (reconcile-on-use).

## Censo real (26-07-19)

El plan asumía que todos los consumidores estaban en el esquema era-registro de dos ejes. Falso: **15 consumidores en dos poblaciones**.

- **Grupo A — pre-registro (13):** 2 carpetas `planes-pendientes/` + `planes-ejecutados/`, sin `PLANES.md` ni `ESTADOS.md`, planes como archivos fechados. Necesitan **reconcile completo** (2→3 carpetas, archivos fechados → filas en registro nuevo, sembrar ESTADOS+PLANES, reemplazar lint, refs en CLAUDE.md, inferir estado por archivo).
  `bs-overlay/BeatSaber-Overlay` · `Agente-Coordinador` · `analisis/compraventa-nuevo-inmueble` · `analisis/Correr IAs locales` · `analisis/Impresion3d` · `analisis/Integral-Collective` · `analisis/Salud` · `Analisis Whatsapp` · `analisis-particion-sucesion-melody` · `local-wispflow` · `vscode/…/RBESIM` · `vscode/…/rbesim-Fable` · `vscode/tekken 8 lb-country`
- **Grupo B — era-registro, dos ejes (2):** `PLANES.md` con columna `Prioridad` (foco/estacionado) + estados viejos. Solo **remap** de estados + sembrar `ESTADOS.md` + `descartados/` + reemplazar lint.
  `analisis/como-uso-claude` · `Contabilidad-Personal-IA` (el más al día)

## Alcance decidido (26-07-19)

**Solo activos ahora**, vía fan-out de subagentes (uno por repo, corre el skill in situ, commitea solo lo de planes, reporta 3 baldes). Los `analisis/*` dormidos se migran por reconcile-on-use cuando se reusen.

Set activo (5): `bs-overlay/BeatSaber-Overlay`, `Agente-Coordinador`, `local-wispflow` (Grupo A) + `Contabilidad-Personal-IA`, `como-uso-claude` (Grupo B).

## Regla de remap (sin alias — se reemplaza, no se mapea)

`estacionado`/`idea`/`en diseño`/`listo` → `Diferido`; `en ejecución` → `En curso`; cerradas conservan `Ejecutado`/`Descartado`. Se quita la columna `Prioridad`.

**Origen:** Rediseño de estados de planes + renombre de memoria local.

## Notas de implementación

Migrados los 5 activos vía fan-out de subagentes (uno por repo, corriendo el skill in situ). Todos quedaron lint-verde.

| Repo | Grupo | Cierre |
|------|-------|--------|
| `como-uso-claude` | B | commit `2efd58b` |
| `Contabilidad-Personal-IA` | B | commit `fad61eb` (22 filas remapeadas; 2 cambios ajenos intactos) |
| `Agente-Coordinador` | A | commit `9ec5289` (piloto contable inferido `En curso`) |
| `local-wispflow` | A | `git init` + commit `865e204` (no era git; contenía solo `.claude/`) |
| `bs-overlay/BeatSaber-Overlay` | A | sin commit — `.claude/` gitignored en ese repo → migración local; lint con override `package.json` commonjs (repo ESM) |

**Bug del lint descubierto y arreglado.** La heurística `PENDIENTES CON MARCADOR DE RESUELTO` usaba `/(✅|RESUELTO|…)/i` → falso positivo en 4 de 5 (matcheaba `✅` decorativo y el substring "resuelto" en prosa). Acotada a `\bRESUELTO\b` (mayúscula estricta) + `## Notas de implementación`. Fix en el harness (`lint-planes.js`) propagado verbatim a los 2 embebidos de PLANTILLA (commit `38a22b6`, `lint-harness` verde) y aplicado al lint instalado de los repos activos.

**Dormidos (8 del Grupo A):** por reconcile-on-use cuando se reusen (el skill es idempotente e instala el lint corregido). No requieren acción activa.

**Cabos sueltos surfaceados (no auto-corregidos):**
- `~/.claude/settings.json` (global de la máquina): 4 refs stale a `.../planes-pendientes` de bs-overlay (3 pre-auths de Bash + 1 path). Inofensivas (pre-auths muertas), pero editar settings globales es decisión del usuario.
- `como-uso-claude` y `Contabilidad` quedaron commiteados con el lint viejo (FP no bloqueante); se corrigen por reconcile-on-use, o con un update puntual si se quiere ya.
- `README.md` de `lint-planes` (harness) dice "focos envejecidos" (término viejo de dos ejes; el código ya dice "activos/En curso"). Staleness menor, requiere propagar a embebidos.
