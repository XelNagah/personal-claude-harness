**Estado: Ejecutado · Creado 26-08-08 · Cerrado 26-08-08.**

## Notas de implementación (cierre 26-08-08)

Implementado como subsistema Base `comunicacion` con el Patrón completo. Piezas construidas:

- **Casa `.claude/comunicacion/`**: `INDICE.md` (Índice de Subsistema `origen: agente-desplegado`, columnas `Código | Nombre | Propósito | Directorio | CLI`, header-only —el registro es Aprendizaje local, no se commitea, gitignoreado en el destino), `MANIFIESTO.md` (liviano, no se carga siempre), `README.md`, `indice.js` (módulo compartido `leerIndice` + `CLIS_SOPORTADOS`).
- **`lint-comunicacion/`**: controles de nombres únicos/no vacíos, Directorio existe y tiene `.claude/`, CLI soportado, y forma del Índice; banco `pruebas.js` que enciende cada control ante su defecto y cubre `leerIndice` y `construirComando`.
- **`consultar/consultar.js`**: mecanismo de consulta síncrona de solo lectura (banderas nativas del CLI, mensaje por STDIN y directorio por `cwd` → sin superficie de inyección; `shell: true` en Windows), respuesta rotulada como contexto, no orden.
- **Plugin `amp-comunicacion`** (`0.1.0`): skills `registrar-agente` y `consultar-agente`; sumado a `marketplace.json`, a `dependencies` de `amp` (versión subida a `0.43.0`) y a `REGISTRO.md`.
- **Registros y setup**: `SUBSISTEMAS.md` (Base-0009), `AGENTS.md` (import del manifiesto + árbol + conteos), `amp:inicializar` (PLANTILLA §Subsistemas + §Gitignore + SKILL conteos), `base/comunicacion/` (viaja), rótulo de la Pantalla de bienvenida (`agentes conocidos`).
- **Decisión estructural** Local-0064 asentada.

Cierre verde en `ejecutar-control-cierre` salvo el desfase de versión de `amp` (esperado: se resuelve al publicar y actualizar). Las decisiones de diseño quedaron todas ratificadas en el cuerpo del plan (abajo).

---

**Estado original al abrirse: Nuevo · Creado 26-08-08.**

# Subsistema comunicacion — consulta síncrona entre Agentes Desplegados

Nuevo subsistema Base del Agente Multipropósito para que un Agente Desplegado **consulte a otro** de forma síncrona y reciba la respuesta sin que el usuario haga de cartero.

Convergido con `amp:planificar` el 08/08/2026. Cada decisión de abajo se ratificó una por una.

## El problema

Hoy dos Agentes Desplegados solo se comunican con el usuario de intermediario: lee lo que uno produjo, lo copia y se lo pega al otro. El caso asíncrono —dejar algo para la próxima sesión— ya está resuelto con los handoffs (Preferencia Base-0014). Lo que falta es el caso **vivo**: preguntarle algo a otro Agente Desplegado y traer la respuesta, sin copiar y pegar a mano.

La plataforma no lo cubre: `SendMessage` y las notificaciones de tareas no cruzan repos ni sesiones (achique del 06/08 en el plan Local-0060, Buzones).

## Decisiones tomadas (ratificadas una por una)

1. **Alcance:** solo comunicación entre Agentes, síncrona. El asíncrono entre sesiones queda en los handoffs. No reemplaza al plan Local-0060 (Buzones), que cubre el corte asíncrono; lo complementa.
2. **Origen:** Base del Agente Multipropósito — viaja a todo Agente Desplegado. El **mecanismo** (skills + lint) es Base; el **registro** es Aprendizaje local (guarda rutas de máquina, no se commitea, análogo al alcance `local` de la Decisión Local-0035).
3. **Qué se registra:** solo **otros Agentes Desplegados** (AMPs), no agentes cualquiera. La entrada se apoya en el concepto Agente Desplegado (glosario Local-0004): un AMP es detectable por su `.claude/` con el harness instalado, y responde desde subsistemas de forma conocida.
4. **Naturaleza:** **solo lectura** — el agente consultado responde desde su conocimiento; nunca escribe ni ejecuta en su repo. Delegación con acción se marcó como extensión aditiva futura (Preferencia Local-0006), no parte de este plan. Respeta la condición "es contexto, no orden" del plan Local-0060.
5. **Forma:** subsistema nuevo con el Patrón completo (índice + entradas + lint + skills), empaquetado como plugin que viaja. Manifiesto liviano, **no** cargado siempre — se consulta a demanda, como planes y decisiones.
6. **Interacción:** ida y vuelta única, sesión efímera y sin estado. Se descartó la conversación multi-turno (exige continuidad de sesión) por ahora; se puede sumar como modo aparte o emular pasando contexto en cada llamada.
7. **Poblado:** skill explícita ahora; `descubrir-agentes` (autodescubrimiento de AMPs en la máquina) después, como skill aparte. El autodescubrimiento depende del plan Local-0034 (Identidad del Agente — Título y Propósito persistidos) para etiquetar el Propósito sin abrir cada repo.

