# `grep -i` falla en silencio con acentos en Git Bash (Windows)

En Git Bash sobre Windows, `grep` con la opción `-i` (case-insensitive) y un patrón que contiene caracteres no-ASCII **devuelve cero resultados aunque los haya**. No emite error ni advertencia: se comporta igual que una búsqueda legítima sin coincidencias, que es lo que lo vuelve peligroso.

Sin `-i`, el mismo patrón acentuado funciona bien.

## Cómo se verificó

Dos casos reproducidos en este repo el **21/07/2026**, con la misma cadena y sobre los mismos archivos:

| Comando | Resultado |
|---|---|
| `grep -rF "Multipropósito" .` | **23 coincidencias** ✅ |
| `grep -rlFi "multipropósito" .` | **0 coincidencias** ❌ |

El segundo caso volvió a pasar minutos después al intentar excluir con `grep -viF` un patrón acentuado: el filtro se comió toda la salida en vez de excluir solo lo pedido. La causa es la misma.

## Cuándo aplica

- **Aplica** a `grep`/`rg` invocados desde el shell POSIX de Git Bash en Windows, con `-i` **y** un patrón que tenga acentos, eñes o cualquier byte fuera de ASCII. La causa es el locale del binario de Git Bash, que no clasifica mayúsculas/minúsculas fuera de ASCII.
- **No aplica** sin `-i`, ni con patrones puramente ASCII, ni a la herramienta `Grep` del harness (que corre ripgrep con su propio manejo de Unicode).

## Qué hacer en su lugar

Enumerar las variantes de capitalización de forma explícita, sin `-i`:

```bash
# En vez de:  grep -ri "multipropósito" .
grep -rF -e "Multipropósito" -e "multipropósito" .
```

Para excluir, misma regla: `grep -vF -e "Variante1" -e "Variante2"`.

**Señal de alarma:** un `grep` con `-i` sobre texto en castellano que devuelve `0` cuando estás casi seguro de que hay coincidencias. Antes de concluir que no hay nada, repetir la búsqueda sin `-i`.
