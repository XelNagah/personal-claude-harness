# Crecer el subsistema conducta

**Estado: Diferido · Creado 26-07-23.** Origen: [Construir el subsistema conducta](../ejecutados/Construir%20el%20subsistema%20conducta.md), cerrado por path (a). Ese plan dejó el subsistema `conducta` **construido y funcionando** (registro + momentos + 3 reglas activas + hook repartidor + lint + MANIFIESTO, control 10/10, decisión 0021). Acá queda el **crecimiento**.

## Por qué Diferido

**Pausa deliberada (26-07-23):** se para con 3 reglas activas para **dejar correr la medición unas sesiones** antes de sumar más momentos. Un plan que espera no está *en curso* — está pospuesto a propósito.

**Condición de reanudación:** que haya suficiente uso acumulado para medir si las reglas activas efectivamente cambian la conducta (el juez del plan madre *Que el harness tenga efecto conductual*). Sin esa señal, sumar momentos es construir a ciegas.

## Qué falta (crecer, a demanda)

- **Repartidor `Stop`** (momento `al cerrar tarea`) para activar la 4.ª regla `pendiente` (registrar cuando algo cambia). **Requiere diseño por `planificar`**, no es agregado mecánico: su `additionalContext` llega tarde (el turno ya cerró), forzar la continuación arriesga un bucle (como pasó con caveman), y la condición "algo cambió" roza el juicio (0021: lo que necesita juicio no es un momento).
- **Skills de gestión** de reglas: crear / modificar / borrar / analizar / verificar. Hoy el registro se edita a mano.
- **Empaquetar como funcionalidad/plugin** (marketplace + junctions dobles + fila en `REGISTRO.md` + orquestador), patrón `agregar-funcionalidad`. Primero medir in-repo, después distribuir — igual que el piloto de `conocimiento`. Al distribuir, respetar que el texto que viaja no cita números de decisión del harness (decisión 0024, follow-up ya anotado).
- **Medir el efecto conductual** — el juez del plan madre. Es la razón del diferimiento.

## Comparable externo (fuente)

**Hermes Agent (Nous Research)** valida el diseño de `conducta` desde afuera. Su bucle de auto-mejora en vivo es, mecánicamente, **un texto en el system prompt que empuja al agente + una herramienta que escribe un archivo** (`skill_manage`) — nada más; la parte estadística (los motores GEPA/Atropos) corre en diferido y con una persona aprobando cada cambio. Eso mapea uno a uno a `conducta`:

- El **empuje** de Hermes = una regla clase `inyectar`. La 4.ª regla Base (*registrar cuando algo cambia*, momento `al cerrar tarea`) **ya es exactamente eso** — hoy `pendiente` por falta del repartidor `Stop` que este plan tiene que construir.
- La **herramienta que escribe** (`skill_manage`, `memory_tool`) = las skills `registrar-*` / `/contrastar`.
- **Dónde `conducta` supera a Hermes:** la clase **`correr`** (resolver el momento **sin juicio del agente**) no existe en Hermes en vivo, que solo puede inyectar y confiar en el juicio del agente. Una fila `al cerrar tarea | correr | /contrastar hacia atrás` da la versión determinística en vivo — que Hermes solo logra en diferido. El repartidor `Stop` habilita ambas intensidades.

Fuentes en el repo de mejora de uso:
- Mecanismos: `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\hermes-agent.md`
- Mapeo componente↔subsistema (cómo replicar Hermes con subsistemas): `D:\Proyectos\analisis\como-uso-claude\.claude\conocimiento\replicar-hermes-en-amp.md`

## Se cruza con

- **Plan madre** [Que el harness tenga efecto conductual](Que%20el%20harness%20tenga%20efecto%20conductual.md): la medición de acá es su frente C (verificar que el mecanismo cambie la conducta).
- **Candidato** para la futura skill de ejecución de planes ([Habilidad de ejecucion de planes](Habilidad%20de%20ejecucion%20de%20planes.md)).
