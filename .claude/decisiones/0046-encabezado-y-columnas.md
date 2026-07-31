# 0046 — Un encabezado solo se pisa si su tabla declara las columnas de la Base

## Qué se decidió

El nivelador pisa el encabezado de un registro `origen: agente-desplegado` **solo cuando su tabla declara exactamente las columnas de la Base**. Si aparece una columna que la Base no trae, frena y lo decide el usuario. Y si esa columna es lo único que difiere, no genera hallazgo. Refina 0045, respeta 0042. Ratificado el 31/07/2026.

## Por qué

La 0045 fijó que esos registros se pisan **hasta el separador de su tabla**, y el separador es el que declara cuántas columnas tiene. Pisarlo cuando el repo tiene una columna de más le deja todas sus filas bajo una cabecera que ya no las describe —el registro queda corrupto, sus lectores validan sobre una columna que desapareció, y el reporte lo había clasificado como un cambio de convención cualquiera.

**La columna de más es legítima.** La 0042 le permite al Índice del Agente Desplegado declarar las columnas de la Base «y sumar las suyas». No es una anomalía a corregir: es un derecho asentado.

## Por qué no se fusiona automáticamente

La salida cómoda sería pegar la columna sobrante al final del encabezado nuevo. No sirve, porque **las dos historias posibles dejan exactamente la misma evidencia**:

| Lo que pasó | Lo que el detector ve |
|---|---|
| El repo sumó una columna `Sinónimos` | Hay un nombre de columna que la Base no trae |
| La Base renombró `Alias` a otra cosa, y el repo conserva el nombre viejo | Hay un nombre de columna que la Base no trae |

Bajo la segunda, la fusión pegaría al final una columna que en realidad es la vieja, y el registro quedaría con las dos. El detector no puede distinguirlas; quien conoce la historia del repo, sí. Por eso el hallazgo es **divergente** —bloqueante— y su texto no afirma cuál de las dos es.

El único rastro de la segunda historia es que las columnas de la Base **dejaron de estar donde estaban**, así que el chequeo mira también el orden, no solo qué nombres aparecen.

## Por qué la columna sola no genera hallazgo

Si el texto de la convención no cambió y las columnas de la Base siguen en su lugar, no hay nada que nivelar.

Marcarla igual dejaba a ese repo con un hallazgo bloqueante **en cada corrida, para siempre**, y sin acción posible: la columna es legítima y no se va a ir. Eso rompe la idempotencia que el nivelador promete —una segunda corrida sobre un repo ya nivelado da todo «ya estaba»— y apaga el reporte entero, porque un tablero que nunca puede llegar a cero deja de significar «hay algo que hacer». Está asentado en el conocimiento [`controles-que-no-avisan`](../conocimiento/controles-que-no-avisan.md), bajo *el hallazgo que nadie puede resolver*.

## Consecuencia sobre 0045

El barrido del árbol de la 0045 pasa a cubrir también los Componentes de Subsistema **ausentes**. Hasta ahora la comparación de contenido recorría el árbol, pero la ausencia volvía a una lista escrita a mano, y por eso se salteaban en silencio `planes/ESTADOS-LOCAL.md`, `conducta/MOMENTOS-LOCAL.md` y las páginas de detalle de preferencias: un repo se informaba al día sin haberlos recibido nunca.

Es la misma frase de la 0045 —*el árbol es la lista*— aplicada a la mitad que había quedado afuera.
