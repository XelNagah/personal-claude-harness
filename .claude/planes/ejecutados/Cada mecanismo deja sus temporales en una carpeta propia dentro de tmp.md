# Cada mecanismo deja sus temporales en una carpeta propia dentro de `.claude/tmp/`

**Estado: Ejecutado · Creado 26-10-13 · Cerrado 26-10-24.**

## Contexto

El 06/10/2026, al poner al día el repo con `amp:actualizar`, apareció `.claude/.respaldo-amp/`
con siete archivos. No eran del actualizador: los había dejado `limpiar-worktree --forzar`
(`limpiar-worktree.js:153`), que respalda ahí lo que un agente escribió en su copia antes de
borrarla. La skill del actualizador da por sentado que esa carpeta solo viene de corridas
viejas y ofrece borrarla, así que los dos mecanismos se contradicen.

Hoy los temporales de los mecanismos conviven de tres formas:

- **Carpeta propia en `.claude/tmp/`:** `avisar-contexto-pesado/`, `avisar-sesion-sin-asentar/`,
  `avisos/` (el buzón), `contraste-automatico/`, `worktrees/`.
- **Archivo suelto en la raíz de `tmp/`:** `ultima-consulta-plugins.txt` (`actualizar-plugins`),
  mezclado con los borradores del usuario y del agente.
- **Fuera de `tmp/`:** `.claude/.respaldo-amp/` (`limpiar-worktree`). Git lo ignora, pero los
  lints no lo excluyen: cada respaldo suma hallazgos repetidos que nadie puede corregir.

## Lo decidido con el usuario

- **Subcarpeta por mecanismo, no por subsistema:** `tmp/limpiar-worktree/`, no
  `tmp/herramientas/limpiar-worktree/`. Es lo que ya hacen las cinco carpetas existentes, así
  que el cambio suma sin mudar nada que funcione, y cada carpeta tiene un único dueño que sabe
  qué es descartable. `avisos/` lo comparten varios mecanismos y no tiene un subsistema natural.
- **Los borradores del usuario y del agente** (handoffs, mensajes de commit, scripts de una
  sesión) siguen en la raíz de `tmp/`, como pide la Preferencia Local-0003 (Guardar los
  archivos temporales en `.claude/tmp/`).

## Trabajo

Acordado en el análisis del 15/10/2026 (ver más abajo). La regla quedó asentada en la Decisión
Local-0081 (Cada carpeta de `.claude/tmp/` tiene un dueño declarado).

1. ~~Relevar todo lo que escribe temporales~~ — hecho en el análisis.
2. Mover `ultima-consulta-plugins.txt` a `tmp/actualizar-plugins/` (`actualizar-plugins.js:809`
   y su banco). El archivo viejo de la raíz queda huérfano y es inofensivo: la primera corrida
   vuelve a consultar una vez.
3. Mover el respaldo de `limpiar-worktree` a `tmp/limpiar-worktree/respaldos/<fecha>/`
   (`limpiar-worktree.js:153`), y ajustar el mensaje (`:238`), su README (`:38`) y su banco
   (`pruebas.js:136` y `:174`).
4. Corregir el texto que da `.respaldo-amp/` por exclusivo del actualizador: `amp:actualizar`
   (`SKILL.md:177`), `docs/ARQUITECTURA.md:38` y los comentarios de `lint-conocimiento.js:8` y
   `lint-semantica.js:180`. **No quitar** las exclusiones de `.respaldo-amp` (lints,
   `ejecutar-pruebas`, `worktrees.js`, `.gitignore`): los repos consumidores pueden tener
   carpetas viejas.
5. Escribir la regla, con estos textos ya aprobados por el usuario:
   - En `.claude/herramientas/README.md`, punto 5 nuevo de «Cómo se aplica»:
     > 5. **Temporales:** un mecanismo que escribe archivos de trabajo —marcas, respaldos, avisos, copias— los deja en una carpeta propia dentro de `.claude/tmp/`, nunca sueltos en la raíz de `tmp/` ni fuera de ella. Cada carpeta tiene un dueño declarado: un mecanismo, o varios que comparten un contrato asentado (como `tmp/avisos/`). El nombre por omisión es el del mecanismo: `tmp/limpiar-worktree/`. La raíz de `tmp/` queda para los borradores del usuario y del agente. Fuera de `tmp/`, los lints barren esos archivos como si fueran del repo y repiten hallazgos que nadie puede corregir.
   - En `.claude/conducta/README.md`, ítem nuevo en la lista del Buzón (línea 82):
     > - **Los temporales de un control van en su carpeta de `.claude/tmp/`.** La regla está en `herramientas/README.md`, punto 5.
6. Correr `sincronizar-base --aplicar` (los dos README, `limpiar-worktree`, `actualizar-plugins`
   y los lints viajan en `base/`) y cerrar con
   `ejecutar-control-cierre.js --estricto` en verde.

**Fuera de este plan:** los bancos de pruebas. Decidido con el usuario el 15/10/2026: ya están
dentro de `tmp/` y los lints no los barren; su lugar lo fija el plan Local-0110 al crear el
directorio único por corrida, aplicando esta regla.

## Análisis (15/10/2026)

### Relevamiento: quién escribe temporales (punto 1)

Fuera de los bancos de pruebas, siete mecanismos:

