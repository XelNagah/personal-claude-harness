# probar-disparo-de-skills

Corre un banco de consultas contra sesiones reales y contesta si cada Skill **se invoca sola**, sin que el usuario la nombre.

Existe porque la `description` de una Skill carga todo el peso del disparo —al arrancar solo se cargan `name` y `description`, y el cuerpo del `SKILL.md` no participa de la decisión—, así que es texto cuyo efecto no se puede leer: hay que medirlo.

## Qué mide, exactamente

**La primera herramienta que usa el agente ante la consulta.** Si es `Skill` y es la esperada, disparó; si es cualquier otra —o si contesta sin usar ninguna—, no disparó.

Ese criterio no es arbitrario: distingue los dos comportamientos que interesan. El agente que consulta la Skill, y el que estima poder resolverlo solo y se pone a leer archivos a mano. En la prueba del 06/08/2026 que originó esta Herramienta, la primera herramienta fue `Bash` y el agente leyó cuatro Componentes de Subsistema por su cuenta sin invocar nada.

## Cómo se invoca

```bash
node .claude/herramientas/probar-disparo-de-skills/probar-disparo-de-skills.js [--skill=<nombre>] [--id=<id>] [--listar]
```

- `--listar` — muestra el banco sin correr nada. Es gratis.
- `--skill=<nombre>` — corre solo las consultas de esa Skill.
- `--id=<id>` — corre una sola consulta.

Sale con código 1 si alguna consulta no se comportó como el banco declara. Deja el detalle en `ultima-corrida.json`.

## ⚠️ Antes de correrla

- **Cuesta cuota real:** una sesión por consulta.
- **Mide lo instalado, no lo editado.** Las Skills que una sesión ve vienen de los plugins instalados, no de `funcionalidades/`. Editar una `description` y correr esto sin publicar mide la versión vieja y **contesta en verde sobre lo que no cambió**. La secuencia obligatoria es: subir la versión del plugin, publicar, `actualizar-plugins --aplicar`, y recién ahí medir.
- **No escribe en el repo:** las herramientas se limitan a lectura más `Skill`. Si el agente intenta escribir, el intento igual aparece en el flujo y se cuenta como primera herramienta, pero no llega a tocar nada.

## La consulta va por STDIN

En Windows hay que correr `claude` con el intérprete de por medio —es un `.cmd`, y `spawn` sin él falla con `EINVAL`—, y eso concatena los argumentos sin escapar. Una consulta pasada como argumento **se parte en palabras sueltas y el CLI toma solo la primera**: hasta el 09/08/2026 el banco medía `preguntale`, `que`, `quiero`, no la consulta. No fallaba: contestaba, con un veredicto sobre un texto que nadie escribió. Va por STDIN, igual que el mensaje del subsistema `comunicacion`.

Al cambiar cómo se invoca el CLI, verificar que la consulta llegue entera antes de creerle a un veredicto: una corrida con la consulta a mano y comillas, comparada contra la del banco, alcanza.

## El banco

`banco.json`. Cada consulta declara qué Skill espera, si `debe_disparar`, y por qué.

Las consultas que **no** deben disparar son las que más valen: comparten palabras con la Skill pero necesitan otra cosa. Una consulta obviamente ajena no prueba nada — si el banco solo tiene casos fáciles, cualquier `description` pasa. `donde esta el archivo del glosario` comparte la palabra con el subsistema semántica y aun así es una pregunta de ubicación, no de vocabulario: ese es el tipo de caso que detecta una `description` demasiado ancha.

Al ampliarlo, variar el fraseo (formal, casual, con errores de tipeo), qué tan explícita es la consulta (algunas nombran el dominio, otras describen la necesidad sin nombrarlo) y cuántos pasos tiene. Las más útiles son aquellas donde la Skill sirve pero la conexión no salta a la vista.

## No viaja

Sirve a quien publica el Agente Multipropósito, no a un Agente Desplegado: mide las Skills que el Agente Multipropósito distribuye. Mismo criterio que `medir-contexto` y `sincronizar-base`.
