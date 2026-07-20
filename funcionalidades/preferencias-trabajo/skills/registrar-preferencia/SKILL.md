---
name: registrar-preferencia
description: Detecta un feedback recurrente del usuario y propone registrarlo como preferencia en PREFERENCIAS.md — redacta la regla, decide si va a Adaptaciones del repo o amerita subir al harness (Base), y corre el lint. Use when el usuario corrige lo mismo por segunda vez, dice "que esto sea una preferencia", "anotalo como regla", o al cerrar una sesión con correcciones repetidas.
---

# Registrar una preferencia

Convierte un feedback recurrente en regla de conducta persistida (`.claude/preferencias/PREFERENCIAS.md`), para que deje de depender de que el usuario lo repita. Es la "nivelación de preferencias" que el modelo Base/Adaptaciones prevé pero que nadie ejecutaba.

## Cuándo dispara

- El usuario corrige **lo mismo por segunda vez** (mismo tipo de corrección, aunque cambie el caso) — señal más fuerte que cualquier pedido explícito.
- Pedido directo: "que esto quede como regla".
- Al cerrar una sesión: repasar si hubo correcciones repetidas que ameriten subirse.

## Flujo

1. **Aislar la regla.** ¿Qué conducta concreta pide el usuario, en general y no solo en el caso puntual? Redactarla como las existentes: **accionable y verificable en el punto de acción**, con el porqué si no es obvio. No registrar la anécdota — registrar la regla que la anécdota revela.
2. **Chequear las preferencias existentes**: ¿ya hay una regla que lo cubre? → quizás el problema no es que falte la regla sino que no se cumple (eso no se arregla re-escribiéndola — decirlo). ¿Hay una parecida? → proponer **afinarla** en vez de agregar otra.
3. **Decidir el destino** (la estructura es Base + Adaptaciones):
   - **Adaptaciones de este repo** — la regla es específica de este proyecto. Destino normal: es la única sección editable localmente.
   - **Base** — la regla vale para todos los repos del usuario. La Base **no se edita localmente**: viene del harness y se actualiza al nivelar. Proponer llevarla al repo del harness (donde editar la Base implica subir su versión y propagar); mientras tanto puede vivir en Adaptaciones.
4. **Confirmar con el usuario** el texto exacto y el destino — las preferencias son conducta del agente: nada se asienta sin ok.
5. **Escribir y cerrar con el lint** desde la raíz del repo:

   ```bash
   node .claude/preferencias/lint-preferencias/lint-preferencias.js
   ```

6. **Reportar**: regla asentada (texto final), destino, y si se recomendó subirla al harness.
