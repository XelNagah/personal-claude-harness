# Prompt: registrar una memoria (agnóstico)

Versión agnóstica de la skill `registrar-memoria` — usable con cualquier agente. Reemplazá `<config>` por el directorio de configuración del agente (p. ej. `.claude`).

---

Registrá el siguiente hecho como memoria tipada en `<config>/memoria/`, sin duplicar:

1. **Aislá el hecho.** Una memoria = un hecho o práctica coherente. Varios hechos independientes = varias memorias.
2. **Buscá si ya está cubierto — por tema, no por nombre.** Leé el índice `<config>/memoria/MEMORIA.md` y las memorias candidatas. Ya cubierto igual → no toques nada y reportá `ya estaba`. Cubierto pero incompleto → **actualizá esa memoria**, no crees otra. No cubierto → creá.
3. **Elegí el tipo**: `user` (quién es el usuario), `feedback` (corrección o enfoque confirmado, con el porqué — el más común), `project` (objetivo/restricción no derivable del código), `reference` (puntero externo). Ante la duda feedback/project: ¿nació de una corrección del usuario? → `feedback`.
4. **Escribí `<config>/memoria/<nombre-estable>.md`** (kebab-case, sin fecha ni paréntesis):

   ```markdown
   ---
   name: <nombre-estable>
   description: <una línea gancho con el dato clave>
   metadata:
     type: user | feedback | project | reference
   ---

   <el hecho; para feedback/project seguir con **Why:** y **How to apply:**>
   ```

   Fechas siempre absolutas. Usá los términos canónicos del glosario del repo si existe.
5. **Indexá** en `MEMORIA.md`: `- [Título](archivo.md) — <gancho corto>`. Solo punteros, nunca contenido.
6. **Corré el lint** desde la raíz del repo: `node <config>/memoria/lint-memoria/lint-memoria.js` → debe dar limpio.
7. **Reportá**: creada o actualizada (cuál y por qué), tipo elegido, resultado del lint.
