**Estado: Listo · Creado 26-08-13.**

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

## Lo medido el 20/08/2026

**La declaración ya existe: son los Índices de origen `agente-multiproposito`.** Verificado
comparando `base/` contra `.claude/` en los cinco subsistemas con páginas de detalle:

| Subsistema | Páginas que viajan | Filas del Índice del Agente Multipropósito |
|---|---|---|
| conocimiento | 6 | 6 (Base-0001 a Base-0006) |
| preferencias | 3 | 3 (los enlaces de la columna Detalle) |
| semántica | 0 | no tiene Índice de ese origen |
| decisiones | 0 | no tiene Índice de ese origen |
| subsistemas | 0 | su Índice no lleva páginas de detalle |

Coinciden exactamente. Para `herramientas/` y `common/` la declaración ya está **decidida**: la
Decisión Local-0050 fijó que declarar una Herramienta en el Índice de un origen o del otro es lo que
decide si viaja. Y la Decisión Local-0042 ya fijó que los Índices se localizan por el `origen` de su
frontmatter, no por su nombre.

**No hay ningún Componente Base huérfano hoy.** De los 363 archivos de `.claude/`, 261 no están en
`base/`. De esos, 23 son candidatos por forma (`.js`, `README.md`, `pruebas.js` bajo casas Base) y
los 23 están declarados en el Índice de Herramientas del Agente Desplegado, así que legítimamente no
viajan. El defecto es real pero todavía no dejó nada afuera; lo que hay es el silencio.

**El único hueco de declaración: `output-styles/`.** No es casa de subsistema (no figura en
`SUBSISTEMAS.md`), no es Herramienta (no es maquinaria invocable) y no lo enlaza ningún Índice.
Viaja solo porque alguien lo puso en `base/` a mano. Vive en la raíz de `.claude/` por una
restricción externa: Claude Code lo busca ahí. Es el mismo archivo que el plan Local-0106 mide como
falso positivo en 10 de 10 Agentes Desplegados — **las dos puntas del mismo hueco**.

## Decisiones abiertas

1. **Qué declara que un archivo viaja.** Un campo nuevo en el frontmatter, o derivarlo de lo que ya declara. Cuidado con la simetría: el `origen` de un registro hoy decide el corte, y no todos los archivos que viajan tienen frontmatter (los `.js` de los lints, por ejemplo).
2. **Qué pasa con lo que no declara nada.** ¿Se reporta como indeciso, o el silencio significa que no viaja? La primera opción hace ruido en cada corrida; la segunda reintroduce el mismo silencio con otra forma.
3. **Quién avisa: la Herramienta o `lint-harness`.** `sincronizar-base` corre cuando alguien la corre; el lint corre en cada control de cierre. El aviso sirve más donde ya se mira.

## Lo acordado el 20/08/2026 — asentado en la Decisión Local-0071

**`base/` lleva un índice generado de lo que trae**, con cómo llega cada componente de primer nivel:
`copiado`, `generado` en el destino, o `fragmentos` escritos por merge. Lo genera `sincronizar-base`
al publicar y `lint-harness` lo compara contra `base/` en los dos sentidos. El detalle, las
alternativas descartadas y por qué esto no contradice la Decisión Local-0045 están en la página
[`0071-indice-de-lo-que-trae-la-base.md`](../../decisiones/0071-indice-de-lo-que-trae-la-base.md).

Con eso, las tres decisiones abiertas quedan cerradas:

1. **Qué declara que un archivo viaja** → los Índices por origen, que ya lo declaran hoy (verificado
   arriba), más el índice generado para lo que cuelga de la raíz de `.claude/` y para lo que el
   Agente Multipropósito genera en el destino sin copiarlo.
2. **Qué pasa con lo que no declara nada** → se reporta como candidato, no se copia. Que algo viaje
   sigue siendo una decisión de una persona; lo que cambia es que ahora se entera. **Contra el repo
   de hoy eso da cero líneas**: los 23 candidatos por forma están todos declarados en el Índice de
   Herramientas del Agente Desplegado, así que el arreglo no agrega ruido.
3. **Quién avisa** → los dos, y cada uno lo suyo. `sincronizar-base` reporta el Componente nuevo
   cuando alguien la corre; `lint-harness` verifica que el índice no haya quedado viejo, y ese corre
   en cada control de cierre.

## Qué hay que hacer

1. **Invertir el recorrido de `sincronizar-base`**: listar `.claude/` en vez de `base/`. Un archivo
   bajo una casa Base que ningún Índice de origen `agente-desplegado` enlace y que no esté en `base/`
   sale en una sección nueva de candidatos.
2. **Generar el índice** en `base/` con las tres formas de llegada. Lo `copiado` sale del recorrido;
   `generado` y `fragmentos` son tres renglones escritos en la Herramienta.
3. **Sumar el control a `lint-harness`**: el índice contra `base/`, en los dos sentidos.
4. **Extender el banco de `sincronizar-base`** con el caso que hoy falta: un Componente nuevo en
   `.claude/`, sin tocar `base/` ni ningún índice, aparece en la corrida y falla si se revierte el
   arreglo.
5. **Sumar la forma nueva al conocimiento Local-0013** (*Controles que dejan de controlar sin
   avisar*): «recorre el destino en vez del origen, así que lo que falta no puede aparecer». Sería la
   **forma 13** y necesita nombre, como las otras doce.
6. **Publicar**: `sincronizar-base --aplicar` y subirle la versión al plugin.

**Queda para el momento de ejecutar:** el nombre y el formato del archivo del índice. Toca
nomenclatura, así que pasa por el usuario antes de escribirlo.

## Lo que esto desbloquea

El plan Local-0106 (*Distribuir el inventario de componentes sueltos a los Agentes Desplegados*)
quedó `En pausa` esperando esta respuesta. Con el índice generado, su decisión 1 —de dónde saca la
Herramienta qué es infraestructura— se contesta sola: lo lee del índice, que viaja adentro del
plugin. Se retoma cuando este cierre.

## Criterios de cierre

- Un Componente Base nuevo en `.claude/`, sin tocar `base/` ni ningún índice, aparece en la corrida de `sincronizar-base` y viaja con `--aplicar`.
- El banco de `sincronizar-base` tiene ese caso, y falla si se revierte el arreglo.
- La forma nueva queda sumada al conocimiento Local-0013.

## Cruces

- Plan Local-0086 (*Darle banco a las dos Herramientas que deciden qué viaja y qué está verde*) — **Ejecutado**: creó el banco que hay que extender.
- Plan Local-0090 (*Preparar el AMP público y replicar Componentes de Subsistema*) — su §6 pide volver deterministas los flujos mecánicos y cubrir con pruebas negativas «cada operación que decide que algo viaja». Esta es exactamente una de esas.
