# Preferencias

Instala el sistema de preferencias del usuario: `preferencias/PREFERENCIAS.md` separado por origen en dos secciones — **Preferencias del Agente Multipropósito** (vienen río arriba; el nivelado reemplaza esa sección entera) y **Preferencias del Agente Desplegado** (las del usuario en este repo; el nivelado nunca las toca) — **importado siempre al contexto** vía `@` desde el archivo de instrucciones. Las preferencias son reglas de conducta: tienen que estar inline, no disponibles-a-pedido (nada dispara "ir a buscar" una regla que se está por violar).

Por qué por-repo y no global de máquina: el user trabaja en varias computadoras y sincroniza por git — el repo es su unidad de sincronización. La duplicación entre repos es deliberada; separar las de río arriba en su propia sección las vuelve actualizables sin pisar lo que cada repo agregó.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md              # punto de entrada: "Descripción del proyecto" + sección "Preferencias (siempre cargadas)" con el @import + el lint (CLAUDE.md = adaptador @AGENTS.md)
└── .claude/preferencias/
    ├── PREFERENCIAS.md    # secciones del Agente Multipropósito + del Agente Desplegado
    └── lint-preferencias/
        └── lint-preferencias.js   # lint estructural (sin LLM, sin red)
```

Si el punto de entrada no existe, crea `AGENTS.md` arrancando con una **Descripción del proyecto** inferida del repo + el adaptador `CLAUDE.md` (`@AGENTS.md`); si hay un `CLAUDE.md` con contenido (esquema viejo), lo migra a `AGENTS.md`. Migra los bloques inline viejos ("Preferencias de comunicación" / "Principios de trabajo"): iguales a una forma conocida de río arriba → los reemplaza por el import; editados → las diferencias van a la sección del Agente Desplegado.

- **Lint** — estructural: chequea que `PREFERENCIAS.md` tenga las secciones `## Preferencias del Agente Multipropósito` y `## Preferencias del Agente Desplegado` (acepta también los nombres viejos, `## Base` y `## Adaptaciones`, mientras haya Agentes Desplegados sin nivelar) y no esté vacío, y que el punto de entrada (`AGENTS.md`, o `CLAUDE.md` legacy) lo importe (para que quede siempre en contexto). Mecánico y gratis; **no** detecta contradicciones semánticas (eso es la capa semántica, a pedido).
- **Regla de terminología** (en la sección de río arriba) — no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo** (nada de palabras inventadas o raras, ni en texto plano ni en diagramas — no solo en los registros). **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación. En texto plano/diagramas se puede usar, marcado como propuesto.

## Dependencias

Ninguna.

## Skill operativa

**`registrar-preferencia`** — de uso, no de instalación: detecta feedback recurrente del usuario (misma corrección por segunda vez) y propone registrarlo como regla en la sección del Agente Desplegado — o llevarla río arriba, a las preferencias del Agente Multipropósito, si vale para todos los repos. Chequea primero si una regla existente ya lo cubre (problema de cumplimiento ≠ falta de regla). Viaja en este plugin junto a la de instalación.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill de instalación (Claude Code) | [`skills/inicializar-preferencias-trabajo/SKILL.md`](skills/inicializar-preferencias-trabajo/SKILL.md) + [`PLANTILLA.md`](skills/inicializar-preferencias-trabajo/PLANTILLA.md) |
| Skill operativa (Claude Code) | [`skills/registrar-preferencia/SKILL.md`](skills/registrar-preferencia/SKILL.md) |
