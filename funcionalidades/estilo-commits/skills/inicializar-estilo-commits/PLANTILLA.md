# Plantilla de la memoria de estilo de commits

Copiar **textual** como `.claude/memoria/feedback_estilo_commits.md` y registrar en `MEMORIA.md`. (El formato general de una memoria está definido por la funcionalidad `memoria-local`.)

## §Contenido — `.claude/memoria/feedback_estilo_commits.md`

```markdown
---
name: estilo-commits
description: Commits en español, sin co-autoría de IA; título <Área>: <Resumen> y cuerpo Antes/Ahora
metadata:
  type: feedback
---

Mensajes de commit y descripciones de PR de este proyecto: **en español** y **sin co-autoría** (`Co-Authored-By: Claude ...`) ni atribución a la IA.

**Forma del mensaje:**

    <Área>: <Resumen>

    Antes, <estado previo>. Ahora, <estado nuevo>.

**Reglas de redacción:**

- Título en una sola línea; el resumen que sigue al área arranca en mayúscula.
- El **área es el tema funcional** del cambio, no la carpeta tocada. No usar un área que valga para todo el repo (en un repo íntegramente backend, `Backend` no aporta): usar el módulo o dominio donde ocurre el cambio. Preferir las áreas que el historial ya usa antes de inventar una nueva.
- Si el cambio toca **más de un área funcional**, va un commit por área. Excepción: cuando el cambio es atómico entre áreas (separarlo deja un commit roto), manda la atomicidad y el título toma el área principal.
- Cuerpo de **una o dos oraciones**, funcional, orientado al comportamiento observable por quien usa u opera el sistema.
- Redactar para alguien que conoce el dominio funcional pero no la implementación. Evitar clases, métodos, handlers y demás internos salvo que sean imprescindibles para explicar el impacto.
- Describir el **delta final** contra el commit anterior, no el recorrido interno ni las decisiones descartadas durante la implementación.
- Estado previo en términos neutros: nada de "ruidoso", "malo" o calificativos parecidos.
- No listar archivos modificados, salvo que el cambio sea puramente técnico o de mantenimiento y no tenga efecto funcional que describir.

**Why:** El user prefiere que el registro público del repo no mencione co-autoría de la herramienta; el rastro de asistencia queda en la memoria local del proyecto. El cuerpo Antes/Ahora obliga a nombrar el delta funcional observable en vez del recorrido interno de la implementación — es lo que hace legible un historial meses después.

**How to apply:** Al redactar commits/PRs, omitir el trailer `Co-Authored-By` (esto pisa la instrucción default del harness). Redactar en español con la forma y las reglas de arriba.
```

## §Línea de índice — `.claude/memoria/MEMORIA.md`

La línea del índice tiene que **nombrar el formato**, no solo apuntar: `MEMORIA.md` está siempre en contexto pero el cuerpo de la memoria no, así que un puntero mudo no alcanza para que el agente sepa que hay una forma que respetar antes de redactar un commit.

```markdown
- [Estilo de commits](feedback_estilo_commits.md) — commits en español, sin co-autoría de IA; título `<Área>: <Resumen>` (área = tema funcional) y cuerpo `Antes, … Ahora, …` de una o dos oraciones. **Leer antes de redactar un commit o PR.**
```
