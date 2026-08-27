# Las barras invertidas dobles se pierden al escribir código desde la herramienta de Bash

Todo lo que el agente le pasa a la herramienta de Bash llega con **la mitad de las barras invertidas**: `\\` se convierte en `\`, y `\\\\` en `\\`. La pérdida ocurre **antes de que Bash vea el comando**, así que no la evita ninguna de las protecciones que uno esperaría — ni las comillas simples, ni un heredoc citado, ni `printf '%s'`.

El problema no es la pérdida: es que **no falla**. El archivo se escribe, el programa arranca y contesta. Lo que devuelve está mal.

## El daño medido

Escribiendo la migración de clases de `amp:actualizar` (26/08/2026), esta línea:

```js
const cuantas = (texto.match(new RegExp('\\|\\s*' + viejo + '\\s*\\|', 'gi')) || []).length;
```

quedó en el archivo como `new RegExp('\|\s*' + viejo + '\s*\|', 'gi')`. En JavaScript, dentro de una cadena, `\|` es `|` y `\s` es `s`: el patrón dejó de ser «una celda de tabla que contiene exactamente esta palabra» y pasó a ser una **alternancia con ramas vacías**, que casa en cada posición del texto. Sobre cuatro filas de prueba contó **282** coincidencias donde debía contar **2**, y contó las mismas 282 para un término que no aparecía en ninguna fila.

Un patrón así no rompe: valida sobre todo o sobre nada. Es la misma familia que la página [controles que dejan de controlar sin avisar](controles-que-no-avisan.md) — el control corre, contesta, y lo que contesta no significa nada.

## Cómo se verificó

El 26/08/2026, en Git Bash sobre Windows 11, con tres formas distintas de escribir el mismo texto:

| Forma | Se escribió | Quedó en el archivo |
|---|---|---|
| heredoc citado (`<<'FIN'`) | `a\\|b` y `\\s` y `\\\\` | `a\|b` y `\s` y `\\` |
| heredoc sin citar (`<<FIN`) | `a\\|b` y `\\s` | `a\|b` y `\s` |
| `printf '%s\n' '…'` | `\\|` y `\\s` y `\\\\` | `\|` y `\s` y `\\` |

Las tres pierden lo mismo, y las tres deberían comportarse distinto entre sí bajo las reglas de Bash: un heredoc citado entrega su cuerpo textual, y `printf '%s'` con comillas simples no interpreta nada. Que las tres coincidan es lo que ubica la pérdida **antes** de Bash.

La herramienta de escritura de archivos **no lo sufre**: el mismo texto escrito con ella conserva `'\\|\\s*'` intacto, verificado con `grep -o` sobre el archivo resultante.

**Lo que no está verificado** es qué capa exacta las consume — la herramienta, el puente a Git Bash en Windows, o la serialización del comando. Para el trabajo diario no cambia nada: la regla vale igual. Pero no está medido y no se debe afirmar.

## Cómo se evita

- **Escribir el archivo con la herramienta de escritura**, no con `cat`, `printf` ni un heredoc. Es la salida corta y la única que no necesita contar barras.
- **Construir la barra por código** cuando el archivo se genera desde un script: `chr(92)` en Python, `String.fromCharCode(92)` en JavaScript. Cuesta legibilidad y sobrevive a cualquier capa de escape.
- **Evitar la barra**: en JavaScript, un literal de expresión regular (`/\|\s*/`) no pasa por una cadena y necesita la mitad de las barras, así que una sola pérdida ya no lo destruye. No sirve cuando el patrón se arma con una variable.

## Cómo se detecta

Nunca alcanza con que el script corra. Dos chequeos, los dos baratos:

1. **Mirar el archivo escrito**, no el comando que lo escribió: `cat -A archivo` o `grep -o "patron.\{0,40\}" archivo`. Se ve de un vistazo si las barras están.
2. **Probar contra datos sintéticos con el resultado esperado escrito de antemano** — «cuatro filas, dos de ellas con la clase retirada, esperadas 2». Sin el número esperado escrito antes de correr, un `282` se lee como que funcionó.

## Cuándo aplica y cuándo no

Aplica a **cualquier texto con barras invertidas** que viaje dentro del comando de Bash: expresiones regulares, rutas de Windows, secuencias de escape en cadenas, `sed` y `awk`. Cuanto más escapada esté la sintaxis, más se nota.

**No aplica** a la herramienta de escritura de archivos ni a los archivos ya existentes en disco, que no pasan por esta capa. Tampoco a las barras simples: `\n` escrito en el comando llega como `\n`; lo que se colapsa es el par.
