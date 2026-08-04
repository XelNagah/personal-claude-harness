# Analizar y diseñar de alto a bajo nivel

Esta preferencia expresa una elección metodológica del usuario: ante la incertidumbre, prefiere **fallar poco** antes que **fallar rápido**. Antes de acumular pequeños pasos de implementación, busca comprender conceptualmente el problema, descomponerlo en elementos y entender sus relaciones de alto nivel.

## Cambio sustractivo

Un cambio es **sustractivo** cuando, para incorporar funcionalidad, hay que desarmar, romper o rehacer lo construido porque la estructura anterior no contemplaba una necesidad razonablemente previsible.

No significa que toda eliminación o refactorización sea incorrecta. La señal de falla es descubrir tarde que el diseño no admite una extensión esperable y tener que retroceder durante meses para incorporarla.

## Dolor temprano

La estrategia asume temprano el costo de enfrentar las dificultades. Martin Fowler llama *Early Pain* al beneficio de hacer aparecer pronto los problemas que de otro modo se descubrirían tarde, cuando queda menos tiempo y energía para resolverlos.

Fowler presenta el concepto como beneficio del desarrollo iterativo. Esta preferencia lo aplica además al análisis y diseño de alto nivel: hacer visibles los riesgos estructurales antes de implementar.

Fuente: https://martinfowler.com/bliki/EarlyPain.html

## Límite

El objetivo no es predecir cualquier necesidad futura ni evitar toda refactorización. Es contemplar extensiones razonablemente previsibles, favorecer cambios aditivos compatibles con lo anterior y evitar abstracciones puramente especulativas.
