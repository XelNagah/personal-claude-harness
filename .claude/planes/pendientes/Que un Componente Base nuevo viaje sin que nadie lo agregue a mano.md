**Estado: Nuevo · Creado 26-08-13.**

# Que un Componente Base nuevo viaje sin que nadie lo agregue a mano

## El defecto

`sincronizar-base` recorre **el destino, no el origen**. En `sincronizar-base.js:58`:

```js
for (const baseDir of basesDeInstalacion) {
  for (const r of listar(baseDir, '', [])) {     // ← lista base/, la carpeta que viaja
    const desde = path.join(INSTALADO, r);       // y para cada uno busca su par en .claude/
```

Para cada archivo que **ya está** en `base/` va a buscar su par vivo en `.claude/` y lo copia si difiere. Un Componente que existe en `.claude/` y todavía no está en `base/` no aparece en esa lista, así que **nunca viaja, y ninguna corrida lo menciona**.

El control es asimétrico: la dirección inversa sí está cubierta —lo que está en `base/` y no en `.claude/` se reporta en `sinInstalar`—, pero es la que casi nunca pasa.

## Por qué no lo agarró nadie

- **Su propio banco no lo cubre.** La Herramienta tiene `pruebas.js` desde el plan Local-0086 (*Darle banco a las dos Herramientas que deciden qué viaja y qué está verde*), y el banco prueba el corte por frontmatter y la copia, no el descubrimiento.
- **`lint-harness` lo agarró una vez, de rebote.** Encendió *«lo que viaja apunta a algo que no viaja»* porque un Índice que sí viajaba referenciaba al Componente nuevo. Un Componente Base que ningún índice referencie no dispara nada.

Es una forma del conocimiento Local-0013 (*Controles que dejan de controlar sin avisar*) que ese documento todavía no lista: **recorre el destino en vez del origen, así que lo que falta no puede aparecer**. Sumarla al cerrar este plan, con el arreglo verificado.

## El fondo: no hay declaración de qué debe viajar

Hoy la respuesta a *«¿este archivo viaja?»* es circular: **viaja lo que ya está en `base/`**. Alguien lo puso ahí a mano la primera vez, y desde entonces la Herramienta lo mantiene al día. Por eso el arreglo no es cambiar un `listar()` de argumento: hay que decidir qué declara que un archivo de `.claude/` es Componente Base.

El candidato natural es el **frontmatter**, que ya declara *cómo* se copia cada archivo —el mecanismo entero, un registro `origen: agente-desplegado` solo hasta el separador de su tabla— pero no *si* se copia.

## Decisiones abiertas

1. **Qué declara que un archivo viaja.** Un campo nuevo en el frontmatter, o derivarlo de lo que ya declara. Cuidado con la simetría: el `origen` de un registro hoy decide el corte, y no todos los archivos que viajan tienen frontmatter (los `.js` de los lints, por ejemplo).
2. **Qué pasa con lo que no declara nada.** ¿Se reporta como indeciso, o el silencio significa que no viaja? La primera opción hace ruido en cada corrida; la segunda reintroduce el mismo silencio con otra forma.
3. **Quién avisa: la Herramienta o `lint-harness`.** `sincronizar-base` corre cuando alguien la corre; el lint corre en cada control de cierre. El aviso sirve más donde ya se mira.

## Criterios de cierre

- Un Componente Base nuevo en `.claude/`, sin tocar `base/` ni ningún índice, aparece en la corrida de `sincronizar-base` y viaja con `--aplicar`.
- El banco de `sincronizar-base` tiene ese caso, y falla si se revierte el arreglo.
- La forma nueva queda sumada al conocimiento Local-0013.

## Cruces

- Plan Local-0086 (*Darle banco a las dos Herramientas que deciden qué viaja y qué está verde*) — **Ejecutado**: creó el banco que hay que extender.
- Plan Local-0090 (*Preparar el AMP público y replicar Componentes de Subsistema*) — su §6 pide volver deterministas los flujos mecánicos y cubrir con pruebas negativas «cada operación que decide que algo viaja». Esta es exactamente una de esas.
