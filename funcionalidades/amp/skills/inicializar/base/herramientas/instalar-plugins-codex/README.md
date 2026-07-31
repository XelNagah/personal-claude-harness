# instalar-plugins-codex

Resuelve e instala en Codex CLI las dependencias de un plugin del marketplace, que Codex no instala transitivamente.

Desde el repo, después de registrar el marketplace:

```bash
node .claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar
```

Sin `--aplicar` muestra el orden. Lee `marketplace.json` y los `dependencies` reales; por defecto instala el bundle `amp` de `xelnagah-harness`.

**Ruta local, no externa.** Hasta el 30/07/2026 su invocación pedía un checkout aparte del repo que publica el Agente Multipropósito, porque la Herramienta se declaraba Base pero su archivo nunca llegaba a instalarse: la fila la prometía y no había de dónde correrla salvo el checkout. Desde que los Componentes de Subsistema viajan como archivos, se instala como cualquier otra y se invoca con ruta local.

**Para arrancar de cero** —un repo sin nada instalado todavía— la Herramienta tampoco está, y ahí sí vale la copia del marketplace bajado: `node ~/.claude/plugins/marketplaces/<marketplace>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar`.
