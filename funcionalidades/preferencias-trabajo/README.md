# Preferencias de trabajo

Escribe en el archivo de instrucciones del proyecto las **preferencias de comunicación** y los **principios de trabajo** del usuario. Son secciones de instrucciones (no memorias), por eso esta funcionalidad no depende de `memoria-local`.

## Qué agrega al repo destino

En `<config>/CLAUDE.md` (o el archivo de instrucciones del harness):

- **Preferencias de comunicación** — al analizar alternativas, siempre ejemplos concretos encadenando consecuencias ("A ⇒ B; si no fuera B ⇒ no A porque X").
- **Principios de trabajo** — conceptual antes que implementación; ante ambigüedad preguntar; iterar de alto a bajo nivel; nomenclatura en español para el dominio; cero invención de datos.

Si el `CLAUDE.md` no existe, lo crea arrancando con una **Descripción del proyecto** inferida del repo.

## Dependencias

Ninguna.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-preferencias-trabajo/SKILL.md`](skills/inicializar-preferencias-trabajo/SKILL.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
