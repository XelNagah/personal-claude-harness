# buscar

Encuentra las instalaciones del Agente Multipropósito de esta máquina y dice cuáles todavía no están en el Índice de Agentes Multipropósito Conocidos. Lo usa la habilidad `buscar-agentes`.

```bash
node .claude/comunicacion/buscar/buscar.js [--json] [rutaRepo]
```

- **`--json`** — el resultado crudo, un objeto por instalación, para que la habilidad lo procese sin volver a parsear texto.
- **`[rutaRepo]`** — el repo cuyo Índice se resta. Sin esto, el directorio de trabajo.

## No barre el disco

Los CLI ya guardan dónde corrieron: recorrer carpetas sería reimplementar un dato que ya existe (Preferencia Local-0012, evaluar soluciones existentes antes de implementar una propia). Las dos fuentes:

| CLI | Dónde | Qué se lee |
|---|---|---|
| `claude` | `~/.claude.json` | la clave `projects`: un directorio por proyecto abierto alguna vez |
| `codex` | `~/.codex/sessions/**/rollout-*.jsonl` | el campo `cwd` de la primera línea (`session_meta`) |

De un rollout se leen los **primeros 8 KB**, no el archivo: es la transcripción entera de una sesión y no hay nada más que buscar ahí. Medido el 26-08-08 en esta máquina: 33 directorios de `claude` + 14 de `codex` sobre 93 rollouts, **112 ms**, 8 instalaciones.

Que falte una fuente no es un error: significa que ese CLI nunca corrió acá, y la búsqueda sigue con la otra.

## Qué cuenta como instalación

Que el directorio tenga `.claude/subsistemas/SUBSISTEMAS.md` — el catálogo de subsistemas, que existe en todo repo inicializado y en ninguno que no lo esté. **No alcanza con `.claude/`**: esa carpeta la tiene cualquier repo que haya visto Claude Code una vez, sin nada del harness adentro.

El **CLI lo dice la fuente**, no una heurística: un directorio que aparece en las dos se informa con las dos, y quien registre elige.

El Título y el Propósito salen de `.claude/identidad.md` con el mismo lector que usa la Pantalla de bienvenida (`common/identidad.js`). Una instalación que no declara su Identidad se informa igual, marcada: el usuario tiene que ponerle Nombre y Propósito a mano.

## Lo ya registrado se marca, no se esconde

Los que ya están en el Índice y el propio repo salen en el resultado con su marca (`yaRegistradoComo`, `esEsteRepo`). Filtrarlos de entrada haría que la salida dijera «7 instalaciones» cuando hay 8, y nadie podría explicar la diferencia.

La comparación de rutas normaliza separadores y mayúsculas —Windows escribe la misma ruta como `d:\x` y `D:/x`—, pero **solo para comparar**: lo que se muestra y lo que se registra es la ruta resuelta.

## Funciones puras para probar

`clave(dir)` y `buscarAgentes(dirRepo, candidatos)` se prueban sin tocar el `HOME` de la máquina: pasándole los candidatos armados, el resultado deja de depender de qué repos vio esta máquina. Se cubren en el banco `../lint-comunicacion/pruebas.js`.
