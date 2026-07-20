# Proponer skills operativas por funcionalidad

**Estado: En curso · Creado 26-07-19.** Hoy casi toda funcionalidad tiene **una** skill: la de instalación (`inicializar-<X>`). La única con skill **operativa** (de uso, no de setup) es `planificar`. El objetivo de cada subsistema no se cumple solo instalándolo — se cumple **usándolo bien sesión a sesión**. Faltan skills que ayuden a operarlo.

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

## Avance de la sesión 26-07-19 (planificar)

Lo ya ratificado por el usuario:

1. **Taxonomía por ámbito → decisión 0009.** *Skill de Subsistema* (opera sobre un subsistema concreto, viaja en el plugin de su funcionalidad) y *Skill del Agente Multipropósito* (transversal, funcionalidad propia — hoy `planificar`). Las de autoría del harness quedan **fuera** de la taxonomía: son Herramientas del Propósito de este repo (0007), locales, no distribuibles. Reemplaza la partición provisional "familia A/B" de la sesión.
2. **Criterio skill vs script (en 0009).** Mecánico determinista → script/lint; requiere juicio o significado → skill (puede llevar scripts auxiliares). Resuelve el eje "Skill vs. lint vs. CLAUDE.md" del planteo.
3. **Distribución confirmada.** Un plugin puede llevar varias skills; las operativas se agregan en `funcionalidades/<X>/skills/` junto a la de instalación y viajan con el plugin (en consumidores viven en el cache del plugin, no en `.claude/`).
4. **Autoría de este repo: tres Herramientas ratificadas** (a construir, primeras filas tipo `skill` del registro):
   - `control-cierre` — **script**: corre los 11 chequeos (8 lints de subsistema + lint-herramientas + lint-harness + `claude plugin validate .`) y resume en un reporte. En `.claude/herramientas/control-cierre/`.
   - `propagar-harness` — **skill** local: flujo de la memoria `feedback_propagacion_harness.md` (subagente fresco, verificación textual de embebidos, reporte de divergencias). En `.claude/skills/propagar-harness/`.
   - `agregar-funcionalidad` — **skill** local: los 5 pasos de REGISTRO.md (plugin.json, marketplace, junction, REGISTRO, orquestador) + validate. En `.claude/skills/agregar-funcionalidad/`.
5. **Terminología convergida** (glosario actualizado, insumo asentado en el plan de veto): control (no "gate"), harness (canónico), nivelar (no "levelear"), textual (no "verbatim"/"byte-exact"), skill (alias habilidad), más las dos clases de la taxonomía.
6. **Planes diferidos vinculados como origen de Skills de Subsistema:** "Capa semántica de coherencia" → skill de glosario (desviaciones/sinónimos sobre el repo); "Habilidad para poblar subsistemas desde un repo existente" → skill de conocimiento (recorrer el repo y proponer páginas).

## Entregable: tabla de Skills de Subsistema (ratificada 26-07-19)

Nombres ratificados con el patrón del usuario: **"registrar-X" para dar de alta**. Corte ratificado: primero las tres altas; las medias en segunda tanda; lo demás no se construye.

| Funcionalidad | Skill | Qué hace | Prioridad | Tanda |
|---|---|---|---|---|
| memoria-local | `registrar-memoria` | Captura una memoria tipada: elige tipo, detecta si una existente ya cubre el hecho (actualizar vs duplicar), indexa, lint | Alta | **1 — construir** |
| gestion-de-planes | `ciclo-de-plan` | Abrir (nombre estable, archivo, fila en registro) y cerrar/mover (estado, fechas, notas, carpeta, lint) | Alta | **1 — construir** |
| glosario | `converger-terminologia` | Recorre el texto del repo, detecta desviaciones/sinónimos del glosario, propone ratificar o vetar (control 0004). Materializa el plan diferido "Capa semántica" | Alta | **1 — construir** |
| conocimiento | `buscar-conocimiento` | Recorre el repo buscando saber no asentado y propone páginas. Materializa el plan diferido "Poblar subsistemas" | Media | 2 |
| decisiones | `registrar-decision` | Numera, redacta qué+por qué, detalle si compleja, lint; juzga si es estructural | Media | 2 |
| preferencias-trabajo | `registrar-preferencia` | Detecta feedback recurrente del usuario y propone subirlo a Adaptaciones/Base (la "nivelación de preferencias" nunca resuelta) | Media | 2 |
| herramientas | `registrar-herramienta` | Fila + README si es script + advertencia de refs por ruta | Baja | no se construye (instrucción alcanza) |
| estilo-commits | — | — | — | ninguna (regla simple ≠ skill, 0009) |

**Terminología resuelta 26-07-19:** "slug" → "nombre estable (sin fecha)", sin entrada de glosario (los planes no tienen id: el nombre del archivo es la identidad); "prosa" → **Texto plano** (entrada de glosario). Ambos términos viejos anotados para Vetados en el plan de veto.

## Ejecución 26-07-19 — autoría + tanda 1 construidas

- **Autoría (Herramientas de este repo, registradas en `herramientas/INDICE.md`):**
  - `control-cierre` (script, `.claude/herramientas/control-cierre/`): descubre todos los `lint-*` dinámicamente + `claude plugin validate`, resume verde/hallazgos. Probado: TODO VERDE.
  - `propagar-harness` (skill, `.claude/skills/propagar-harness/`): flujo de la memoria de propagación (subagente fresco, verificación carácter a carácter, bump de versiones).
  - `agregar-funcionalidad` (skill, `.claude/skills/agregar-funcionalidad/`): alta completa según REGISTRO.md.
- **Tanda 1 (Skills de Subsistema, doble formato SKILL.md + `prompt-<skill>.md`):**
  - `registrar-memoria` en `funcionalidades/memoria-local/` (v0.2.0)
  - `ciclo-de-plan` en `funcionalidades/gestion-de-planes/` (v0.2.0)
  - `converger-terminologia` en `funcionalidades/glosario/` (v0.2.0; de paso se corrigió la descripción del plugin: "sinónimos a evitar" → "alias registrados")
- **Cableado:** junctions creadas para las 3; REGISTRO.md actualizado (filas + tabla Plugin/Skill + nota de skills operativas). Sin impacto en el orquestador: las skills operativas no instalan nada, viajan con el plugin.
- **Verificación:** control-cierre TODO VERDE (9 chequeos, incluye plugin validate).

**Queda pendiente (el plan sigue En curso):** tanda 2 (`buscar-conocimiento`, `registrar-decision`, `registrar-preferencia`); mencionar las skills operativas en los README de las 3 funcionalidades tocadas; al ejecutar el plan de veto, el barrido va a tocar también los textos de estas skills si algún término cae vetado.
