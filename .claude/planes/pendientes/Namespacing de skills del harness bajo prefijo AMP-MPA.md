# Namespacing de skills del harness bajo prefijo AMP/MPA

**Estado:** Nuevo — para analizar con `planificar` más adelante. Se abre desde la sesión de la pantalla de bienvenida (26-07-20), como segundo eje que el usuario pidió stashear antes de arrancar el primero.

## Idea cruda del usuario

Al converger el nombre del repo hacia **Agente Multipropósito (AMP)** / **Multi Purpose Agent (MPA)**, separar las skills del harness del resto de skills personalizadas, agrupándolas bajo un prefijo. Ejemplos que dio: en vez de `/inicializar-custom`, algo como `/mpa/inicializar-custom`; en vez de `incorporar-memoria` suelto, `/mpa/memoria/incorporar-memoria`.

Dos ejes entremezclados:

1. **Convergencia de nombre del repo** hacia AMP/MPA (marca/título). Toca también la pantalla de bienvenida (#1 de esa sesión): el título del splash mostraría ese nombre. Choca con el glosario: hoy el término canónico es **Multipropósito** (una palabra); el usuario propone **Multi Propósito** (dos) + sigla. Candidato a decisión de terminología (0004 pide ratificación) y a alias en el glosario.
2. **Namespacing / agrupación de las skills** bajo ese prefijo.

## A analizar (no resolver ahora)

- **¿Existe el namespacing `/mpa/sub/skill` como mecanismo real?** Las skills de Claude Code se invocan por `name` (`/<name>`) o vía tool Skill; no hay jerarquía de barras nativa conocida. Lo que SÍ namespacea hoy es el **prefijo de plugin del marketplace** (`caveman:caveman`, `mattpocock-skills:diagnose`). La agrupación pedida probablemente se materializa por prefijo de plugin/marketplace, no por rutas con barra. Verificar qué soporta el CLI antes de diseñar.
- **Colisión con junctions dobles:** hoy las skills viven enlazadas en `~/.claude/skills/<skill>` y `~/.agents/skills/<skill>` (nombres planos). Un prefijo cambia esos nombres → toca `instalar-junctions`, el marketplace y potencialmente la migración de consumidores.
- **Codex/Cursor/Gemini no tienen marketplace** (clone + junctions): ¿cómo se namespacea ahí? Paridad Claude↔Codex (dec. 0010).
- **Alcance:** ¿todas las skills del harness bajo el prefijo, o solo las de setup? ¿Las Skills de Subsistema vs la del Agente Multipropósito (`planificar`) reciben el mismo trato?
- Relación con `Restaurar la portabilidad copiar y pegar del orquestador` y con la nomenclatura de subsistemas (`Revisar la nomenclatura de los subsistemas`).

## Notas

- Depende de decidir el nombre AMP/MPA primero (eje 1) — el prefijo sale de ahí.
- No bloquea la pantalla de bienvenida; sí comparte el eje de nombre.
