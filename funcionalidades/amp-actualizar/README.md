# amp-actualizar — nivelador del harness

Una sola skill que **pone al día** el `.claude/` de un repo que ya tiene el AMP instalado, contra la plantilla nueva del harness. Junta la idempotencia que hoy está repartida en las secciones "Reconciliación" de cada `inicializar-<sub>` y suma lo que ningún inicializador hace solo: el **respaldo**, los **renombres legacy** (`glosario`→`semantica`) y el **corte Base/aprendido** (decisión 0027). Diseño en la decisión 0028.

**A diferencia de las demás funcionalidades, esta no instala una estructura propia en el repo destino** — es **operacional**: se invoca (`/amp-actualizar` o "nivelá el AMP") y opera sobre el `.claude/` que ya existe. Por eso **no entra al orquestador** `setup-completo` y **no lleva lint** (no persiste estado propio). Es la contraparte de `inicializar-custom`: uno arranca un repo de cero, el otro pone al día uno vivo.

## El problema que resuelve

El usuario tiene ~18 AMP desplegados corriendo sus propósitos. Una mejora del harness que vive en las **skills** se propaga con `/plugin update`; pero una mejora que vive en los **datos** de cada repo (`.claude/conducta/`, `.claude/semantica/`, el enganche del hook en `settings.json`) **no** — hace falta reescribir el disco del consumidor. Ese es el trabajo de `amp-actualizar`: actualizar los datos sin romper lo que el repo aprendió.

## Cómo decide qué pisar (decisión 0027)

El problema de "qué puede pisar sin borrar lo aprendido" se **disuelve** con la separación por origen:

- **Base** (mecanismo del harness: lint, `MANIFIESTO`, estructura, `MOMENTOS`, secciones `## Reglas Base`, cableado del hook) → **pisa, respaldando antes**. El respaldo es clave: `.claude/` suele estar gitignoreado en el host, sin red de git para volver atrás.
- **Aprendido** (contenido del repo: términos del glosario, memorias, planes, decisiones, conocimiento, `## Reglas del Propósito`) → **nunca se toca**.
- **Reacomodo legacy** (formas viejas anteriores a la separación, que puedan enredar contenido aprendido) → **pregunta antes** (bloqueante).

## Dos modos, un comando (decisión 0028)

- Repo **viejo** → migra (instala lo que falta, aplica renombres) y después reconcilia.
- Repo **al día** → solo reconcilia (todo "ya estaba").
- **Sin estado:** no guarda número de versión (los repos viejos no lo tienen); compara la estructura actual contra la plantilla objetivo y converge. Idempotente.
- **Vista previa** (`--vista-previa`): muestra el plan sin tocar nada ni respaldar.

## Forma

- **Skill `amp-actualizar`** — la orquestación con juicio: confirma el plan, delega la instalación de cada subsistema a su `inicializar-<sub>` (que trae la plantilla), migra los términos y la prosa con criterio, y pregunta ante lo divergente.
- **Script `amp-actualizar.js`** — lo mecánico y determinista (decisión 0009): barrido y clasificación de la estructura, respaldo, y el reporte / vista previa.

## Dependencias

Ninguna dura. En uso delega en los `inicializar-<sub>` de los subsistemas que haya que instalar o poner al día (sobre todo `inicializar-conducta` e `inicializar-semantica`).

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/amp-actualizar/SKILL.md`](skills/amp-actualizar/SKILL.md) |
| Script auxiliar | [`skills/amp-actualizar/amp-actualizar.js`](skills/amp-actualizar/amp-actualizar.js) |
