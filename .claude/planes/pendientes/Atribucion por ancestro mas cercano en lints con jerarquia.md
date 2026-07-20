# Atribución por ancestro más cercano en lints con jerarquía

Bajar la decisión 0011 al código de los lints que recorren subárbol. Hoy `lint-conocimiento` hace responsable al índice raíz por páginas ya delegadas a un sub-índice; el mismo bug está **latente en `lint-memoria`**.

## El bug (0011 lo define como regla)

`lint-conocimiento` atribuye cada página a **todos** los índices cuyo directorio la contenga (`p.startsWith(cat + sep)`), sin cortar en los sub-índices del medio. Y el fallback por carpeta (`folderOk`) solo mira el padre inmediato (`basename(pdir)`), así que para una página a dos o más niveles el índice de arriba tiene que nombrar carpetas internas que justamente delegó. Resultado: la delegación no existe para el lint, y una página cae dos veces (una por cada índice).

`lint-memoria` tiene walk recursivo pero atribución plana a un solo índice (`MEMORIA.md` lista todo). Si se anida `memoria/sub/x.md` con `sub/INDICE.md` propio, no reconoce el sub-índice: exige que `MEMORIA.md` liste `x.md`. Misma clase, esperando que alguien anide.

## Propuesta

Regla 0011: cada página se atribuye a su **índice ancestro más cercano**; un sub-índice, a su ancestro **estricto** más cercano (así el padre queda obligado a nombrar la Carpeta, y eso cae por `[2] INDICE INCOMPLETO`, no por huérfanos). El fallback por carpeta recorre la cadena de ancestros hasta el directorio del índice, no solo el padre inmediato. Un hallazgo cae una sola vez, contra el índice que corresponde.

Con memoria de un solo índice la regla degenera limpio: "ancestro más cercano" = siempre `MEMORIA.md`. El mismo fragmento sirve a los dos sin ramas especiales.

## Alcance

- **Código: `lint-conocimiento` + `lint-memoria`** (los que caminan el árbol). Fragmento de atribución **textualmente idéntico** en ambos; `lint-harness` fuerza que no diverjan (como con `resolverRef` en 0.4.1).
- **No se toca** `lint-glosario`/`lint-decisiones`/`lint-planes`: modelo tabla, no recorren subdirectorios. 0011 los cubre por escrito para cuando se les habilite jerarquía.
- Propagar a las plantillas + orquestador; subir versiones; control de cierre.

## A tener en cuenta

- No aflojar: una página en subárbol delegado que el sub-índice no liste debe seguir cayendo — una sola vez, contra el sub-índice.
- Verificar antes/después con un layout anidado real (raíz → sub-índice → carpeta con README), como el que disparó el hallazgo.
- Relación con el plan `Lint unificado parametrizable`: si ese avanza, esta atribución es una de sus reglas; conviene no duplicar esfuerzo. Ver cuál se hace primero.
