# Corregir tres defectos de parseo de lint-herramientas

Tres defectos propios de `lint-herramientas` detectados al nivelar un repo consumidor, sin relación con la resolución de refs (por eso la unificación 0.4.1 no los tocó). Riesgo bajo: parseo aislado, fixes precedentes.

## Los tres defectos

1. **Self-lint contado como Herramienta.** `tools` tomaba todo subdirectorio, incluido el lint co-ubicado del propio subsistema (`lint-herramientas/`). En repo consumidor —donde ese lint no está en el índice, por decisión 0008— caía en `[2] FUERA DEL INDICE`, contra la regla que el propio registro enuncia.
   Fix: excluir exactamente `lint-${basename(root)}` (no un `lint-*` ciego, que se llevaría puesto a `lint-harness`, que sí es Herramienta de dominio).

2. **Regex de rutas sin espacios.** Las clases de carácter no admitían espacio ⇒ una ruta absoluta de Windows con espacios (`…\Inicializador de Repos Custom jllarens\.claude\…`) empezaba a matchear después del último espacio y reportaba un fragmento inexistente como ref rota.
   Fix: rama alternativa para path absoluto de Windows (`X:\…\.claude\…`) que admite espacios; la rama relativa original queda intacta (para no arrastrar el `node ` de `"node .claude/x.js"`).

3. **Extensión sin anclar.** Por el cuantificador no-greedy, `settings.json` matcheaba como `settings.js` y se reportaba como ref rota.
   Fix: lookahead `(?![\w])` tras la extensión.

## Notas de implementación

### Regresión evitada

Excluir el self-lint de `tools` habría vuelto colgada la fila `lint-herramientas` del índice de **este** repo (donde sí está listado). El chequeo `[3]` pasó a mirar disco (`fs.existsSync`) en vez de `toolSet` — que es lo que su propio comentario dice ("subdir local inexistente"). Anda en repo consumidor (no listado) y acá (listado + dir presente).

### Verificación

- Test aislado del regex, 7/7: paths Windows con espacios en ambas barras; `settings.json`/`settings.local.json` ya no matchean como `.js`; `.mjs`/`.sh`/`.py` ok; relativa sin arrastrar prefijo de comando.
- Test de layout consumidor (dir `herramientas` con `lint-herramientas/` presente pero no indexado): no lo flaggea.
- Test negativo: fila colgada real (`fantasma/`) sigue cayendo.
- Propagado idéntico a las 2 plantillas (funcionalidad + orquestador); `lint-harness` verde confirma identidad textual. Versiones: herramientas 0.4.1→0.4.2, setup-completo 0.5.0→0.5.1. Control de cierre 9/9.
