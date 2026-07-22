# Afinar el concepto de Subsistema frente a Funcionalidad y plugin

**Estado: Nuevo · Creado 26-07-21.** Surge de una observación del autor: *"todo vive dentro de la carpeta `funcionalidades/`. ¿Por qué no son los subsistemas? Hay que afinar terminología en el glosario."*

## El problema

El glosario define **Subsistema** ("área del harness que persiste estado siguiendo el patrón índice + entradas + lint") pero **no define Funcionalidad**, y en el disco de este repo **todo se autora bajo `funcionalidades/`** (10 carpetas = 10 plugins). Desde afuera, "subsistema" y "funcionalidad" se leen como sinónimos que se pisan — y no lo son:

- **Funcionalidad = plugin**: la unidad de **distribución/autoría** (`funcionalidades/<nombre>/` con `plugin.json` + `SKILL.md`; catalogada en `marketplace.json`). Vive solo en **este** repo (el que autora el harness).
- **Subsistema = casa de datos en runtime**: `.claude/<sub>/` (índice + entradas + lint) en un repo **consumidor**. Es lo que la funcionalidad **instala**.

La confusión de fondo: son **dos planos distintos** (autoría vs consumo). En un repo consumidor no hay `funcionalidades/` — hay `.claude/memoria/`, `.claude/glosario/`, etc. La carpeta `funcionalidades/` refleja la vista de **distribución**, no la de runtime; por eso su nombre no coincide con "subsistemas".

Y no hay correspondencia 1:1: de las 10 funcionalidades, **8 instalan un subsistema** (memoria, planes, glosario, decisiones, conocimiento, glosario, herramientas, preferencias) y **2 no** (`setup-completo` = orquestador, `planificar` = skill operacional sin subsistema dueño). Así que Funcionalidad ⊋ Subsistema.

## Qué resolver (a diseñar con `planificar`)

1. **¿Entra `Funcionalidad` al glosario** como concepto propio, con `plugin` como alias registrado? Hoy `plugin` circula sin entrada.
2. **Relación Subsistema ↔ Funcionalidad ↔ plugin**: dejar asentado que una funcionalidad *instala* un subsistema; que el subsistema es el objeto de runtime y la funcionalidad el de distribución; que no todas las funcionalidades son subsistemas.
3. **¿El nombre de la carpeta `funcionalidades/` comunica?** ¿O refuerza la confusión? (Renombrarla es ruptura — evaluar costo/beneficio, no asumir.)
4. **Afinar la definición de Subsistema** en el glosario para que el corte con Funcionalidad quede explícito (hoy la definición no menciona que se *distribuye* como funcionalidad).

## Relación con otros planes

- **Cruza con [Revisar la nomenclatura de los subsistemas](Revisar%20la%20nomenclatura%20de%20los%20subsistemas.md)** (Nuevo): eso ataca los nombres internos opacos del patrón (`Base`, `Entrada`, `Patrón`); esto ataca el par Subsistema/Funcionalidad. Misma familia (vocabulario de subsistemas), ejes distintos — **diseñar coordinados**, quizás en la misma sesión.
- Toca `decisiones` 0001 (qué es el repo), 0002 (patrón de subsistema), 0009 (taxonomía de skills, que ya distingue Skill de Subsistema vs Skill del AMP).

## Correr por

`planificar` — es diseño estructural + terminología canónica (gobernada por 0004/0018): toda entrada nueva al glosario pasa por ratificación del usuario.
