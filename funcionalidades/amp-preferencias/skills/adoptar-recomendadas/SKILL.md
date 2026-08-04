---
name: adoptar-recomendadas
description: Muestra el catálogo de Preferencias Recomendadas que trae el Agente Multipropósito y adopta las que el usuario elija, una por una, en el Índice del Agente Desplegado. Ninguna se instala sola. Use when el usuario dice "preferencias recomendadas", "qué preferencias me convienen", "traeme tus preferencias", "adoptá las recomendadas", o al terminar de inicializar un repo cuyo Índice de Preferencias quedó vacío.
---

# Adoptar Preferencias Recomendadas

El Agente Multipropósito trae un **catálogo de preferencias recomendadas**: elecciones de quien lo publica, ofrecidas como sugerencia. **Ninguna llega a un repo por instalar el plugin.** Esta habilidad las muestra, el usuario elige y lo elegido entra como Aprendizaje del Agente Desplegado, con Código propio.

Adoptar no crea vínculo con el catálogo: los cambios posteriores del catálogo no se propagan, igual que en cualquier copia puntual entre Agentes.

## Cuándo dispara

- Pedido directo: «mostrame las preferencias recomendadas», «adoptá las recomendadas», «qué preferencias me convienen».
- Después de inicializar un repo, si su Índice del Agente Desplegado quedó sin filas.
- Cuando el usuario quiere llevar a un repo nuevo el mismo criterio que ya usa en otros.

## Dónde vive el catálogo

En `recomendadas/`, dentro de la carpeta de esta habilidad. Tiene la **misma forma que un Índice de Preferencias** —frontmatter que lo declara, tabla `Código | Nombre | Descripción | Detalle` y las páginas de detalle al lado—, así que lo lee el mismo auxiliar que copia entre Agentes.

Los Códigos del catálogo son suyos y **no viajan**: cada adopción recibe un `Local-NNNN` del destino.

**El catálogo es derivado y no se edita a mano.** Quien publica el Agente Multipropósito lo regenera desde su propio Índice del Agente Desplegado con `sincronizar-recomendadas`.

## Flujo

1. **Ubicar el catálogo y el destino.** Resolver `recomendadas/` desde la carpeta de esta habilidad, nunca desde el repo destino. El destino es la raíz del repo actual, salvo que el usuario indique otro.

2. **Leer el subsistema del destino.** Partir de `.claude/preferencias/MANIFIESTO.md` y leer **todos** los Índices declarados. Sirve para no ofrecer lo que el repo ya tiene.

3. **Presentar el catálogo.** Mostrar, para cada recomendada, su Nombre y su Descripción completa —el usuario elige leyendo el texto que va a quedar rigiendo, no un resumen— y marcar el estado frente al destino:
   - **disponible:** no hay nada equivalente;
   - **ya estaba:** el destino tiene una entrada equivalente;
   - **divergente:** el destino tiene el mismo tema con contenido distinto; se informa y no se ofrece pisar.

4. **Que el usuario elija.** Puede tomar todas, algunas o ninguna. No adoptar por omisión ni recomendar «todas» como respuesta por defecto: el sentido del catálogo es que la elección sea explícita.

5. **Vista previa de cada elegida**, una por vez:

   ```bash
   node <ruta-skill>/../registrar-preferencia/scripts/incorporar-preferencia.js --catalogo <ruta-skill>/recomendadas --codigo <Base-NNNN> --destino <repo>
   ```

6. **Aplicar**, repitiendo el mismo comando con `--aplicar`. El auxiliar asigna `Local-NNNN` como el mayor del Índice local más uno, copia la página de detalle si la hay, repara dentro de ella la referencia al Código del catálogo y no pisa nada divergente.

7. **Cerrar con el lint** desde la raíz del repo destino:

   ```bash
   node .claude/preferencias/lint-preferencias/lint-preferencias.js
   ```

8. **Reportar** en tres grupos: `agregado`, `ya estaba` y `divergente`, cada uno con su Preferencia resultante, Código y rutas. Informar además cualquier recomendada que el usuario no eligió, para que no parezca omitida por error.

## Límites

- Adopta preferencias y su página declarada en `Detalle`. Una recomendada que necesite Conducta, Herramientas u otro subsistema para cumplirse informa la dependencia y se coordina con el subsistema dueño.
- No promueve nada a la Base del destino: lo adoptado es siempre Aprendizaje del Agente Desplegado.
- No sincroniza. Si el catálogo cambia después, lo ya adoptado no se entera.

## Reconciliación (idempotencia)

Releer los Índices del destino antes de cada escritura. Una recomendada equivalente devuelve `ya estaba` sin escribir; una del mismo tema con contenido distinto devuelve `divergente` y no se pisa; una página de detalle preexistente con otro contenido tampoco. La vista previa y una cancelación no modifican nada. Correr la habilidad dos veces seguidas deja el repo igual que la primera.
