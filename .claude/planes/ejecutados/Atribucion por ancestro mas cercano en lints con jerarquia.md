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

## Notas de implementación

Se implementó tal como se planificó, en un worktree aislado (`piloto/atribucion-ancestro`). Sin desvíos de alcance.

**Fragmento compartido.** El bloque `indiceAncestro` + `indiceNombra` se insertó textualmente idéntico en `lint-conocimiento.js` y `lint-memoria.js`, justo después de `resolverRef`, anclado por los comentarios `// --- Atribucion por ancestro mas cercano …` / `// --- fin atribucion por ancestro ---`. Se sumó a `FRAGMENTOS` en `lint-harness.js` como tercera pieza vigilada (junto a "raiz del repo" y "resolucion de refs"), así que las 6 copias —2 vivas + 4 embebidas— quedan obligadas a no divergir.

**Alcance de cada lint.** En `lint-conocimiento`, `gaps` pasó de iterar índices × páginas a iterar páginas y resolver un solo dueño; `orphans` se alineó al mismo criterio (una página excusada solo por un índice ajeno sigue siendo huérfana de su propio índice). En `lint-memoria`, el conjunto de índices es `MEMORIA.md` de la raíz más cualquier `sub/INDICE.md`; el print de gaps ahora nombra el índice culpado (`${i} no lista ${p}`, que degenera a `MEMORIA.md no lista …` en layout plano) y el chequeo de frontmatter saltea los `INDICE.md` (un sub-índice es estructura, no una memoria).

**Verificación antes/después** con un layout anidado real armado en `.claude/tmp/` (raíz → `sub/INDICE.md` → `sub/deep/`), corriendo el lint viejo y el nuevo sobre el mismo fixture:

- Conocimiento — **antes:** 2 gaps, uno de ellos el falso positivo `INDICE.md no lista sub/deep/pagina-c.md` (página que la raíz ya había delegado a `sub/`, y `sub/` a `deep/`). **Después:** 1 solo gap, el real: `sub/INDICE.md no lista sub/pagina-huerfana.md`. El falso positivo desapareció y el hallazgo verdadero sigue cayendo, una sola vez y contra el índice que corresponde. Además la página sin listar ahora también aparece en huérfanos: antes la excusaba el índice raíz por nombrar la carpeta `sub/`, que no es su índice dueño.
- Memoria — **antes:** `MEMORIA.md no lista sub/memo-x.md` (no reconocía el sub-índice) + `sub/INDICE.md [sin frontmatter]`. **Después:** ambos chequeos limpios; `memo-x` se atribuye a `sub/INDICE.md` y `MEMORIA.md` deja de ser culpada.
- **Degenerado:** los dos lints sobre `.claude/conocimiento` y `.claude/memoria` reales (layout plano) dan la misma salida que antes del cambio — todo en cero.

**Propagación.** Antes de tocarlas se verificó que las 4 copias embebidas fueran byte-idénticas al código vivo previo; después del reemplazo se volvió a comparar cada una carácter a carácter contra el archivo vivo: las 4 idénticas. Versiones subidas: `conocimiento` 0.5.3 → 0.5.4, `memoria-local` 0.4.5 → 0.4.6, `setup-completo` 0.5.7 → 0.5.8.

**No absorbe al plan del lint unificado.** Si [Lint unificado parametrizable por capacidad de subsistema](../pendientes/Lint%20unificado%20parametrizable%20por%20capacidad%20de%20subsistema.md) avanza, esta atribución queda como una de sus reglas.

**Control de cierre:** los 9 lints y `claude plugin validate` en verde, y `lint-harness` con **0** en "BLOQUES VERBATIM DIVERGENTES". El único hallazgo de `lint-harness` son 34 "junctions que apuntan a otro lado", artefacto de correrlo desde un worktree (los junctions de la máquina apuntan al repo principal); no lo introdujo este cambio.
