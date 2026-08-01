# Buscar con acentos en Windows devuelve cero aunque haya coincidencias

En Git Bash sobre Windows, `grep` con la opción `-i` (insensible a mayúsculas) y un patrón que contiene caracteres no-ASCII **devuelve cero resultados aunque los haya**. No emite error ni advertencia: se comporta igual que una búsqueda legítima sin coincidencias, que es lo que lo vuelve peligroso.

Sin `-i`, el mismo patrón acentuado funciona bien.

```bash
grep -rF  "análisis" .     # encuentra lo que hay
grep -rFi "análisis" .     # devuelve 0, y no avisa
```

La causa es el locale del binario de Git Bash, que no clasifica mayúsculas y minúsculas fuera de ASCII. Lo mismo pasa al excluir: un `grep -viF` con patrón acentuado se come toda la salida en vez de excluir solo lo pedido.

## Cuándo aplica

- **Aplica** a `grep` invocado desde el shell POSIX de Git Bash en Windows, con `-i` **y** un patrón que tenga acentos, eñes o cualquier byte fuera de ASCII.
- **No aplica** sin `-i`, ni con patrones puramente ASCII, ni a la herramienta de búsqueda del agente, que corre ripgrep con su propio manejo de Unicode.

## Qué hacer en su lugar

Enumerar las variantes de capitalización de forma explícita, sin `-i`:

```bash
# En vez de:  grep -ri "análisis" .
grep -rF -e "Análisis" -e "análisis" .
```

Para excluir, misma regla: `grep -vF -e "Variante1" -e "Variante2"`.

## Por qué importa más de lo que parece

El daño no es la búsqueda perdida: es la **conclusión**. Un agente que busca un término acentuado en los registros del repo, recibe `0` y concluye que ese término no está registrado, va a asentarlo de nuevo, contradecir lo que ya estaba, o dar por inexistente algo que existe. La respuesta vacía es indistinguible de la verdad.

**Señal de alarma:** un `grep` con `-i` sobre texto en castellano que devuelve `0` cuando había motivos para esperar coincidencias. Antes de concluir que no hay nada, repetir la búsqueda sin `-i`.
