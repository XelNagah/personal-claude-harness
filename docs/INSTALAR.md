# Instalar el Agente Multipropósito

Manual de instalación y actualización del **AMP** en un repo. Cubre las dos situaciones:

- [Instalar de cero](#instalar-de-cero) — repo que todavía no tiene el harness.
- [Actualizar un AMP ya instalado](#actualizar-un-amp-ya-instalado) — repo que lo tiene, con nombres de plugin viejos o con archivos desactualizados.

El AMP se distribuye como **marketplace de plugins de Claude Code** y, en paralelo, como skills en el estándar abierto [Agent Skills](https://agentskills.io/) (`SKILL.md`) para Codex CLI, Cursor y Gemini CLI. La instalación por marketplace de abajo es la de Claude Code; para los otros agentes ver [Otros agentes](#otros-agentes-codex-cursor-gemini).

---

## Qué instala

Un solo comando trae **7 plugins**: el transversal `amp` más los seis por subsistema, que entran solos como dependencias.

| Plugin | Skills | Para qué |
|--------|--------|----------|
| `amp` | `inicializar` · `planificar` · `info` · `actualizar` | Arma el `.claude/` completo, analiza planes contra lo que el repo ya sabe, muestra el estado, pone al día una instalación vieja |
| `amp-memoria` | `registrar-memoria` | Hechos que hay que recordar entre sesiones |
| `amp-preferencias` | `registrar-preferencia` | Reglas de conducta del agente, versionadas |
| `amp-planes` | `ciclo-de-plan` | Planes con estado, del alta al cierre |
| `amp-conocimiento` | `registrar-conocimiento` · `buscar-conocimiento` | Lo que el agente sabe del dominio |
| `amp-semantica` | `converger-terminologia` | Glosario del dominio y términos vetados |
| `amp-decisiones` | `registrar-decision` | Decisiones estructurales, para no re-decidir |

Además de esos seis, `amp:inicializar` escribe la estructura de tres subsistemas que todavía no tienen skill propia: **herramientas** (las tools que el repo se fabrica), **conducta** (reglas "cuando hagas X, asegurate de Y", entregadas por un hook) y **commits** (estilo de los mensajes).

---

## Instalar de cero

**Requisitos:** Claude Code instalado, y el repo destino abierto como directorio de trabajo. El repo puede estar vacío o ya tener contenido — la instalación es idempotente y no pisa lo que encuentra.

### 1. Agregar el marketplace

```bash
claude plugin marketplace add XelNagah/personal-claude-harness
```

### 2. Instalar el plugin transversal

```bash
claude plugin install amp@xelnagah-harness -s project
```

Los seis `amp-<sub>` entran solos por dependencias: es **una instalación por repo**, no siete.

El alcance (*scope*) es **`project`** a propósito: el harness aplica a los repos que lo usan, no a todos. Instalarlo a nivel usuario le pondría estas skills a cualquier repo que abras, incluidos los que no tienen `.claude/` de AMP.

### 3. Reiniciar la sesión

Claude Code lee los plugins al arrancar. Cerrá y volvé a abrir la sesión, o corré `/plugin` para verificar que aparezcan.

### 4. Armar el `.claude/` del repo

Adentro de la sesión, pedile al agente:

```
amp:inicializar
```

Escribe la estructura completa de los nueve subsistemas: índices, manifiestos, lints, el hook de conducta y el cableado en `AGENTS.md` / `CLAUDE.md`. Es **reconciliable**: si el repo ya tenía algo, crea solo lo ausente, respeta lo divergente y te reporta al final qué agregó, qué ya estaba y qué encontró distinto.

### 5. Verificar

```
amp:info
```

Muestra el Título y el Propósito del repo más las métricas de cada subsistema. Si algo falta, lo vas a ver ahí.

---

## Actualizar un AMP ya instalado

Poner al día un repo son **dos capas separadas**, y cada una tiene su procedimiento:

| Capa | Qué pone al día | Cómo |
|------|-----------------|------|
| **Plugins** | Los plugins instalados en la máquina: nombres, versiones, alcance | Comandos de este documento |
| **Archivos** | El contenido de `.claude/` en el repo: lints, manifiestos, estructura | La skill `amp:actualizar` |

**Por qué la capa de plugins va en un documento y no en una skill.** Es una **dependencia circular**: `amp:actualizar` vive *adentro* del plugin `amp`, así que no puede instalarse a sí misma ni renombrar el plugin que la está ejecutando. Alguien tiene que arrancar la cadena desde afuera — este manual.

### A. Poner al día la capa de plugins

Si instalaste el AMP antes de la consolidación en 7 plugins, tenés hasta 10 plugins con nombres viejos (`memoria-local`, `gestion-de-planes`, `preferencias-trabajo`, `conocimiento`, `semantica`, `decisiones`, `herramientas`, `conducta`, `planificar`, `amp-actualizar`). Hay que sacarlos y poner el conjunto nuevo.

```bash
# 1. Traer la lista nueva de plugins desde GitHub
claude plugin marketplace update xelnagah-harness

# 2. Sacar los nombres viejos de todos los alcances donde estén
for p in memoria-local preferencias-trabajo gestion-de-planes conocimiento \
         semantica decisiones herramientas conducta planificar amp-actualizar; do
  for s in project local user; do
    claude plugin uninstall "$p@xelnagah-harness" -s "$s" -y 2>/dev/null
  done
done

# 3. Instalar el conjunto nuevo (trae los 6 amp-<sub> por dependencias)
claude plugin install amp@xelnagah-harness -s project

# 4. Limpiar dependencias que quedaron huérfanas
claude plugin prune -y
```

En PowerShell, el paso 2 es:

```powershell
foreach ($p in @('memoria-local','preferencias-trabajo','gestion-de-planes','conocimiento',
                 'semantica','decisiones','herramientas','conducta','planificar','amp-actualizar')) {
  foreach ($s in @('project','local','user')) {
    claude plugin uninstall "$p@xelnagah-harness" -s $s -y
  }
}
```

**Después: reiniciar la sesión.** Los plugins nuevos no cargan hasta entonces.

**Verificar que quedó bien.** Lo que carga de verdad no es lo que lista `claude plugin list`, sino el campo `enabledPlugins` de `settings.json` — el del repo (`.claude/settings.json`) y el del usuario (`~/.claude/settings.json`). Ahí tienen que estar los siete nombres nuevos y ninguno viejo. Si `plugin list` sigue mostrando nombres viejos marcados como deshabilitados pero no están en `enabledPlugins`, son restos de la caché: no cargan y no molestan.

### B. Poner al día los archivos del `.claude/`

Ya con los plugins nuevos cargados, adentro de la sesión:

```
amp:actualizar
```

Converge la estructura del repo contra la plantilla nueva. En concreto:

- **Lo Base** (el mecanismo del harness: lints, manifiestos, estructura, cableado del hook) se **pisa**, respaldando antes la versión vieja en `.claude/.respaldo-amp/<fecha>/`. El respaldo importa porque `.claude/` suele estar fuera del control de versiones, así que no hay red abajo.
- **Lo aprendido** (el contenido que el repo acumuló: tus memorias, planes, decisiones, términos) **no se toca nunca**.
- **Los renombres conocidos** se aplican solos (`glosario/` → `semantica/`) y los subsistemas que falten se instalan.
- **Lo dudoso se pregunta**: si algo del acomodo viejo puede enredar contenido aprendido, frena y consulta antes.

Trae vista previa: te muestra qué va a hacer antes de hacerlo.

---

## Otros agentes: Codex, Cursor, Gemini

No hay marketplace para ellos. Las skills se enlazan a la ubicación estándar de Agent Skills:

```bash
git clone https://github.com/XelNagah/personal-claude-harness.git
cd personal-claude-harness
node .claude/herramientas/instalar-junctions/instalar-junctions.js
```

Eso crea enlaces (junctions en Windows) desde `~/.agents/skills/` —donde miran Codex, Cursor y Gemini— hacia las skills de este repo, y desde `~/.claude/skills/` para Claude Code. Es idempotente: repara lo que falte y no pisa lo que apunte a otro lado.

> ⚠️ **No mezclar enlace y plugin de la misma skill en una máquina**: colisionan por nombre. El enlace sirve para editar las skills en vivo (autoría); el plugin instalado, para consumirlas.

El punto de entrada de instrucciones es `AGENTS.md` en la raíz del repo, que esos agentes leen de forma nativa. Claude Code no lee `AGENTS.md`, por eso hay un `CLAUDE.md` de una línea que lo importa.

**Límite conocido:** el prefijo `amp:` / `amp-<sub>:` que separa las skills por subsistema es un mecanismo de Claude Code. Con enlaces, las skills se ven con el nombre pelado (`registrar-memoria` en vez de `amp-memoria:registrar-memoria`).

---

## Problemas frecuentes

**Las skills no aparecen después de instalar.** Falta reiniciar la sesión. Si ya reiniciaste, revisá `enabledPlugins` en `.claude/settings.json`.

**`claude plugin list` muestra nombres viejos.** Si no están en `enabledPlugins`, no cargan — son restos de la caché. Se pueden sacar con `claude plugin uninstall <viejo>@xelnagah-harness -s <alcance> -y`.

**La misma skill aparece dos veces.** Tenés el enlace y el plugin conviviendo. Elegí uno: borrá el enlace de `~/.claude/skills/<skill>` o desinstalá el plugin.

**`amp:inicializar` no pisó algo que yo quería actualizar.** Es a propósito: cuando encuentra algo divergente lo reporta en vez de pisarlo. Para converger contra la plantilla nueva usá `amp:actualizar`, que sí pisa lo Base (con respaldo).
