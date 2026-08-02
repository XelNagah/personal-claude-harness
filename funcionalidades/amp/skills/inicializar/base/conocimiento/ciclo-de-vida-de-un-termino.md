# El ciclo de vida de un término del glosario

Dos formas de operar mal el glosario y su registro par, una en cada punta del ciclo.

## Al asentar: una definición que argumenta deja de definir

El glosario pide *la definición, en una o dos frases: qué ES el concepto (no qué hace)*. Cuando
la celda además explica **por qué la cosa va donde va**, ese texto pertenece al subsistema
decisiones: quien abre el glosario buscando qué significa una palabra se encuentra con un alegato.

Caso medido: una entrada de cuatro oraciones, de las cuales una definía y tres justificaban un
ruteo que ya estaba asentado en una decisión. Al autor del repo le resultó incomprensible y su
sospecha inicial fue que el término era ajeno al dominio. El término efectivamente sobraba —era
sinónimo de algo ya nombrado—, pero lo que volvía ilegible la celda era la argumentación pegada,
no el término.

**La señal detectable:** si la celda dice por qué la cosa va a un lugar y no a otro, eso no es la
definición. Va a la decisión que lo resolvió, o se borra si ya está escrito ahí.

**Lo que se descubre al sacarla:** una celda que solo define es corta. Una entrada que necesita
argumentar para sostenerse suele no ser un concepto del dominio, sino un sinónimo de algo que ya
tiene nombre canónico.

## Al retirar: vetar rinde antes del barrido, no después

Vetar un término hace dos cosas: marca las apariciones vivas para que se corrijan, y caza las que
vuelvan. La primera es la que paga la fila; la segunda sola no la justifica.

Si el texto **ya está barrido** cuando se veta, lo que queda son marcas que no se pueden apagar.
Las menciones que sobreviven a un barrido son citas del término entre comillas simples invertidas
—hablan de él en vez de usarlo—, y el lint las lista igual, en su bloque de código y nombres. Un
registro que marca lo que no hay que corregir entrena a ignorar el registro entero.

**La secuencia que rinde:** vetar y barrer en la misma tanda. Invertirla no rompe nada, pero deja
el veto sin lo único que compraba.

**Cómo se verificó:** los dos hallazgos salieron del análisis del 02/08/2026 que retiró un término
del glosario de este repo. El segundo se midió corriendo `lint-semantica` con el texto ya barrido:
marcaba 36 apariciones en texto plano y 255 en código y nombres, y las 4 del término retirado
habrían caído todas en el segundo bloque, sin nada que corregir.

**Cuándo aplica / cuándo no:** el primer punto aplica a cualquier índice cuya columna de
descripción esté acotada a una definición. El segundo supone un lint que marque por término sobre
todo el repo; si el control solo mirara el texto plano, las citas no aparecerían y el costo del
veto tardío sería menor.
