# instalar-plugins-codex

Resuelve e instala en Codex CLI las dependencias de un plugin del marketplace, que Codex no instala transitivamente.

Desde el repo destino, después de registrar el marketplace:

```bash
node <checkout-harness>/.claude/herramientas/instalar-plugins-codex/instalar-plugins-codex.js --aplicar
```

Sin `--aplicar` muestra el orden. Lee `marketplace.json` y los `dependencies` reales; por defecto instala el bundle `amp` de `xelnagah-harness`.
