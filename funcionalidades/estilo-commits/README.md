# Estilo de commits

Instala como **memoria de feedback** la preferencia del usuario sobre mensajes de commit y descripciones de PR: **en español** y **sin co-autoría de IA**.

## Qué agrega al repo destino

```
<config>/
└── memoria/
    └── feedback_estilo_commits.md
```

La memoria pisa la instrucción default del harness de agregar un trailer `Co-Authored-By`.

## Dependencias

**`memoria-local`** — es una memoria. Si no está instalada, instalarla primero.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-estilo-commits/SKILL.md`](skills/inicializar-estilo-commits/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-estilo-commits/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
