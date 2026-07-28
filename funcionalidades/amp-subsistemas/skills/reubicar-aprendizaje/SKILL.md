---
name: reubicar-aprendizaje
description: Recorre el Aprendizaje y coordina a los subsistemas dueños para proponer la reubicación de piezas mal ubicadas. Excluye infraestructura y duplicados Base antes de conversar: la confirmación pieza por pieza se reserva para contenido propio del Propósito. Use when se quiere vaciar Memoria, migrar contenido entre subsistemas, o revisar dónde debería vivir lo aprendido; nunca mueve ni parte una pieza de Aprendizaje sin confirmación del usuario.
---

# Reubicar Aprendizaje

Coordina una revisión transversal, sin registro persistente de propuestas. No es `amp:actualizar`: abre Aprendizaje y por eso requiere confirmación por pieza.

1. Leer el catálogo de subsistemas, índices y planes pertinentes. Inventariar las piezas candidatas, empezando por `.claude/memoria/` y luego por documentos fuera de su subsistema.
2. **Filtrar antes de preguntar.** Excluir infraestructura Base y contenido Base ya cubierto por su destino actual. Cuando la invoca `amp:actualizar`, respetar su tabla de ocho memorias Base retiradas: esas piezas se reconcilian automáticamente y no se presentan para confirmación. Si una pieza Base contiene una adición propia del repo, separar la adición y tratar solo esa parte como Aprendizaje.
3. Consultar al subsistema dueño de cada destino:
   - conocimiento: `amp-conocimiento:buscar-conocimiento`;
   - decisiones: `amp-decisiones:registrar-decision` para juzgar si una propuesta es estructural;
   - conducta: sus reglas y momentos;
   - preferencias: `amp-preferencias:registrar-preferencia`;
   - documentación de subsistema: el `README.md` de su carpeta.
4. Presentar **una pieza de Aprendizaje por vez**: fuente, destino recomendado, por qué, y si corresponde mover, sintetizar o partir. Esperar confirmación explícita.
5. Aplicar solo lo confirmado; reparar índices y referencias. No borrar el origen hasta que el destino esté completo.
6. Cerrar con los lints de cada subsistema tocado y un reporte `movido / sintetizado / dividido / descartado`.

## Reconciliación

Si se vuelve a correr, excluir piezas ya reubicadas y reconocer equivalentes por tema. Si una propuesta anterior quedó a medias, mostrar el estado real y pedir dirección; no duplicar contenido.
