# Barrer la terminología hallada en preferencias y subsistemas

**Estado: Nuevo · Creado 26-07-28.** Origen: barrido de `converger-terminologia` del 28/07/2026 sobre `PREFERENCIAS.md` y los registros de los siete subsistemas restantes (auto-excluidos `semantica/`, `tmp/` y los planes terminales).

## El problema

`lint-semantica` marca **por término**: solo encuentra lo que ya está en `TERMINOLOGIA-FARLOPA.md`. Los términos que nunca se vetaron son invisibles para el control, y por eso siguen creciendo en los registros sesión tras sesión. El barrido del 28/07/2026 encontró **doce relaciones candidatas** que ningún control mira hoy, algunas dentro de texto que se instala en cada Agente con Propósito.

Nada de lo que sigue está ratificado: vetar es potestad del usuario, así que el plan arranca por la ronda de ratificación y recién después barre.

## Estado

| Punto | Qué es | Alcance medido | Decidido |
|---|---|---|---|
| 1 | `Why:` / `How to apply:` en registros que viajan | 9 + 9 | no |
| 2 | `consumidor` frente a los canónicos de la familia Agente | 106 | no |
| 3 | `guarda` frente al canónico `Control` | 1 en decisiones, más apariciones legítimas del verbo *guardar* | no |
| 4 | `orquestador` | 37 | no |
| 5 | `sembrar` / `siembra` / `sembradas` | 7 | no |
| 6 | `casa` / `casa de datos` | 32 | no |
| 7 | `cableado` / `cablear` | 22 | no |
| 8 | `sabiduría del repo` | 8 | no |
| 9 | `skill` frente a `habilidad` | 250 contra 47 | no |
| 10 | `Test de demarcación` frente a `Prueba de pertenencia` | 5 + 2 | no |
| 11 | Regla de uso de `harness` | 136 en los registros | no |
| 12 | Anglicismos sueltos del índice de decisiones | 14 términos | no |
| 13 | Residuo de `feedback_<sub>`, subsistema retirado | 3 archivos | no |

Próxima acción: llevar los trece puntos a ratificación, de a uno, empezando por el 1.

## 1. Encabezados en inglés dentro de registros que viajan

`**Why:**` y `**How to apply:**`, 9 apariciones cada uno, en:

- los `README.md` de `conducta`, `conocimiento`, `decisiones`, `herramientas` y `planes`
- las dos páginas de preferencias que manda el Agente Multipropósito: `archivo-de-estado.md` y `estilo-commits.md`
- la página de conocimiento `terminologia-canonica.md`

Es texto que se instala en cada Agente con Propósito. Contradice la decisión 0004 (*español corriente en todo*) y cae justo en lo que la 0037 quiso cubrir. Reemplazo propuesto: `Por qué:` y `Cómo se aplica:`.

Es el punto más barato: mecánico, sin discusión de fondo, y hoy ensucia lo que se publica.

## 2. Términos que compiten con un canónico del glosario

| Término hallado | Compite con | Dónde | Propuesta |
|---|---|---|---|
| `consumidor` / `consumidores` / `repo consumidor` | **Agente con Propósito** (el repo) y **Agente Desplegado** (la instalación) | 106 apariciones: decisiones 0024, 0028, 0033, 0036, manifiestos, varios `README.md`. Los dos canónicos juntos suman 9 | vetar; elegir el canónico según se hable del repo o de la instalación |
| `guarda` (calco de *guard*) | **Control** — el glosario ya define *chequeo que frena el avance* | decisión 0024: *"`lint-harness` gana una guarda que falla si…"* | vetar en ese significado; el verbo *guardar* es legítimo y no se toca |
| `orquestador` | la habilidad `amp:inicializar` | 37 apariciones. La 0029 dice que el orquestador fue **absorbido**: el concepto ya no existe y el término siguió circulando | vetar; nombrar la habilidad |
| `sembrar` / `siembra` / `sembradas` | ya vetado como `semilla` = contenido inicial | 0027 y 0036 | extender la fila existente a las formas verbales: hoy el lint las deja pasar |
| `casa` / `casa de datos` | **Subsistema** | 32 apariciones: `AGENTS.md`, `SUBSISTEMAS.md`, el manifiesto y el `README.md` de subsistemas | decidir entre ratificarlo como otra forma de decir Subsistema o barrerlo |
| `cableado` / `cablear` (calco de *wiring*) | — | 22, incluido el título de la decisión 0019 | vetar → *conexión* / *conectar* |
| `sabiduría del repo` | — | 8, y una es el nombre de una regla de conducta que se instala en cada Agente con Propósito | decidir entre ratificarlo o reemplazarlo por *lo asentado en los subsistemas* |

