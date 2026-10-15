# Cada mecanismo deja sus temporales en una carpeta propia dentro de `.claude/tmp/`

**Estado: Nuevo · Creado 26-10-13.**

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

1. Relevar todo lo que escribe en `.claude/tmp/` o fuera de él (hoy, una docena de scripts
   bajo `.claude/`, sin contar los bancos de pruebas).
2. Mover `ultima-consulta-plugins.txt` a `tmp/actualizar-plugins/`.
3. Mover el respaldo de `limpiar-worktree` a `tmp/limpiar-worktree/respaldos/<fecha>/`, y
   ajustar el mensaje que lo nombra (`limpiar-worktree.js:238`) y su banco.
4. Corregir en `amp:actualizar` el texto que da por sentado que `.respaldo-amp/` solo viene de
   corridas viejas.
5. Asentar la convención donde la lean quienes escriben mecanismos nuevos (a definir en el
   análisis: README de herramientas, de conducta, o la plantilla de `amp:inicializar`).

## Relacionado

- Plan Local-0110 (Dos corridas de las pruebas a la vez se pisan el directorio de trabajo):
  trata los directorios de los bancos de pruebas, que usan `tmp/` con nombre fijo. Conviene
  que el análisis de este plan decida si los bancos entran en la misma convención.
