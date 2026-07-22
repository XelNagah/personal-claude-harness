# Restaurar la portabilidad copiar y pegar del orquestador

**Estado: Nuevo · Creado 26-07-20.** Regresión detectada al preparar la réplica del harness en la PC de la oficina. Origen: [Migración a harness multiagente](../ejecutados/Migracion%20a%20harness%20multiagente%20-%20AGENTS.md%20fuente%20unica.md) (fase 3, commit `cac6921`).

## Contexto (la regresión)

El harness tenía **tres** vías de instalación, no dos:

- **A — marketplace de plugins**: `/plugin marketplace add` + `install`. Requiere git autenticado contra un repo privado.
- **B — clone + junctions**: para autorar el harness en vivo.
- **C — copiar y pegar el prompt**: pegar el texto del orquestador en cualquier agente, en cualquier máquina. Sin instalar nada, sin git, sin red. Era una vía **de diseño**, no un accidente: los prompts se escribieron idempotentes justamente para esto (nivelar un repo desde cero o desde una versión vieja, con el reporte en tres grupos).

La fase 3 retiró `funcionalidades/setup-completo/prompt.md` bajo la consigna "SKILL.md fuente única". Ese `prompt.md` tenía **823 líneas y 0 referencias externas**: era autocontenido. El `SKILL.md` que quedó tiene **80 líneas con 9 punteros a `PLANTILLA.md`** (1160 líneas), que es donde viven los textos literales: las 7 memorias, los contenidos iniciales de índices y el código de los 8 lints.

**Consecuencia concreta:** pegar hoy el `SKILL.md` solo entrega un índice sin contenido. El agente destino lee "instalar el lint `memoria/lint-memoria/lint-memoria.js` (PLANTILLA.md §Script — lint-memoria)" y no tiene de dónde sacar ese código ⇒ o lo inventa (peor: lints divergentes por repo, que es exactamente lo que el textual evita) o falla. La vía C quedó rota sin que nadie lo registrara.

Nada de esto rompió A ni B, y `lint-harness` sigue verde — porque chequea coherencia disco↔marketplace↔REGISTRO y divergencia de textual, no portabilidad de la vía C. Es un caso de uso sin cobertura de lint.

## La tensión de fondo

Es la **misma pregunta que resolvió la fase 3**, aplicada a otro objeto: qué es fuente única y qué es copia derivada. La fase 3 respondió "un solo archivo por flujo, sin duplicados a mano" y eso fue correcto para las 10 funcionalidades. Pero el orquestador tiene un consumidor extra que las funcionalidades no tienen: un humano que copia texto a otra máquina.

Converge con el plan [Estructura del documento de Plan](Estructura%20del%20documento%20de%20Plan.md) solo en el criterio (fuente única vs. derivado), no en el objeto. Conviene decidir con el mismo criterio, no resolverlos por separado y quedar con dos doctrinas.

## Opciones

### 1. Documentar el pegado doble

Dejar todo como está y escribir el procedimiento: pegar `SKILL.md`, después `PLANTILLA.md` con una línea de enganche ("esta es la PLANTILLA que referencia el flujo de arriba").

- **A favor:** cero código, cero copias nuevas, disponible hoy. 1240 líneas entran cómodas en contexto.
- **En contra:** deja un paso implícito en la cabeza del usuario; si alguien pega solo el `SKILL.md` (lo natural, porque es "el prompt"), falla en silencio y el agente improvisa los lints.

### 2. Regenerar `prompt.md` concatenado y versionarlo

Volver a tener un blob autocontenido en el repo, generado a partir de las dos piezas.

- **A favor:** recupera el copiar-y-pegar de un solo archivo, idéntico a como era antes.
- **En contra:** reintroduce una **tercera copia** de los textos literales, que es precisamente lo que la fase 3 eliminó. `lint-harness` pasa a tener que verificar byte a byte que el concatenado no divergió, y aparece la falla clásica: alguien edita `PLANTILLA.md` y se olvida de regenerar.

### 3. Herramienta que concatena a demanda *(recomendada)*

`node .claude/herramientas/armar-prompt-portable/armar-prompt-portable.js [funcionalidad]` → emite el blob autocontenido a stdout (o al portapapeles). Sin componente en el commit.

- **A favor:** imposible que divergja (se genera del original en el momento), no suma nada que sincronizar, `lint-harness` no cambia. Sirve para cualquier funcionalidad, no solo el orquestador.
- **En contra:** requiere tener el repo clonado para generarlo — o sea, la vía C deja de ser 100% independiente de B. Mitigación: se genera **una vez acá** y se pega allá; no hace falta el repo en la máquina destino, solo en la de origen.

## Entregable

- Herramienta nueva registrada en `.claude/herramientas/INDICE.md` (tipo `script`, con su `README.md`).
- Sección en `README.md` que documente las **tres** vías de instalación con sus requisitos (hoy el README describe A y B; C no figura).
- Decidir si esto amerita una decisión estructural (la portabilidad como propiedad del harness) o alcanza con el plan.

## Preguntas abiertas

- ¿La vía C debería quedar cubierta por lint? Un chequeo posible: que ningún `SKILL.md` de funcionalidad referencie su `PLANTILLA.md` sin que exista la vía de concatenación. Evita que la regresión vuelva por otro lado.
- ¿Aplica a las 10 funcionalidades o solo al orquestador? Las individuales tienen el mismo patrón SKILL+PLANTILLA, así que la Herramienta las cubre gratis; la pregunta es si alguna vez se pegan sueltas.
- Al pegar el blob en otro agente, ¿el frontmatter YAML del `SKILL.md` (`name`/`description`) estorba o es inocuo? Verificar en Codex/Cursor.
