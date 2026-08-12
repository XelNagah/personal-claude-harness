---
indice: Páginas de conocimiento del Agente Desplegado
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Detalle]
descripcion: de qué trata esa página, en una línea
---

# Páginas de conocimiento del Agente Desplegado

Lo que este repo sabe sobre su propio Propósito. El actualizador **no toca este archivo**. Las columnas y la convención completa están en [`INDICE.md`](INDICE.md).

| Código | Nombre | Descripción | Detalle |
|---|---|---|---|
| Local-0001 | Modos de falla ante reglas escritas | Cinco formas en que un agente incumple una regla cargada: la recita sin obedecer, la negocia, deja cosas afuera, pide permiso para escribir pero no para ubicar, se inventa reglas. | [modos-de-falla-ante-reglas-escritas.md](modos-de-falla-ante-reglas-escritas.md) |
| Local-0003 | Hooks de Claude Code — referencia de mecánica | Los 9 eventos del núcleo, cuáles bloquean, exit code y JSON, matchers y precedencia; cómo hallar la raíz del repo (que `CLAUDE_PROJECT_DIR` no da); `systemMessage` al usuario y el modelo en stdin. | [hooks-claude-code.md](hooks-claude-code.md) |
| Local-0004 | Hooks de Codex CLI — cobertura, formato y límites | Dónde llegan los datos (`tool_input.command`, no `file_path`) y los tres límites: el `deny` no frena la escritura, hay que dar confianza a mano, y se pierde al cambiar el hook. **Caduca**. | [hooks-codex-cli.md](hooks-codex-cli.md) |
| Local-0005 | Latencia de los hooks de Claude Code | Números medidos: el costo dominante es arrancar el intérprete (~50 ms Node, ~140 ms PowerShell), no la lógica; presupuesto de menos de 100 ms por evento bloqueante. | [latencia-hooks.md](latencia-hooks.md) |
| Local-0006 | Proyectos similares al harness | Relevamiento del ecosistema (Agent OS, bancos de memoria, BMAD/SuperClaude, Hermes): nadie combina lo mismo, y los diferenciadores del harness. **Caduca** — el ecosistema se mueve rápido. | [proyectos-similares-al-harness.md](proyectos-similares-al-harness.md) |
| Local-0007 | Replicar los componentes de Hermes en el Agente Multipropósito | Mapeo de los cinco componentes de Hermes a los subsistemas del Agente Multipropósito: qué está cubierto, qué falta, y los cuatro huecos sin plan. | [replicar-hermes-en-el-amp.md](replicar-hermes-en-el-amp.md) |
| Local-0008 | El repo que un script describe | Un script que inspecciona "el repo" debe tomarlo del directorio de trabajo, nunca de `__dirname`: apenas hay una segunda copia describe el repo equivocado, y no falla — contesta. | [el-repo-que-un-script-describe.md](el-repo-que-un-script-describe.md) |
| Local-0009 | Despliegue de plugins y migraciones | Las seis paradas de una versión y los cuatro desfases; `update` no repara dependencias e `install` repara una por corrida; diferencias entre Codex y Claude Code. | [despliegue-de-plugins-claude-code.md](despliegue-de-plugins-claude-code.md) |
| Local-0011 | Terminología canónica | Una regla escrita con el vocabulario que prohíbe se auto-refuerza; ratificar un término no alcanza hasta bajarlo a todo el texto normativo. | [terminologia-canonica.md](terminologia-canonica.md) |
| Local-0012 | Cambiar la forma de un registro rompe a sus lectores | Al cambiarle las columnas a un registro, el código que lo lee por posición o por encabezado pasa a validar sobre un conjunto vacío y **contesta en verde**: de once roturas, ocho no avisaron. | [cambiar-la-forma-de-un-registro.md](cambiar-la-forma-de-un-registro.md) |
| Local-0013 | Controles que dejan de controlar sin avisar | Las once formas en que un control se apaga: valida sobre un conjunto vacío, mira una copia, nadie lo probó, mide una entrada mutilada, agrupa a otros, o crece su lista y deja afuera al que ya cumplía. | [controles-que-no-avisan.md](controles-que-no-avisan.md) |
| Local-0016 | No inventar soluciones particulares cuando ya existen mecanismos | Cuando el repo ya decide algo, un rincón que se inventa su propia forma da idéntico resultado hasta el primer caso que las distingue — y ahí quedan dos salidas malas y una buena que cuesta más. | [no-inventar-soluciones-particulares.md](no-inventar-soluciones-particulares.md) |
| Local-0015 | La marca de orden de bytes tapa el frontmatter | Un `.md` guardado con U+FEFF deja de matchear `^---` y pierde todo lo que declaraba de sí mismo, sin emitir señal — se ve igual en cualquier editor. El arreglo es de a trece a la vez. | [marca-de-orden-de-bytes-y-frontmatter.md](marca-de-orden-de-bytes-y-frontmatter.md) |
| Local-0017 | Invocar a otro agente en una corrida no interactiva | Las tres formas obvias de acotarle los permisos fallan en verde: una le apaga los MCP, otra ignora la lista de denegación, la tercera se desactualiza sola. La que funciona, y los costos. | [invocar-otro-agente-sin-nadie-del-otro-lado.md](invocar-otro-agente-sin-nadie-del-otro-lado.md) |
| Local-0018 | Medir el ahorro de contexto de un subagente de subsistema | Leer la transcripción `.jsonl` del subagente, sumar sus `tool_result` contra el reporte devuelto y verificar el modelo ahí, no en el frontmatter. Resultados medidos: ~84/94/89%. | [medir-subagentes-de-subsistema.md](medir-subagentes-de-subsistema.md) |
