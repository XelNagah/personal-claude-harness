# Mudar los subsistemas de .claude a .amp

**Estado: Nuevo · Creado 26-07-29.** Intención de Javier planteada el 29/07/2026: sacar los datos del Agente Multipropósito de la carpeta de un agente concreto, para que no dependan del modelo ni de la herramienta que corra la sesión. No está decidido nada: falta la revisión de alto nivel.

## El problema

Los ocho subsistemas viven hoy en `.claude/`, que es la carpeta de configuración de **Claude Code**. Eso es una contradicción con el objetivo declarado del repo: los datos que el agente acumula sesión a sesión —planes, glosario, decisiones, conocimiento, preferencias— no son de Claude Code, son del repo. Un Agente con Propósito que corra con Codex CLI, Cursor o Gemini CLI guarda su Aprendizaje en una carpeta que lleva el nombre de otro producto.

El destino propuesto es `.amp/`, la casa de datos sin dueño. `.claude/` y `.codex/` quedan como lo que ya son: la configuración de cada agente.

## Lo que NO se puede mudar

Medido el 29/07/2026 sobre este repo. Tres restricciones duras que definen la forma del movimiento:

- **`.claude/settings.json` y `.claude/settings.local.json` se quedan.** Claude Code lee la configuración de ahí y de ningún otro lado. Lo mismo `.claude/skills/` (las habilidades locales del repo) y `.claude/agents/`.
- **`.claude/` no desaparece, entonces.** El resultado es una separación por rol, no una carpeta menos: `.claude/` = configuración de Claude Code, `.codex/` = configuración de Codex CLI, `.amp/` = los datos de los subsistemas.
- **La marca para encontrar la raíz del repo puede seguir siendo `.claude`.** Los hooks resuelven la raíz subiendo desde el directorio de la sesión hasta encontrar `.claude/`, y como `settings.json` obliga a que esa carpeta exista en la raíz, la marca sigue sirviendo durante y después de la mudanza. Solo cambia el `require` del final, que pasa a apuntar a `.amp/conducta/…`.

## Alcance medido

Conteo del 29/07/2026 sobre el texto `.claude/`, en cuatro pilas muy desparejas:

| Pila | Tamaño | Naturaleza |
|---|---|---|
| Código vivo (`.js`) | 17 archivos | Los lints de cada subsistema, el repartidor de conducta, el detector de vetados, la Pantalla de bienvenida y las cuatro Herramientas. Mecánico, pero es donde un error no falla: acierta el lugar equivocado |
| Texto que viaja (`funcionalidades/`) | 273 apariciones en 21 archivos, 167 de ellas en `PLANTILLA.md` | Define qué se instala en cada Agente con Propósito |
| `AGENTS.md` | 15 rutas | Casi todas los `@import` de manifiestos |
| Texto histórico (`.claude/`) | ~1127 apariciones en 230 archivos | Planes ejecutados, decisiones, conocimiento. **La enorme mayoría no se toca**: describen lo que pasó cuando la ruta era esa. Solo se tocan índices y manifiestos vivos |

## El trabajo grande no está acá

En este repo la mudanza es un renombre. En los diecisiete Agentes con Propósito instalados es una **migración de datos**, que `amp:actualizar` tiene que conducir sin perder Aprendizaje: mover `.claude/<subsistema>/` a `.amp/<subsistema>/`, dejar la configuración donde está, y reconciliar un repo que quedó a mitad de camino.

Precedente exacto y ya vivido: el retiro de `memoria/`, que sigue siendo el paso más delicado del actualizador. La lección de ahí aplica entera — hay que decidir qué pasa con un repo que tiene las dos carpetas a la vez, y no informar "al día" hasta que la vieja desaparezca.

## Frentes

1. **Decidir el nombre y asentarlo.** `.amp/` es una sigla, y la preferencia Base pide el nombre completo en lo que queda escrito. Como nombre de carpeta la sigla es un identificador, no texto corriente, pero la decisión merece quedar registrada con su motivo.
2. **Mudar este repo:** los ocho subsistemas, los 17 archivos de código, los `@import` de `AGENTS.md`, y los índices y manifiestos vivos.
3. **Mudar el texto que viaja:** `PLANTILLA.md` del instalador consolidado y las habilidades que nombran rutas.
4. **Sumar el paso de migración al actualizador**, con su reconciliación y su prueba sobre un consumidor viejo.
5. **Poner al día los lints** que hoy asumen la ruta, incluido el barrido que excluye `tmp/`.

## Relación con otros planes

- **Versionado del harness dentro del `.claude` del repo host** (26-07-22) — la mudanza cambia cuál es la carpeta a versionar aparte, pero **no** resuelve el hueco de ese plan: `AGENTS.md` sigue viviendo en la raíz, un nivel arriba de cualquier carpeta que se versione.
- **Sacar la duplicación entre el Producto y el Agente instalado** (26-07-26) — conviene saber cuál se ejecuta primero: si la Plantilla pasa a ser la fuente y `.claude/` su salida, la mudanza se hace en un solo lado en vez de dos.

## Estado

Sin arrancar. Falta la revisión de alto nivel con `amp:planificar`.