## 3. Un concepto con dos nombres

- **`skill` (250) frente a `habilidad` (47).** El glosario asienta `Skill` como canónico con `habilidad` como forma válida alternativa, pero conviven sin criterio: las decisiones 0039 y 0040 escriben *habilidades*, la 0029 escribe *skills*, y los manifiestos tienen un campo `**Skills:**`. Propuesta: `habilidad` para el texto corriente, `skill` solo donde es identificador técnico (`SKILL.md`, `amp-planes:ciclo-de-plan`).
- **`Test de demarcación` (0020) frente a `Prueba de pertenencia` (0023, 0036).** Misma familia, uno en inglés y otro en castellano. Propuesta: unificar en *prueba*. ⚠️ Renombra el título de una decisión vigente y un campo de la anatomía del manifiesto.

## 4. La regla de uso de `harness`

136 apariciones en los registros, incluido el encabezado `## Base (harness v7)` de `PREFERENCIAS.md`. Es forma válida alternativa ya asentada de Agente Multipropósito, así que **no se propone vetarlo**. El problema es otro: la propia Base de preferencias dice que *"un alias registrado dice qué significa ese término, no autoriza a sustituir el nombre por él en el texto escrito"* — y ese párrafo vive en un archivo cuyo encabezado hace exactamente eso.

Propuesta: fijar la regla de uso — `harness` solo para el género (un setup de subsistemas cualquiera), `Agente Multipropósito` en todo el resto — y barrer los registros.

## 5. Anglicismos sueltos del índice de decisiones

Aplicando el test que ya inyecta la regla de conducta (¿lo diría tal cual un desarrollador hispanohablante, o es metáfora del inglés?):

- **Pasan, no se tocan:** `flag`, `default`, `scope`, `matchea`, `hardcodear`, `hook`.
- **Candidatos a veto:** `runtime` (0017, 0022, 0023), `inline` (0023, 0024), `hop` (0017, 0019), `fallback` (0011), `legacy` (0028), `soft` (0025), `launcher` y `cross-agente` (0012), `à la carte` (0029), `río arriba` (0027, calco de *upstream*), `Claude-first` (`MOMENTOS.md`).
- **`escaparate`** (0031) es castellano pero peninsular; en la Argentina se dice *vidriera*.

**`río arriba` se disparó y se barrió el mismo día (29/07/2026).** Estaba listado arriba como candidato con **1** aparición, en la 0027. El renombre de las etiquetas de origen lo usó como reemplazo sin haber leído este plan y lo llevó a **36**, de las cuales 21 en `funcionalidades/` — texto que viaja y que llegó a publicarse. Barridas las 32 introducidas, contra el término ratificado (`del Agente Multipropósito`). **Quedan las 4 preexistentes** —la 0027, este plan que lo cita, `Separar origen Base y aprendido` y su fila en `PLANES.md`— a la espera de que el veto se ratifique.

Dos cosas que deja el episodio, más allá del término:

- **La medición falló primero en silencio.** El primer barrido usó `grep -i "r[ií]o arriba"` y devolvió **cero**, que es exactamente el modo de falla que el conocimiento [grep y acentos en Windows](../../conocimiento/grep-y-acentos-en-windows.md) tiene asentado. Sin repetirlo sin `-i`, el término quedaba dado por inexistente.
- **Nada frenó la introducción.** El control de terminología del momento `al escribir` sólo marca lo que ya está vetado, y `río arriba` era candidato, no veto. Un término nuevo acuñado por el agente no lo detiene ningún control: es el hueco que el plan `Crecer el subsistema conducta` cubre con el momento al cerrar la tarea.

⚠️ El índice de decisiones se consulta al planificar: cada término acá se relee cada vez que se abre un plan.

## 5.b `casa` — metáfora sin registrar, hallada el 29/07/2026

`casa` nombra el directorio donde vive un subsistema (*"catálogo de casas persistentes"*, *"descubrir qué casas existen"*). **No está en el glosario ni en el registro de vetados**, así que ningún control la mira, y circula **42 veces** en texto vivo: 17 en la `PLANTILLA` que viaja, 4 en el manifiesto de subsistemas, el resto repartido.

Es una metáfora, no un término técnico, y el reemplazo literal ya existe en el propio vocabulario del repo: **directorio** para el lugar, **subsistema** para lo que lo ocupa. El autor la marcó al leerla en una decisión propuesta (*"¿un subsistema es una casa?"*), que es la señal de perplejidad que este plan usa como criterio.

A resolver: ratificarla como alias legítimo o vetarla y barrer las 42.

## 6. Residuo de un subsistema retirado

La 0036 retiró memoria y con ella las `feedback_<sub>`. El término sigue vivo en tres archivos, apuntando a documentos que ya no existen:

- `.claude/conocimiento/lint-conocimiento/README.md:6` — *"Referenciado por: la memoria `feedback_base_conocimiento.md`"*
- `.claude/decisiones/lint-decisiones/README.md:6` — lo mismo con `feedback_decisiones.md`
- `.claude/skills/propagar-harness/SKILL.md:12` — cita `feedback_propagacion_harness.md`

No es solo vocabulario: son referencias colgadas. Se arreglan sin ratificar nada.

## Orden propuesto

1. **Punto 6 y punto 1**, que no necesitan decisión de fondo: las referencias colgadas y los dos encabezados en inglés.
2. **Ronda de ratificación** de los puntos 2 a 5, de a uno, mostrando el texto exacto de cada fila antes de asentarla.
3. **Barrido** del texto vivo de lo ratificado, con el reparto que fija la 0026: el lint marca por término, el agente juzga el significado.
4. **Cierre** con el control completo del repo.

## Cruces con otros planes

- **`Ordenar la nomenclatura del harness`** — resuelve `registro`, `Entrada`, `Registro volátil` y cómo se escribe `Agente Desplegado`. El punto 2 de acá (`consumidor`) toca la misma familia de conceptos: conviene resolverlos juntos o, al menos, no antes que aquél.
- **`Barrer la terminologia vetada del Producto`** (En curso) — barre en `funcionalidades/` los términos **ya** vetados. Este plan corre río abajo: primero se vetan los nuevos acá, después ese barrido los alcanza. Todo lo que se vete en los puntos 1 a 5 le suma trabajo.
- **`Partir los indices por origen y pasar preferencias a tabla`** — reescribe `PREFERENCIAS.md` entero. Si se ejecuta primero, el punto 4 (`harness`) se resuelve de paso.

## Abiertos

- Los puntos 2, 6, 8 y 9 no son vetos limpios: hay que elegir entre asentar el término como forma válida alternativa o barrerlo. Ninguna de las dos es obviamente mejor sin el usuario.
- El punto 10 renombra una decisión vigente; hay que decidir si se reenuncia la decisión o solo se corrige el texto.
- Queda sin medir el volumen real de cada barrido: las cuentas de este plan son apariciones del término, no apariciones **en el significado** propuesto para vetar. El Frente A del plan del Producto midió 41 y eran 14 reales.