| Mecanismo | Dónde escribe hoy | Situación |
|---|---|---|
| `avisar-contexto-pesado` | `tmp/avisar-contexto-pesado/` | carpeta propia, con su nombre |
| `avisar-sesion-sin-asentar` | `tmp/avisar-sesion-sin-asentar/` | carpeta propia, con su nombre |
| `establecer-conducta` | `tmp/contraste-automatico/` | carpeta propia, **con el nombre de la función, no del mecanismo** |
| `establecer-conducta`, `actualizar-plugins` | `tmp/avisos/` | compartida, con contrato asentado (Decisión Local-0051) |
| `preparar-worktree`, `limpiar-worktree` (vía `common/worktrees.js`) | `tmp/worktrees/` | compartida por las dos del ciclo, con el nombre de lo que guarda |
| `actualizar-plugins` | `tmp/ultima-consulta-plugins.txt` | **suelto en la raíz** |
| `limpiar-worktree --forzar` | `.claude/.respaldo-amp/` | **fuera de `tmp/`** |

`amp:actualizar` ya no escribe en el repo: respalda en el temporal del sistema (`inicializar/PLANTILLA.md:178`).

**Hallazgo:** la frase «es lo que ya hacen las cinco carpetas existentes» no es exacta. Dos de las cinco no llevan el nombre de un mecanismo: `contraste-automatico/` lleva el de una función de `establecer-conducta`, y `worktrees/` la comparten dos Herramientas. Ninguna de las dos es un problema —cada una tiene dueño claro—, pero la convención tiene que poder describirlas sin mudarlas.

**Decidido con el usuario (15/10/2026) — la regla es por dueño, no por nombre:** cada carpeta de `tmp/` tiene un dueño declarado, que es un mecanismo o varios con un contrato asentado. El nombre por omisión es el del mecanismo. Las cinco carpetas existentes cumplen sin mudarse, y las dos que se corrigen quedan `tmp/actualizar-plugins/` y `tmp/limpiar-worktree/respaldos/<fecha>/`. Descartada la regla estricta por nombre: obligaba a renombrar `contraste-automatico/` y `worktrees/`, o a llenarla de excepciones desde el primer día.

**Decidido con el usuario (15/10/2026) — dónde se asienta (punto 5):** el texto de la regla va una sola vez, en `herramientas/README.md`, que viaja y es lo que lee quien registra una Herramienta; `conducta/README.md` lleva una línea que remite, sin copiar; una Decisión de este repo asienta el porqué. La `PLANTILLA.md` de `amp:inicializar` no se toca.

**Hallazgo:** el texto que da `.respaldo-amp/` por exclusivo del actualizador no está solo en `amp:actualizar` (punto 4). También lo dicen `docs/ARQUITECTURA.md:38`, `limpiar-worktree/README.md:38` y los comentarios de `lint-conocimiento.js:8` y `lint-semantica.js:180`. Las exclusiones de `.respaldo-amp` en los lints, `ejecutar-pruebas`, `worktrees.js` y `.gitignore` **se quedan**: los repos consumidores pueden conservar carpetas viejas.

## Notas de implementación

Ejecutado el 24/10/2026, en el mismo commit que este cierre. Siguió lo planificado, con tres diferencias:

- **`actualizar-plugins` necesitaba crear la carpeta.** Escribía la marca con `writeFileSync` dentro de un `try` que traga el error: al mover la marca a `tmp/actualizar-plugins/ultima-consulta.txt` sin un `mkdirSync` antes, la escritura habría fallado sin aviso y la Herramienta habría reconsultado el remoto en cada arranque. El nombre del archivo perdió el sufijo `-plugins`, que ya da la carpeta.
- **El aviso de daño de `limpiar-worktree` (`:238`) no se podía solo reapuntar.** Ofrecía recuperar el `.claude/` desde el respaldo de `.respaldo-amp/`, pero esta Herramienta nunca respalda el `.claude/` entero, solo lo que el agente escribió en el worktree. Ahora lo dice.
- **`amp:actualizar` pide comparar antes de borrar.** Además de dejar de atribuirse `.respaldo-amp/`, la habilidad ahora pide comparar esas carpetas contra el repo antes de ofrecer borrarlas, porque las de `limpiar-worktree` pueden traer Aprendizaje que no llegó al repo (lo que en el traspaso del 15/10 era una trampa ya pagada).

Los comentarios de los dos lints se cambiaron idénticos, porque `lint-harness` vigila que no diverjan. Los comentarios del código que viaja remiten a `herramientas/README.md`, no a la Decisión Local-0081, que en otro repo no existe.

**Pruebas:** tres casos nuevos —la marca en su carpeta, nada suelto en la raíz de `tmp/`, ningún `.respaldo-amp/` tras `--forzar`— fallan con el código anterior y pasan con el nuevo. `sincronizar-base --aplicar` copió 9 archivos; `amp` pasa a 0.70.0. El control de cierre estricto da verde salvo los cuatro planes envejecidos previos y la versión de `amp` en disco distinta de la instalada, que se resuelve al publicar.

## Relacionado

- Plan Local-0110 (Dos corridas de las pruebas a la vez se pisan el directorio de trabajo):
  trata los directorios de los bancos de pruebas, que usan `tmp/` con nombre fijo. Conviene
  que el análisis de este plan decida si los bancos entran en la misma convención.
