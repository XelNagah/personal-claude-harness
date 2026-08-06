# Conducta

El subsistema `conducta` asegura comportamientos del tipo **"cuando hagas X, asegurate de Y"**: ata **momentos** del flujo a **acciones**. Vive en `.claude/conducta/`:

- `INDICE.md` e `INDICE-LOCAL.md` — el **registro de reglas**: cada fila ata un momento a una acción (`Código | Nombre | Descripción | Momento | Clase | Contenido | Estado | Detalle`). Separado por origen en **dos archivos**, cada uno con su frontmatter: `INDICE.md` (`origen: agente-multiproposito`, el actualizador lo reemplaza entero) e `INDICE-LOCAL.md` (`origen: agente-desplegado`, lo suma cada repo; el actualizador no lo abre). El repartidor lee los dos.
- `MOMENTOS.md` — el **vocabulario de momentos**: un momento es un **evento de hook + una condición que la máquina evalúa sin juicio** (`cada turno` = `UserPromptSubmit`; `al escribir` = `PreToolUse` sobre un `.md` de **cualquier parte del repo** salvo `tmp/`; `al cerrar tarea` = `Stop`, aún sin repartidor).
- `CLASES.md` — el **vocabulario de clases**: qué hace el repartidor con la regla. `Inyectar` (el agente lee un texto y actúa con su juicio) · `Ejecutar` (una Herramienta lo resuelve sin juicio) · `Bloquear` (se frena la acción; solo donde Y es sin juicio y el falso positivo es imposible). El lint lo lee para validar la columna `Clase`. **No es configurable**: agregar una fila no hace que el repartidor la soporte.
- `establecer-conducta/` — el **hook repartidor**: un mismo script sirve a varios eventos; resuelve qué momento realiza el evento que lo disparó, lee el registro **vivo** y despacha las reglas `vigente` de ese momento según su clase, **combinando** el texto de las `Inyectar` con lo que midan las `Bloquear`. Agregar o cambiar una regla **no toca el hook**.
- `lint-conducta/` — valida que toda regla apunte a un momento existente, con clase/estado válidos, y que ninguna regla `vigente` cuelgue de un momento sin repartidor.

**Por qué:** una regla cargada al arranque **se recita, no se obedece** (conocimiento `modos-de-falla-ante-reglas-escritas`). El aporte de conducta es entregar la regla **en el momento** en que hace falta, no al inicio de la sesión — por eso el registro **NO se carga siempre** y el agente **no lo consulta a mano**: lo entrega el hook cerca del punto de acción.

**Gobernanza:** se edita al **agregar, modificar o dar de baja una regla**. Toda regla nueva que toque terminología o decisiones pasa por el usuario (el agente propone; ratificar es potestad del usuario).

**Cómo se aplica:**

1. **En el flujo normal, no consultar `INDICE.md` a mano** — el hook entrega la regla que corresponde a cada momento.
2. **Para agregar una regla:** elegir un momento existente de `MOMENTOS.md` (o declarar uno nuevo, en `declarado` hasta que tenga repartidor), sumar la fila al archivo que corresponda (`INDICE.md` si viene con el Agente Multipropósito, `INDICE-LOCAL.md` si es de este repo), y correr el lint. Una regla `vigente` no puede colgar de un momento sin repartidor: va en `pendiente`.
3. **Al cerrar** una tarea que tocó conducta, correr el lint: `node .claude/conducta/lint-conducta/lint-conducta.js`.

**El Buzón de Avisos Generales.** Un trabajo que corre **en segundo plano** —hoy, el chequeo de plugins que la Pantalla de bienvenida lanza al arrancar sin esperarlo— deja lo que averiguó en `.claude/tmp/avisos/<origen>.txt`, y el hook repartidor lo entrega en el momento `cada turno` y lo borra: un aviso se da una vez, y se rehace en el arranque siguiente mientras la condición persista. Existe porque un dato que tarda más que el arranque no se puede dar al arrancar, y el repartidor es lo único que ya corre en cada turno, así que leer un archivo no le cuesta arrancar un proceso. **No sabe de qué trata el aviso**: escribe ahí cualquier trabajo en segundo plano. Va por los dos canales —`systemMessage` para el usuario, que es quien decide, y `additionalContext` para el modelo, que tiene que poder responder si le preguntan— y **sin pisar** las reglas del momento.

**Las tres clases conviven** en un mismo momento y salen en una sola respuesta, cada una por su campo (ver `CLASES.md`). Lo único que gana solo es un `deny`.

Relacionado: [[flujo-planes]] (construcción del subsistema por plan), [[semantica]] (el control de terminología consume los momentos `cada turno` y `al escribir`).
