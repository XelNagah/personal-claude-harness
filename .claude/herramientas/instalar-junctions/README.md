# instalar-junctions

Crea/repara las **dos tandas de junctions** de skills de la máquina (decisión 0010), apuntando a la fuente única `funcionalidades/*/skills/<skill>`:

- `~/.claude/skills/<skill>` — la ve **Claude Code**.
- `~/.agents/skills/<skill>` — la ven **Codex CLI, Cursor y Gemini CLI** (ubicación estándar Agent Skills; los tres siguen symlinks/junctions).

Reemplaza el procedimiento manual de `New-Item -ItemType Junction` que documentaba el punto de entrada. Idempotente (reglas de nivelar): crea solo lo ausente, lo correcto lo reporta como `ya estaba`, y **no pisa lo divergente** (junction que apunta a otro lado, o carpeta real con el mismo nombre) — lo lista para resolver a mano. Sale con código 1 si hay divergentes.

## Uso

Desde la raíz del harness:

```bash
node .claude/herramientas/instalar-junctions/instalar-junctions.js
```

O desde cualquier lado, pasando la raíz:

```bash
node <harness>/.claude/herramientas/instalar-junctions/instalar-junctions.js <harness>
```

> **No mezclar junction + plugin del mismo skill en una misma máquina** (colisionan por nombre). Junction = autoría/edición en vivo; plugin instalado = distribución/consumo.
