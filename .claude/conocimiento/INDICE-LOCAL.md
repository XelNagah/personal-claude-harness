---
indice: Páginas de conocimiento del Agente Desplegado
origen: agente-desplegado
columnas: [Código, Nombre, Descripción, Detalle]
descripcion: de qué trata esa página, en una línea
---

# Páginas de conocimiento del Agente Desplegado

Lo que este repo sabe sobre su propio Propósito. El nivelador **no toca este archivo**. Las columnas y la convención completa están en [`INDICE.md`](INDICE.md).

| Código | Nombre | Descripción | Detalle |
|---|---|---|---|
| Local-0001 | Modos de falla ante reglas escritas | Cinco formas distintas en que un agente incumple una regla que tiene cargada (recita sin obedecer, negocia, deja las cosas afuera, pide permiso para escribir pero no para ubicar, se inventa reglas); el texto de arranque gobierna la conversación, no la acción. | [modos-de-falla-ante-reglas-escritas.md](modos-de-falla-ante-reglas-escritas.md) |
| Local-0003 | Hooks de Claude Code — referencia de mecánica | Referencia de mecánica: los 9 eventos del núcleo, cuáles bloquean, el contrato de exit code y JSON, matchers, precedencia, configuración y ejemplos; incluye cómo resolver la raíz del repo desde un hook, que `CLAUDE_PROJECT_DIR` no da. | [hooks-claude-code.md](hooks-claude-code.md) |
| Local-0004 | Hooks de Codex CLI — cobertura, formato y límites | Qué cubren los hooks de Codex, dónde llegan los datos (`tool_input.command`, no `file_path`) y sus tres límites: el `deny` no frena la escritura, hace falta dar confianza a mano, y esa confianza se pierde al cambiar el texto del hook. **Caduca** — dos de los tres son bugs abiertos. | [hooks-codex-cli.md](hooks-codex-cli.md) |
| Local-0005 | Latencia de los hooks de Claude Code | Números medidos: el costo dominante es arrancar el intérprete (~50 ms Node, ~140 ms PowerShell), no la lógica; presupuesto de menos de 100 ms por evento bloqueante, y qué evento se paga en cada mensaje. | [latencia-hooks.md](latencia-hooks.md) |
| Local-0006 | Proyectos similares al harness | Relevamiento del ecosistema (Agent OS, bancos de memoria, BMAD/SuperClaude, Hermes): nadie combina lo mismo, y los diferenciadores del harness. **Caduca** — el ecosistema se mueve rápido. | [proyectos-similares-al-harness.md](proyectos-similares-al-harness.md) |
| Local-0007 | Replicar los componentes de Hermes en el AMP | Mapeo de los cinco componentes de Hermes a los subsistemas del Agente Multipropósito: qué está cubierto, qué falta, y los cuatro huecos sin plan. | [replicar-hermes-en-el-amp.md](replicar-hermes-en-el-amp.md) |
| Local-0008 | El repo que un script describe | Un script que inspecciona "el repo" debe tomarlo del directorio de trabajo, nunca de `__dirname`: apenas existe una segunda copia (plugin, marketplace bajado, consumidor) describe y modifica el repo equivocado, y no falla — contesta. | [el-repo-que-un-script-describe.md](el-repo-que-un-script-describe.md) |
| Local-0009 | Despliegue de plugins y migraciones | Las seis paradas de una versión y los cuatro desfases; mecánicas del CLI que sorprenden (`update` no repara dependencias, `install` repara una por corrida); diferencias entre Codex y Claude Code; cómo se cierra una publicación. | [despliegue-de-plugins-claude-code.md](despliegue-de-plugins-claude-code.md) |
| Local-0011 | Terminología canónica | Una regla escrita con el vocabulario que prohíbe se auto-refuerza; ratificar un término no alcanza hasta bajarlo a todo el texto normativo. | [terminologia-canonica.md](terminologia-canonica.md) |
| Local-0012 | Cambiar la forma de un registro rompe a sus lectores | Al cambiarle las columnas a un registro, el código que lo lee por posición o por encabezado pasa a validar sobre un conjunto vacío y **contesta en verde**: de once roturas medidas, ocho no emitieron señal. Qué hacer, y tres trampas de parseo verificadas. | [cambiar-la-forma-de-un-registro.md](cambiar-la-forma-de-un-registro.md) |
| Local-0013 | Controles que dejan de controlar sin avisar | Las siete formas en que un control se apaga solo y sigue dando verde: valida sobre un conjunto vacío, marca tanto que se lo deja de leer, mira una copia y no la que se usa, nadie lo probó nunca, tiene adentro una condición que no controla nada, se quedó sin población que controlar, o su prueba lo cubre con un número que envejeció. Incluye cómo se prueba un control y por qué reportar y fallar son contratos distintos. | [controles-que-no-avisan.md](controles-que-no-avisan.md) |
| Local-0015 | La marca de orden de bytes tapa el frontmatter | Un `.md` guardado con U+FEFF deja de matchear `^---` y pierde todo lo que declaraba de sí mismo, sin emitir señal — se ve igual en cualquier editor y "sin frontmatter" es una respuesta que el código ya sabe manejar. Qué cambia según quién lee, y por qué el arreglo es de a trece a la vez. | [marca-de-orden-de-bytes-y-frontmatter.md](marca-de-orden-de-bytes-y-frontmatter.md) |
