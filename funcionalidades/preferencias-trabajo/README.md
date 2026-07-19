# Preferencias

Instala el sistema de preferencias del usuario: `preferencias/PREFERENCIAS.md` con dos secciones — **Base** (del harness, versionada: el leveleo la actualiza cuando detecta versión vieja) y **Adaptaciones de este repo** (del user; el leveleo nunca la toca) — **importado siempre al contexto** vía `@` desde el archivo de instrucciones. Las preferencias son reglas de conducta: tienen que estar inline, no disponibles-a-pedido (nada dispara "ir a buscar" una regla que se está por violar).

Por qué por-repo y no global de máquina: el user trabaja en varias computadoras y sincroniza por git — el repo es su unidad de sincronización. La duplicación entre repos es deliberada; el versionado de la Base la vuelve actualizable sin pisar adaptaciones locales.

## Qué agrega al repo destino

```
<config>/
├── CLAUDE.md              # sección "Preferencias (siempre cargadas)" con el @import + el lint + "Descripción del proyecto"
└── preferencias/
    ├── PREFERENCIAS.md    # Base (harness vN) + Adaptaciones de este repo
    └── lint-preferencias/
        └── lint-preferencias.js   # lint estructural (sin LLM, sin red)
```

Si el `CLAUDE.md` no existe, lo crea arrancando con una **Descripción del proyecto** inferida del repo. Migra los bloques inline viejos ("Preferencias de comunicación" / "Principios de trabajo"): iguales a una Base conocida → los reemplaza por el import; editados → las diferencias van a Adaptaciones.

- **Lint** — estructural: chequea que `PREFERENCIAS.md` tenga las secciones `## Base` y `## Adaptaciones` y no esté vacío, y que `CLAUDE.md` lo importe con `@preferencias/PREFERENCIAS.md` (para que quede siempre en contexto). Mecánico y gratis; **no** detecta contradicciones semánticas (eso es la capa semántica, a pedido).
- **Regla de terminología** (en la Base) — no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo** (nada de palabras inventadas o raras, ni en prosa ni en diagramas — no solo en los registros). **Gate duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación. En prosa/diagramas se puede usar, marcado como propuesto.

## Dependencias

Ninguna.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill (Claude Code) | [`skills/inicializar-preferencias-trabajo/SKILL.md`](skills/inicializar-preferencias-trabajo/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-preferencias-trabajo/PLANTILLA.md) |
| Prompt agnóstico | [`prompt.md`](prompt.md) |
