# Identidad del Agente — Título y Propósito persistidos

**Estado:** Nuevo. Desprendido de `Pantalla de bienvenida del Agente Multipropósito` (planificar, 26-07-20).

## Qué es

La **Identidad del Agente** (glosario) = **Título + Propósito** del repo, persistidos como **dato legible por máquina**. Hoy el Propósito solo vive como prosa en `AGENTS.md` / decisión 0001 — nada lo expone como dato. Sin esto, la Pantalla de bienvenida no tiene de dónde sacar el título.

## Diseño (tentativo, acordado a grandes rasgos)

- **Vive en** `.claude/identidad.md` (nombre calza con el término ratificado; rename barato si no cierra). Importado siempre desde `AGENTS.md` para estar en contexto.
- **Composición:** Título (nombre del Agente/repo) + Propósito (una línea). Nada más por ahora.
- **Tolerante a indefinido:** un repo puede arrancar sin ella; los lectores muestran `<sin definir>` hasta que se defina.
- **Captura:** el setup la pregunta al inicializar (toca el orquestador `inicializar-custom` + `inicializar-memoria-local`/la memoria inicial). Para repos ya existentes: queda indefinida hasta el próximo nivelado.
- **Sugerencia del agente:** el propio agente puede proponer un Título/Propósito cuando lo identifique en la sesión y guardarlo ahí (con ratificación del usuario, control 0004).

## Por qué es plan aparte

El dashboard (plan principal) solo **lee** la identidad. **Capturarla + persistirla** toca el orquestador y el flujo de setup, y puede avanzar independiente. Separarlos mantiene el plan del dashboard acotado a leer + renderizar.

## Abierto

- Nombre definitivo del archivo (el usuario no está seguro; `identidad.md` es el candidato).
- ¿La captura es interactiva en el setup, o siempre diferida a que el agente la proponga?
- ¿Se vuelve un subsistema chico o queda como archivo suelto importado? (Hoy: archivo suelto, no persiste índice+lint → no es subsistema.)
