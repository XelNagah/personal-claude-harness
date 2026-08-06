# 0034 — El Agente con Propósito contiene al Agente Multipropósito

Elaboración de la decisión. Lo que se decidió está en su fila del registro; acá van la alternativa
descartada, lo que esta decisión explica de otras y el desfase que dejó a la vista.

## La alternativa descartada: dos estados de la misma entidad

Se evaluó modelar el Agente Multipropósito y el Agente con Propósito como dos **estados sucesivos**
de una misma cosa, en vez de como composición. Se descartó por dos consecuencias que no cerraban:
actualizar habría sido "volver al estado anterior", y no habría manera de explicar que el Agente
Multipropósito cambie de versión mientras el Agente con Propósito sigue siendo el mismo.

## Qué explica de otras decisiones, sin agregarles nada

- **Decisión Local-0027 (separación por origen en los subsistemas):** Base *es* el Agente
  Multipropósito adentro, y aprendido *es* el Aprendizaje. La separación por origen no era una
  convención de archivos: era esta composición, escrita antes de tener el nombre.
- **Decisión Local-0028 (diseño del actualizador):** el actualizador converge por estructura y no guarda
  versión porque la versión es del Agente Multipropósito, y el Agente con Propósito no tiene ninguna.
- **Decisión Local-0033 (poner al día un Agente instalado son dos fases):** son dos porque el Agente
  Multipropósito tiene dos partes que viajan por caminos distintos — los plugins traen las skills y
  `amp:actualizar` escribe los archivos.

## El desfase que ningún control mira

De las dos partes se sigue un tercer desfase, además de los conocidos: el de **las dos partes entre
sí**. Caso medido: el repo consumidor `Agente-Coordinador` tenía los archivos de la generación nueva
y los plugins de la vieja. Nada lo detectaba.

## Precisiones de vocabulario

"Archivos" y "skills" nombran el **canal de despliegue**, no una partición funcional: un subsistema
se reparte entre las dos —sus registros son archivos, su habilidad viaja aparte—. El corte funcional
(subsistemas más habilidades transversales) es otro, y ya estaba en el glosario.

No toda entrada de un Agente con Propósito es Aprendizaje: las Base vienen del Agente Multipropósito.

## Consecuencia sobre `amp:inicializar`

Deja de ser un instalador de archivos y pasa a ser **el acto donde el Propósito se define** y el
Agente con Propósito empieza a existir.

## El caso que más se presta a confusión

**Este repo es un Agente con Propósito**, y su Propósito es autorar el Agente Multipropósito. Se
asienta explícitamente porque es donde la distinción se pierde más fácil. Junto al Producto del
Propósito —lo que el repo entrega, en la raíz, fuera de `.claude/`— queda el cuadro completo:
mecanismo, Aprendizaje y Producto.
