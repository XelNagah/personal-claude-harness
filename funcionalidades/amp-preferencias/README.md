# Preferencias

Instala el sistema de preferencias del usuario: separado por origen en **dos archivos**, cada uno declarado en su frontmatter — `preferencias/PREFERENCIAS.md` (`origen: agente-multiproposito`, el nivelado lo reemplaza entero) y `preferencias/PREFERENCIAS-LOCAL.md` (`origen: agente-desplegado`, las del usuario en este repo; el nivelado nunca lo abre) — los **dos importados siempre al contexto** vía `@` desde el archivo de instrucciones. Las preferencias son reglas de conducta: tienen que estar inline, no disponibles-a-pedido (nada dispara "ir a buscar" una regla que se está por violar).

Por qué por-repo y no global de máquina: el user trabaja en varias computadoras y sincroniza por git — el repo es su unidad de sincronización. La duplicación entre repos es deliberada; separar las del Agente Multipropósito en su propia sección las vuelve actualizables sin pisar lo que cada repo agregó.

## Qué agrega al repo destino

```
<repo>/
├── AGENTS.md              # punto de entrada: "Descripción del proyecto" + sección "Preferencias (siempre cargadas)" con el @import + el lint (CLAUDE.md = adaptador @AGENTS.md)
└── .claude/preferencias/
    ├── PREFERENCIAS.md       # Índice del Agente Multipropósito (frontmatter: origen)
    ├── PREFERENCIAS-LOCAL.md  # Índice del Agente Desplegado (declarado, sin entradas)
    └── lint-preferencias/
        └── lint-preferencias.js   # lint estructural (sin LLM, sin red)
```

Si el punto de entrada no existe, crea `AGENTS.md` arrancando con una **Descripción del proyecto** inferida del repo + el adaptador `CLAUDE.md` (`@AGENTS.md`); si hay un `CLAUDE.md` con contenido (esquema viejo), lo migra a `AGENTS.md`. Migra los bloques inline viejos ("Preferencias de comunicación" / "Principios de trabajo"): iguales a una forma conocida del Agente Multipropósito → los reemplaza por el import; editados → las diferencias van al Índice del Agente Desplegado.

- **Lint** — estructural: chequea que haya un Índice declarado por cada origen y que ninguno esté vacío, que las columnas declaradas coincidan con la tabla real, que el manifiesto liste los mismos Índices con el mismo origen, y que el punto de entrada (`AGENTS.md`, o `CLAUDE.md` legacy) traiga **una línea de importación por cada Índice** (para que los dos queden siempre en contexto). Acepta la forma vieja —un solo archivo con las dos secciones adentro, incluso con los nombres `## Base` y `## Adaptaciones`— mientras haya Agentes Desplegados sin nivelar. Mecánico y gratis; **no** detecta contradicciones semánticas (eso es la capa semántica, a pedido).
- **Regla de terminología** (en la sección del Agente Multipropósito) — no acuñar términos del dominio por cuenta propia; preferir las palabras del usuario. **Español corriente en todo** (nada de palabras inventadas o raras, ni en texto plano ni en diagramas — no solo en los registros). **Control duro en registros canónicos** (glosario, decisiones): ningún término acuñado por el agente se asienta sin ratificación. En texto plano/diagramas se puede usar, marcado como propuesto.

## Dependencias

Ninguna.

## Skills operativas

**`registrar-preferencia`** — incorpora una Preferencia nueva o copia puntualmente una existente desde otro Agente Desplegado. Lee todos los Índices, busca equivalencias y contradicciones, muestra el texto exacto, asigna un Código local, mueve la página de detalle si existe y devuelve `agregado` / `ya estaba` / `divergente` / `rechazado`. La skill conserva el juicio semántico y la ratificación; su auxiliar determinista hace la vista previa y la escritura mecánica sin pisar divergencias.

**`adoptar-recomendadas`** — muestra el **catálogo de Preferencias Recomendadas** que viaja con este plugin y adopta las que el usuario elija. Ninguna se instala por instalar el plugin: son sugerencias de quien publica el Agente Multipropósito, y la elección es explícita. Lo adoptado entra en el Índice del Agente Desplegado del destino con Código propio, reutilizando el mismo auxiliar de incorporación; adoptar no crea vínculo con el catálogo ni propaga sus cambios posteriores.

El catálogo es un **archivo derivado**: quien publica el Agente Multipropósito lo regenera desde su propio Índice del Agente Desplegado, para que la misma preferencia no quede escrita en dos lugares que divergen sin control.

## Formatos

| Formato | Archivo |
|---------|---------|
| Skill de alta y copia (Claude Code) | [`skills/registrar-preferencia/SKILL.md`](skills/registrar-preferencia/SKILL.md) |
| Auxiliar de incorporación | [`skills/registrar-preferencia/scripts/incorporar-preferencia.js`](skills/registrar-preferencia/scripts/incorporar-preferencia.js) |
| Skill de adopción del catálogo | [`skills/adoptar-recomendadas/SKILL.md`](skills/adoptar-recomendadas/SKILL.md) |
| Catálogo de Recomendadas | [`skills/adoptar-recomendadas/recomendadas/RECOMENDADAS.md`](skills/adoptar-recomendadas/recomendadas/RECOMENDADAS.md) |
