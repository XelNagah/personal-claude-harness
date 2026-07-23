# 0021 — Subsistema conducta

## Qué se decidió

El harness gana un subsistema nuevo, **`conducta`**, que asegura comportamientos del tipo *"cuando hagas X, asegurate de Y"* atando **momentos** del flujo a **guía** para el agente. Ratificado el 2026-07-22.

## Por qué

Materializa el **frente C** del plan *Que el harness tenga efecto conductual*: el mecanismo en el punto de acción. Las reglas cargadas al arranque el agente las recita y no las obedece (conocimiento [`modos-de-falla-ante-reglas-escritas`](../conocimiento/modos-de-falla-ante-reglas-escritas.md)). Un hook que entrega la regla **en el momento de actuar** sí cambia la conducta — evidencia en vivo: el hook de caveman se re-inyecta cada turno y se pega.

Se evaluó la alternativa de **config fija** (un `settings.json` escrito una vez, sin subsistema) y se descartó como solución única: agregar cada regla obligaría a editar a mano el `settings.json` + escribir un script + cablear la paridad, sin lint — que es la misma conducta sucia (inventar mecanismos por fuera) que el harness combate. El subsistema hace la **acumulación de reglas segura y con lint**, igual que memoria/glosario/decisiones hacen segura su acumulación. El caso que lo funda: en un repo contable, *"antes de crear una transacción, verificá que la partida doble balancee"* debe poder agregarse como **una fila con lint**, no como un mini-proyecto de configuración.

## El modelo

- **Momento de conducta** = evento de hook + condición que la máquina evalúa sin juicio. Es agente-agnóstico; cada agente declara con qué mecanismo lo realiza (o que no puede). Lo que necesita juicio **no** es un momento de conducta: se degrada a un empujón por turno.
- **Regla de conducta** = ata un momento a una **acción**, de tres clases: *inyectar texto* (el agente hace Y con su juicio) / *correr una Herramienta* (la máquina hace Y sin juicio) / *bloquear* (solo donde Y es sin juicio y el falso positivo es imposible). Regla: Y verificable por máquina → lo hace la máquina; Y con juicio → se empuja al agente.
- **Dos registros:** `momentos` (momento · qué representa · evento · condición · disponibilidad por agente) y `reglas de conducta` (regla · momento · acción · estado).
- **Entrega:** un **hook repartidor por evento** (sin filtro), escrito una vez por agente, que lee el registro compartido y entrega la regla que corresponde al evento + datos actuales. Agregar una regla **no toca la config**: el repartidor lee el registro vivo.
- **Base instalada:** el subsistema no viene vacío. Trae reglas base — respetar las preferencias, considerar el conocimiento, contrastar contra glosario/decisiones al escribir (test 0020), registrar en el subsistema que corresponde cuando algo cambia. Sobre esa Base, cada repo suma reglas de su Propósito. Paralelo al modelo Base/Adaptaciones de preferencias.
- **Se apoya en los otros subsistemas:** la acción de una regla suele ser "consultá el glosario" o "corré `registrar-conocimiento`". `conducta` los **agenda** en el momento justo, no los duplica.
- **Gestión por skills** del subsistema (crear/modificar/borrar/analizar/verificar), distribuidas como plugin; lint propio.

## Multi-agente

El momento es conceptual; su realización es por agente, en la columna de disponibilidad:

- **Claude Code:** `PreToolUse` matchea nombres de tool (incluidos MCP).
- **Codex:** su `PreToolUse` solo ve Bash → un momento sobre una tool MCP se **desvía** haciendo pasar la acción por una Herramienta Bash que Codex sí intercepta, o queda "no realizable" (documentado).
- **Cursor/otros:** lo que permitan, o no realizable.

Degradación **explícita** en el registro, no rota en silencio. Consistente con la paridad de 0010/0013.

## Absorbe

Resuelve de una la clase "control en el punto de acción": los planes `Hook de preferencias en punto de acción`, `Control de ratificación para decisiones` y `Chequear el plan escrito contra la sabiduría del repo`.

## Abierto (va al plan de construcción)

- Empezar **fino** (un hook repartidor + registro de reglas + lint) y hacer crecer momentos/gestión a demanda, vs armar todo de entrada.
- Latencia del repartidor que corre en cada tool call.
- Viabilidad fina del desvío por Bash en Codex.
- Cómo se genera/instala la config de cada agente (nivelador).
- Reconciliar una discrepancia de fuentes: ¿`PreToolUse` inyecta contexto o solo bloquea? (el documento de hooks de `como-uso-claude` dice que sí; el guide consultado el 22/07 dijo que no).

## Relación

Se apoya en el patrón de subsistema (0002), respeta que los hooks quedan fuera de Herramientas (0007) dándoles casa propia, y usa la paridad/degradación multi-agente de 0010/0013. Una de sus reglas base es el test de demarcación (0020).
