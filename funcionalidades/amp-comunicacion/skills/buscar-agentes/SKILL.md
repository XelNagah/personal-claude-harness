---
name: buscar-agentes
description: Encuentra las instalaciones del Agente Multipropósito que hay en esta máquina y ofrece registrar las que faltan, para poder preguntarles algo después. No barre el disco: lee dónde corrieron los CLI. Use when el usuario dice "qué otros agentes hay en la máquina", "buscá instalaciones del harness", "a quién le puedo preguntar", o al querer consultar a otro repo y encontrar el Índice de Agentes Multipropósito Conocidos vacío.
---

# Buscar Agentes Multipropósito Conocidos en la máquina

Encuentra las otras instalaciones del Agente Multipropósito de esta máquina y le ofrece al usuario registrar las que todavía no están en `.claude/comunicacion/INDICE.md`. Registrarlas es lo que habilita `preguntar` y `resolver`.

## Flujo

1. **Correr el buscador** desde la raíz del repo:

   ```bash
   node .claude/comunicacion/buscar/buscar.js
   ```

   Tarda milisegundos y no cuesta nada: **no barre el disco**, lee dónde corrieron los CLI (`~/.claude.json` y el rastro de sesiones de Codex). Con `--json` devuelve el resultado crudo si hace falta procesarlo.
2. **Presentar lo que encontró.** Decir cuántas instalaciones hay en total y cuántas de esas ya están registradas o son este mismo repo — el número completo, no solo las nuevas. De cada una sin registrar, mostrar **Título, Propósito, directorio y CLI**: con eso el usuario decide si le sirve tenerla a mano.

   Una instalación que **no declara su Identidad** se muestra igual, marcada: para registrarla hay que ponerle Nombre y Propósito a mano.
3. **Preguntar cuáles registrar.** Nunca registrar todo lo encontrado por si acaso: el Índice es para las instalaciones a las que este repo tiene algo que preguntarle, no un inventario de la máquina. Si no hay ninguna sin registrar, decirlo y terminar.
4. **Registrar las elegidas** con `registrar-agente`, una por una. El Nombre lo elige el usuario —es con lo que va a nombrarla al consultarla—; el resto de los datos ya vienen del buscador. Si una aparece con dos CLI, preguntar con cuál invocarla.
5. **Reportar** cuántas se registraron, con qué Nombre y qué Código quedó cada una, y el resultado del lint que corre `registrar-agente`.

## Lo que encuentra y lo que no

Cuenta como instalación el directorio que tiene `.claude/subsistemas/SUBSISTEMAS.md` — el catálogo de subsistemas, que existe en todo repo inicializado y en ninguno que no lo esté. **Un repo con `.claude/` y nada del harness adentro no cuenta**: esa carpeta la tiene cualquier repo que haya visto Claude Code una vez.

Solo se ven las instalaciones **donde algún CLI corrió alguna vez**. Una recién clonada, o abierta únicamente con otra herramienta, no aparece: esa se registra a mano con `registrar-agente`. Que no aparezca no significa que no exista, y conviene decírselo al usuario si buscaba una en particular.

## Reconciliación

Es de solo lectura: no escribe nada por su cuenta —lo escribe `registrar-agente`, con su propia confirmación—. Re-correrla es seguro y barato; lo ya registrado vuelve a salir **marcado como tal**, así que repetir la búsqueda nunca duplica una fila. Si el usuario ya dijo que no quiere registrar una instalación, no volver a ofrecérsela en la misma sesión.
