---
name: registrar-conocimiento
description: Asienta una página en .claude/conocimiento/ — separa lo que el agente SABE del dominio de la memoria de trabajo, de las fuentes crudas y de la documentación del proyecto; evita duplicar, indexa en INDICE.md y corre el lint. Use when se averigua algo del dominio que costó descubrir y que va a hacer falta de nuevo (cómo funciona un sistema externo, un formato, una restricción real), o al cerrar una tarea que dejó un hallazgo reutilizable.
---

# Registrar conocimiento

Asienta en `.claude/conocimiento/` algo que el agente **aprendió** y que la próxima sesión va a necesitar. El riesgo que esta skill elimina es el más caro de todos: **re-descubrir de cero lo que ya se averiguó una vez**, porque el hallazgo se dijo en una conversación y murió con ella.

Es la contraparte unitaria de `buscar-conocimiento`: esa hace el barrido a demanda de todo lo disperso; esta asienta **una cosa, en el momento en que se aprendió**.

## Flujo

### 1. Decidir si es conocimiento — el paso que más se falla

Antes de escribir nada, ubicar el hallazgo. Cinco destinos, y solo uno es este subsistema:

| Es… | Va a | Cómo se reconoce |
|---|---|---|
| Lo que el agente **sabe** del dominio | **`conocimiento/`** ✅ | Cómo funciona algo, un formato, una restricción real, un procedimiento externo |
| Cómo hay que **trabajar** en este repo | `memoria/` | Corrección del usuario, preferencia, estado de un proyecto en curso |
| Una elección que **condiciona el futuro** | `decisiones/` | Se toma una vez, se respeta después, tenía alternativas |
| Qué significa una **palabra** | `glosario/` | Es un sustantivo del dominio, no un procedimiento |
| Lo que el agente **lee**, no lo que sabe | se queda donde está | Fuentes crudas: documentos, datos, escaneos, exports |

**La prueba que discrimina:** *¿esto seguiría siendo cierto si este repo no existiera?*

- **Sí → conocimiento.** *"PowerShell 5.1 lee un `.ps1` sin BOM como ANSI y rompe los acentos al parsear."* Es verdad del mundo; sirve en cualquier repo que toque PowerShell.
- **No → memoria o decisiones.** *"Los commits de este repo van en español, sin co-autoría."* Solo tiene sentido acá.

Segunda prueba, para el caso dudoso: *¿lo sabría un experto del dominio sin haber visto nunca este proyecto?* Si sí, es conocimiento.

⚠️ **La documentación del proyecto no es conocimiento del agente.** `README.md`, `REGISTRO.md`, los ADRs de un repo de software: son texto para humanos sobre el proyecto, se quedan donde están. Enterrarlos bajo `conocimiento/` es el error clásico en la dirección opuesta.

Si el hallazgo no es conocimiento, **decirlo y derivar** a la skill que corresponde (`registrar-memoria`, `registrar-decision`) en vez de forzarlo acá.

### 2. Buscar si ya está asentado — por tema, no por nombre

Leer `.claude/conocimiento/INDICE.md` y abrir las páginas candidatas. Tres salidas:

- **Ya cubierto igual** → no tocar; reportar `ya estaba`.
- **Cubierto pero incompleto, o contradice lo nuevo** → **actualizar esa página**, no crear otra. Si contradice, resolver la contradicción explícitamente en el texto (qué era, qué es, desde cuándo) en vez de dejar las dos versiones conviviendo.
- **No cubierto** → crear.

### 3. Ubicar la página

- Pocas páginas → una por tema en la raíz: `.claude/conocimiento/<tema>.md`.
- Un tema que ya juntó varias → subcarpeta con su **propio `INDICE.md`**; entonces el índice raíz lista **la carpeta**, no cada página de adentro (decisión 0011).

Nombre en kebab-case, estable, sin fecha.

### 4. Escribir

Markdown corriente, sin frontmatter (a diferencia de las memorias). Lo que no puede faltar:

```markdown
# <Título: el concepto, no "notas sobre X">

<Qué es / cómo funciona, directo. Lo que la próxima sesión necesita saber.>

**Cómo se verificó:** <de dónde salió — comando corrido, doc leída, prueba hecha>. Si no se verificó y es
interpretación propia, decirlo acá.

**Cuándo aplica / cuándo no:** <los límites; el caso borde que hizo falta descubrir>.
```

Reglas duras:

- **Cero invención.** Lo que no salga de una fuente verificada se marca como faltante o como interpretación propia. Una página de conocimiento que afirma algo falso es peor que no tenerla: se consulta con confianza.
- **Fechas absolutas**, nunca "hoy" ni "la semana pasada".
- **Terminología del glosario** si el repo tiene. No acuñar términos acá.

### 5. Indexar

Una línea en el `INDICE.md` que corresponda: `- [Título](archivo.md) — <gancho de una línea>`. Solo el puntero; el índice nunca lleva contenido. Si se actualizó una página existente, revisar que su línea siga siendo fiel.

### 6. Cerrar con el lint

Desde la raíz del repo:

```bash
node .claude/conocimiento/lint-conocimiento/lint-conocimiento.js
```

Chequea refs rotas, índice incompleto y huérfanos. Resolver los hallazgos antes de dar por cerrado.

### 7. Reportar

Página creada o actualizada (cuál y por qué), dónde quedó, y el resultado del lint. Si el hallazgo se derivó a otro subsistema en el paso 1, decir a cuál y por qué.

## Reconciliación (idempotencia)

Re-correr esta skill sobre el mismo hallazgo es seguro: el paso 2 detecta lo ya asentado y reporta `ya estaba` en vez de duplicar. Sobre un repo a medio poblar sirve para ir sumando de a una; para el barrido completo de lo disperso, usar `buscar-conocimiento`.
