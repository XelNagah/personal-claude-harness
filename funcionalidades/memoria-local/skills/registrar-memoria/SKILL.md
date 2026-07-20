---
name: registrar-memoria
description: Registra un hecho como memoria tipada en .claude/memoria/ — elige el tipo, detecta si una memoria existente ya lo cubre (actualizar en vez de duplicar), lo indexa en MEMORIA.md y corre el lint. Use when surge algo que recordar entre sesiones ("acordate de esto", "guardalo en memoria", "esto es un feedback"), o al cerrar una tarea que dejó aprendizajes.
---

# Registrar una memoria

Captura un hecho en el sistema de memoria local (`.claude/memoria/`) sin duplicar y sin dejar huérfanos. El riesgo que esta skill elimina: memorias repetidas por tema con nombres distintos, índice desactualizado, frontmatter inválido.

## Flujo

1. **Aislar el hecho.** ¿Qué es exactamente lo que hay que recordar? Una memoria = un hecho o práctica coherente, no un volcado de la sesión. Si son varios hechos independientes, son varias memorias (repetir el flujo).
2. **Buscar si ya está cubierto — por tema, no por nombre.** Leer `MEMORIA.md` y abrir las memorias candidatas. Tres salidas:
   - **Ya cubierto igual** → no tocar; reportar `ya estaba`.
   - **Cubierto pero incompleto o desactualizado** → **actualizar esa memoria** (extender el texto, ajustar `description`), no crear otra.
   - **No cubierto** → crear.
3. **Elegir el tipo** (`metadata.type`):
   - `user` — quién es el usuario (datos estables de la persona).
   - `feedback` — corrección o enfoque confirmado por el usuario, con el porqué. El más común al cerrar tareas.
   - `project` — objetivo o restricción del proyecto no derivable del código.
   - `reference` — puntero a material externo.
   Si el hecho mezcla tipos, separar (paso 1). Ante la duda entre `feedback` y `project`: ¿nació de una corrección del usuario? → `feedback`.
4. **Escribir el archivo** `.claude/memoria/<nombre-estable>.md` (nombre kebab-case, sin fecha, sin paréntesis):

   ```markdown
   ---
   name: <nombre-estable>
   description: <una línea GANCHO con el dato clave, no un título vago>
   metadata:
     type: user | feedback | project | reference
   ---

   <el hecho. Para feedback/project, seguir con **Why:** y **How to apply:**>
   ```

   Fechas siempre absolutas (nunca "hoy", "la semana pasada"). Terminología: usar los términos canónicos del glosario si el repo tiene.
5. **Indexar en `MEMORIA.md`**: una línea `- [Título](archivo.md) — <gancho corto>`. Solo el puntero — el índice nunca lleva contenido. Si se actualizó una memoria existente, revisar que su línea del índice siga siendo fiel.
6. **Cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/memoria/lint-memoria/lint-memoria.js
   ```

7. **Reportar**: memoria creada o actualizada (cuál y por qué), tipo elegido, y el resultado del lint.
