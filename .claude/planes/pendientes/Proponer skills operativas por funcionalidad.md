# Proponer skills operativas por funcionalidad

**Estado: Nuevo · Creado 26-07-19.** Hoy casi toda funcionalidad tiene **una** skill: la de instalación (`inicializar-<X>`). La única con skill **operativa** (de uso, no de setup) es `planificar`. El objetivo de cada subsistema no se cumple solo instalándolo — se cumple **usándolo bien sesión a sesión**. Faltan skills que ayuden a operarlo.

## Planteo

Distinción clave:
- **Skill de instalación** (`inicializar-memoria-local`, `inicializar-glosario`…): monta la estructura en el repo. Se corre una vez / se reconcilia.
- **Skill operativa** (`planificar`): trabaja con el subsistema ya montado, sesión a sesión, para cumplir su objetivo.

La idea: para **cada funcionalidad**, identificar y proponer las skills operativas que le falten y que la ayuden a cumplir su objetivo. No inventar por inventar — solo donde haya un uso repetido y de valor que hoy se hace a mano.

## Barrido por funcionalidad (candidatos a explorar, NO decididos)

Para cada una, la pregunta es: *¿qué acción repetida sobre este subsistema merece una skill?*

- **memoria-local** — ¿skill para *capturar* una memoria bien tipada al vuelo (elegir tipo, evitar duplicado, actualizar índice, correr lint)? ¿skill para *consultar* memoria relevante al arrancar una tarea?
- **preferencias-trabajo** — ¿skill de *leveleo* (detectar un feedback recurrente del usuario → proponer subirlo a Base/Adaptación)? Hoy el leveleo se menciona pero no tiene skill.
- **gestion-de-planes** — ¿skill para *abrir/cerrar/mover* un plan por su ciclo (crear con slug, registrar en PLANES.md, transicionar estado, correr lint)? Mucho de esto se hace a mano ahora mismo.
- **estilo-commits** — ¿skill que *arme el commit* respetando la memoria de estilo (español, sin co-autoría)? Roza con `caveman-commit` externo; ver si compite o complementa.
- **conocimiento** — ¿skill para *asentar una página* de conocimiento (ubicar, evitar duplicado por tema, indexar, lint)? ¿skill de *consulta* al planificar?
- **glosario** — ¿skill para *registrar un término/alias* con el gate de ratificación? ¿skill de *consulta* del glosario al analizar?
- **decisiones** — ¿skill para *asentar una decisión* estructural (numerar, tabla, detalle si complejo, lint)? Consulta al planificar (parte ya la cubre `planificar`).
- **scripts** — (ver plan de repensar scripts como Herramientas) ¿skill para *dar de alta* una tool en el registro con su README?
- **setup-completo** — orquestador; su skill ya es operativa de instalación. ¿Necesita una de *reconciliación/auditoría* del setup instalado? (roza con `lint-harness`).

## Ejes de diseño a resolver
- **Skill vs. lint vs. sección de CLAUDE.md.** Muchas de estas acciones hoy viven como instrucción en `CLAUDE.md` + lint. ¿Cuándo amerita una skill dedicada y cuándo alcanza con la instrucción cargada siempre? Criterio: skill = flujo multi-paso con decisiones; instrucción = regla simple.
- **Consulta vs. escritura.** Separar skills de *consulta* (leer el subsistema al planificar) de las de *escritura* (asentar/mover). `planificar` ya hace consulta transversal de glosario+decisiones+conocimiento — no duplicar.
- **Solapamiento con `planificar`.** Ya interroga varios subsistemas. Ver qué queda cubierto y qué no.
- **Costo de mantenimiento.** Cada skill nueva = dos formatos (prompt agnóstico + skill Claude Code) + posible verbatim en orquestador. No sumar skills de bajo uso.
- **Empaquetado.** ¿Cada skill operativa va dentro de su funcionalidad existente (misma carpeta `funcionalidades/<X>/skills/`) o se agrupan? Precedente: `planificar` es funcionalidad propia (operacional, no instala).

## Entregable esperado
Una tabla: funcionalidad × skill operativa propuesta × qué problema resuelve × prioridad × ¿ya cubierto por instrucción/lint/planificar? Recién con eso, decidir cuáles construir.

## Correr por
`planificar` — es análisis de diseño transversal. Puede generar decisiones estructurales (qué es skill y qué no).
