---
indice: Agentes Multipropósito Conocidos
origen: agente-desplegado
columnas: [Código, Nombre, Propósito, Directorio, CLI]
descripcion: cada otra instalación del Agente Multipropósito que se registró para consultarla
---

# Agentes Multipropósito Conocidos

Cada fila es un **Agente Multipropósito Conocido**: otra instalación del Agente Multipropósito, corriendo en otra carpeta de esta máquina, que se registró para pedirle algo en el momento con las habilidades `preguntar` o `resolver`.

> **Este Índice guarda rutas absolutas de máquina, así que no se commitea.** En un Agente Desplegado, `amp:inicializar` lo deja gitignoreado; sus filas son Aprendizaje local de esa máquina. Este repo, que publica el mecanismo, lo mantiene **sin filas**: no se le agregan entradas propias que arrastren rutas al control de versiones.

- **Código** — `Local-NNNN`. Se asigna al crear la entrada y no se reusa.
- **Nombre** — cómo se lo nombra al consultarlo. Único en el Índice.
- **Propósito** — el Propósito de esa instalación, en una línea: para saber qué tiene sentido preguntarle.
- **Directorio** — la ruta absoluta de su carpeta (la que contiene su `.claude/`).
- **CLI** — con qué CLI se lo invoca: `claude` (Claude Code) o `codex` (Codex CLI). Decide cómo se arma el comando de consulta.

| Código | Nombre | Propósito | Directorio | CLI |
|--------|--------|-----------|------------|-----|
