---
name: reubicar-aprendizaje
description: Recorre el Aprendizaje y coordina a los subsistemas dueños para proponer la reubicación de piezas mal ubicadas. Use when se quiere vaciar Memoria, migrar contenido entre subsistemas, o revisar dónde debería vivir lo aprendido; nunca mueve ni parte una pieza sin confirmación del usuario.
---

# Reubicar Aprendizaje

Coordina una revisión transversal, sin registro persistente de propuestas. No es `amp:actualizar`: abre Aprendizaje y por eso requiere confirmación por pieza.

1. Leer el catálogo de subsistemas, índices y planes pertinentes. Inventariar las piezas candidatas, empezando por `.claude/memoria/` y luego por documentos fuera de su subsistema.
2. Consultar al subsistema dueño de cada destino:
   - conocimiento: `amp-conocimiento:buscar-conocimiento`;
   - decisiones: `amp-decisiones:registrar-decision` para juzgar si una propuesta es estructural;
   - conducta: sus reglas y momentos;
   - preferencias: `amp-preferencias:registrar-preferencia`;
   - documentación de subsistema: el `README.md` de su carpeta.
3. Presentar **una pieza por vez**: fuente, destino recomendado, por qué, y si corresponde mover, sintetizar o partir. Esperar confirmación explícita.
4. Aplicar solo lo confirmado; reparar índices y referencias. No borrar el origen hasta que el destino esté completo.
5. Cerrar con los lints de cada subsistema tocado y un reporte `movido / sintetizado / dividido / descartado`.

## Reconciliación

Si se vuelve a correr, excluir piezas ya reubicadas y reconocer equivalentes por tema. Si una propuesta anterior quedó a medias, mostrar el estado real y pedir dirección; no duplicar contenido.
