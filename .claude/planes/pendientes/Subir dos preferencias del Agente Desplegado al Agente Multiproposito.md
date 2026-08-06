# Subir dos preferencias del Agente Desplegado al Agente Multipropósito

**Estado: Nuevo · Creado 26-07-29.** Origen: al pasar `preferencias` a tabla (plan `Partir los indices por origen y pasar preferencias a tabla`), dos entradas del Agente Desplegado llevaban adentro de su texto la nota *"(Candidato a subir a las preferencias del Agente Multipropósito y propagarse)"*. Esa nota no es norma —no cambia cómo se obedece la preferencia— ni es elaboración, así que no tenía lugar en la tabla nueva. Se sacó de las celdas y se abrió este plan, por coherencia con lo ya decidido al descartar una columna `Estado`: *lo pendiente en este repo es un plan*.

## Las dos candidatas

- **`Local-0004` — No contar como costo lo que ya está comprometido en todas las opciones.** *"Al comparar alternativas, no contar como costo de una opción algo que ya está comprometido en todas. Si el trabajo se va a hacer igual por otro motivo, es precio ya pagado: sumarlo a una sola opción la hace ver artificialmente cara y empuja la decisión hacia el lado equivocado."* Razón para subirla: es un criterio universal de comparación, no específico del Propósito de este repo.
- **`Local-0005` — Enumerar tres o más elementos en lista de bullets.** *"Al enumerar tres o más elementos en una respuesta, presentarlos en lista de bullets, no en una sola línea de texto corrido — es más fácil de escanear que un párrafo donde todo pesa igual."* Razón para subirla: es estilo universal, no específico de este repo.

## Qué implica subir una preferencia

No es mover una fila de un archivo al otro. Cambiar de origen la saca del Aprendizaje y la mete en lo que el actualizador reemplaza entero, así que viaja a cada Agente Desplegado:

1. La entrada sale de `PREFERENCIAS-LOCAL.md` y entra en `PREFERENCIAS.md` con un código nuevo (`Base-0014`, `Base-0015`): el prefijo es el origen, así que promover cambia el código y la referencia vieja muere. Está previsto en la Decisión Local-0043 (núcleo del Índice de Subsistema).
2. El texto pasa a `PLANTILLA.md`, la copia que `amp:inicializar` escribe en cada repo, y hay que verificarlo con `lint-harness`.
3. Sube la versión del plugin `amp-preferencias`, y cada Agente Desplegado la recibe recién al actualizar.

## Falta decidir

- **Si las dos suben, o solo una.** Se ratificó que son candidatas, no que suban.
- **Si hace falta un mecanismo general.** Este caso va a repetirse: un Agente Desplegado descubre una preferencia que sirve para todos. Hoy no hay flujo — la habilidad `registrar-preferencia` decide el origen al dar de alta, pero no contempla mover una que ya existe.