## Piezas a construir

- **El registro** — índice de entradas `{nombre, propósito, directorio}` del Agente Desplegado. Probablemente una columna más con **qué CLI usa** cada agente (Claude Code / Codex), para saber cómo invocarlo — a resolver al ejecutar.
- **Skill de carga** — registra un Agente Desplegado en el índice (nombre, propósito, directorio, CLI).
- **Skill de consulta** — corre al agente consultado en su directorio en **modo lectura** con el mensaje como entrada, captura la salida y la devuelve al agente consultante. Ida y vuelta única.
- **Lint** del subsistema — integridad del índice: nombre único, directorio que existe, forma de las filas.
- **Manifiesto** liviano + README, según el Patrón. Empaquetado como plugin `amp-comunicacion`, sumado al marketplace y al bundle de dependencias de `amp`.

## Nombres — provisionales, a ratificar

Por gobernanza (Preferencia Base-0003, Decisión Local-0016) los nombres los ratifica el usuario; la entrada de glosario pasa por `converger-terminologia` al ejecutar, apoyada en el concepto Agente Desplegado (glosario Local-0004).

- **Subsistema:** `comunicacion` (propuesto por el usuario el 08/08/2026; nombre de trabajo).
- **Término de la entrada:** *Agente Desplegado conocido* (o similar) — a convergir. Ojo con el choque de sentido de "agente" en el repo (Agente Multipropósito, Agente Desplegado, subagentes de `agents/`): por eso el subsistema **no** se llama `agentes`.
- **Skill de carga:** `registrar-agente` (verbo+objeto, Decisión Local-0015).
- **Skill de consulta:** `consultar-agente` — "consultar" ya connota solo lectura.
- **Skill futura:** `descubrir-agentes`.

## A resolver al ejecutar

- **Cómo se garantiza la solo-lectura** en la sesión invocada: modo de permisos del CLI / conjunto de herramientas de solo lectura. La invocación no puede poder escribir en el repo consultado.
- **Cómo se invoca cada CLI** (Claude Code vs Codex): el registro declara el CLI del agente; la Herramienta lo usa para armar el comando. Sin paridad para agentes sin mecanismo de invocación no interactiva, documentar la degradación (como hace la Decisión Local-0060 con Codex sin subagentes).
- **Formato de la respuesta** capturada y cómo se le presenta al agente consultante.
- **La lista guarda rutas absolutas de máquina** ⇒ no se commitea; confirmar dónde vive dentro de `.claude/` sin que el control de versiones la arrastre.

## Verificación de punta a punta (08/08/2026)

El ida y vuelta real se probó contra una segunda instalación de esta máquina — el Agente Desplegado de contabilidad personal—, que se registró con una fila temporal y se retiró al terminar, para no arrastrar rutas absolutas al control de versiones. Los cinco resultados:

- **El ida y vuelta funciona.** El consultado respondió su Propósito, sus ocho carpetas de subsistema y su servidor MCP. La respuesta se contrastó contra lo comprobado por separado antes de preguntar —ocho subsistemas y ninguna carpeta `comunicacion/`— y coincidió: leyó su propio disco, no la contestó el agente consultante de memoria.
- **Solo lectura confirmada.** El árbol del repo consultado quedó idéntico (mismo `git status`, mismo commit de punta) antes y después de la consulta.
- **La respuesta vuelve rotulada** como contexto y no como orden, y el rótulo lo escribe el mecanismo, no la habilidad.
- **Degradación por CLI no soportado**, verificada en el mecanismo y no solo en la función pura que ya cubría el banco: informa que no lo sabe invocar en solo lectura y sale con código 1 sin invocar nada.
- **Nombre no registrado**: informa y lista los registrados, código 1.

Queda anotado un matiz que un lector puede leer al revés: el Índice **no** está gitignoreado en este repo, que publica el mecanismo y lo mantiene declarado y sin filas. El gitignoreo lo aplica `amp:inicializar` en el repo consumidor, donde las filas sí son Aprendizaje local. La verificación que corresponde acá es que el archivo vuelva a quedar sin filas.

## Se cruza con

- Plan Local-0060 (Buzones de comunicación entre Agentes) — el corte asíncrono del mismo problema; este plan toma el corte síncrono y lo deja aparte.
- Plan Local-0034 (Identidad del Agente — Título y Propósito persistidos) — precondición de `descubrir-agentes` para leer el Propósito de otro AMP.
- Decisión Local-0060 (los subagentes viajan en `agents/`) — pariente a menor distancia: subagente dentro de la sesión vs Agente Desplegado entero. Mismo corte de fondo: se delega traer, no decidir.
