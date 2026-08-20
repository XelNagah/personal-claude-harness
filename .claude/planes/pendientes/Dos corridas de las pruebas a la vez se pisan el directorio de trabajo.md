# Dos corridas de las pruebas a la vez se pisan el directorio de trabajo

**Estado: Nuevo · Creado 26-08-21.**

## Qué pasó

El 21/08/2026, con dos sesiones trabajando el mismo repo, el banco de `lint-harness` murió con `EPERM` sobre `.claude/tmp/repo-prueba-harness`. La corrida siguiente, ya sin la otra sesión encima, dio verde sin tocar una línea.

La causa es el **nombre fijo** del directorio de trabajo: `lint-harness/pruebas.js:12` resuelve `.claude/tmp/repo-prueba-harness` y lo borra y rehace en cada corrida. Dos corridas simultáneas usan el mismo directorio, y la que borra mientras la otra lee deja a la segunda sin archivos o con el directorio tomado por el sistema.

## Por qué importa más de lo que parece

El síntoma es un **rojo que no corresponde a ningún defecto**, y con la forma más engañosa: un error del sistema de archivos, que se lee como problema de máquina —permisos, antivirus, disco— y no como defecto de la prueba. Es pariente de la forma «escenario a medias» del conocimiento `controles-que-no-avisan`: lo que el caso no fabrica lo pone el entorno, y acá el entorno es *otra corrida del mismo banco*.

Y no es una rareza de este repo: `ejecutar-control-cierre` corre todas las pruebas de una pasada, así que alcanza con que alguien lo dispare desde dos terminales, o con un hook que lo lance mientras alguien lo corre a mano.

## Qué habría que hacer

Barrer los bancos que trabajan sobre un directorio de nombre fijo bajo `.claude/tmp/` y pasarlos a un directorio único por corrida (`fs.mkdtempSync`), que se borra al terminar. Los conocidos al abrir este plan:

- `herramientas/lint-harness/pruebas.js` — `.claude/tmp/repo-prueba-harness`
- `planes/lint-planes/pruebas.js` — `.claude/tmp/banco-planes`

Los que ya usan directorio único —el de `detectar-terminologia-vetada` y el de `establecer-conducta`— quedan como molde.

⚠️ Al abrir este plan, `lint-harness/pruebas.js` estaba siendo editado por otra sesión: no se tocó a propósito. Verificar antes de trabajarlo.
