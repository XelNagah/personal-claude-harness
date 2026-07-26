# actualizar-plugins

Pone al día los **plugins** del Agente Multipropósito en esta máquina, y sirve de control de desfase.

```bash
# diagnostica, no toca nada
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js

# actualiza lo que esté atrás y vuelve a verificar
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js --aplicar

# apuntarlo a otro repo de la máquina
node .claude/herramientas/actualizar-plugins/actualizar-plugins.js "D:/Proyectos/otro-repo"
```

## Por qué hace falta

Hay **dos desfases distintos**, y el segundo es el que engaña:

1. **Instalado ↔ disponible** — se publicó una versión nueva y esta máquina todavía no la trajo. Se arregla con `--aplicar`.
2. **Instalado ↔ cargado** — se trajo, pero la **sesión viva** sigue con la versión que cargó al arrancar. Se arregla **reiniciando**, y es el silencioso: `claude plugin list` muestra la versión nueva mientras la sesión corre la vieja.

Los dos pasaron el 25/07/2026, con horas de diferencia:

- Por la tarde, `amp` corría la 0.6.2 con la 0.6.3 publicada seis commits atrás. La versión vieja no tenía una preferencia Base que sí estaba escrita en el repo, así que el instalador habría sembrado preferencias viejas en un repo nuevo.
- A la noche, después de publicar la 0.6.5, el plugin **se trajo solo en segundo plano** (registro actualizado 00:12) pero la sesión —arrancada a las 19:34— siguió ejecutando la 0.6.3. La skill se cargó desde la carpeta vieja de la caché sin que nada lo indicara.

De ahí sale el chequeo de arranque: la Herramienta compara la hora en que se actualizó cada plugin contra la hora en que arrancó la sesión (por `CLAUDE_PID`). Si el plugin es más nuevo, lo marca `[SIN CARGAR]`. Si no puede averiguar el arranque —otro agente, otro sistema— lo dice y omite ese chequeo, en vez de dar por buena una comparación que no hizo.

## Qué compara

Por cada plugin habilitado para el repo (`enabledPlugins` de `.claude/settings.json`, `settings.local.json` y el del usuario):

| Estado | Qué significa |
|--------|---------------|
| `AL DIA` | Lo que corre coincide con lo disponible |
| `DESACTUALIZADO` | Hay versión nueva sin traer |
| `RETIRADO` | Está habilitado pero el marketplace ya no lo ofrece — el repo quedó en una generación de nombres vieja. **Actualizar no lo arregla**: es una migración (desinstalar los nombres viejos, instalar el conjunto nuevo) |
| `NO INSTALADO` | Habilitado en `settings` pero sin entrada instalada |
| `SIN DATO` | El plugin se sirve de un origen propio, o el catálogo no se pudo leer |

Y una marca aparte, que se suma a cualquiera de esos estados:

| Marca | Qué significa |
|-------|---------------|
| `[SIN CARGAR]` | El plugin se actualizó **después** de que arrancó esta sesión: está instalado pero la sesión sigue con la versión vieja. No se arregla con `--aplicar` — hay que **reiniciar** |

- **Lo instalado** sale de `installed_plugins.json`, prefiriendo la entrada de este repo sobre la de alcance usuario.
- **Lo disponible** sale del `plugin.json` dentro del clon del marketplace. Si ese manifiesto no declara `version`, el plugin se versiona por commit y se comparan los sha.
- **Lo cargado** no se lee: se deduce comparando el `lastUpdated` de cada plugin contra la hora de arranque del proceso de la sesión (`CLAUDE_PID`). Si el plugin es posterior, no está cargado.

Es genérico: no hardcodea nombres de plugin ni de marketplace, así que también reporta los plugins ajenos al harness que el repo tenga habilitados.

## Qué corre con `--aplicar`

```
claude plugin marketplace update <marketplace>
claude plugin update <plugin>@<marketplace> --scope <alcance>
```

⚠️ Las dos partes del segundo comando son obligatorias: con el nombre pelado (`claude plugin update amp`) o con el alcance por omisión falla con el mismo mensaje, `Plugin "amp" not found`, que no dice cuál de las dos falta. Por eso conviene correr esto y no los comandos a mano.

Refresca el catálogo primero y **vuelve a diagnosticar** antes de actualizar: traer el catálogo puede cambiar qué está atrasado.

**Después hay que reiniciar la sesión.** `/reload-plugins` no alcanza: recarga los plugins en la versión que ya tenían.

## Lo que no hace

- **No escribe el handoff.** Un script no sabe en qué venías trabajando; eso lo redacta el agente antes de llamarlo.
- **No toca los archivos de `.claude/`.** Esa es la otra fase, y la pone al día `amp:actualizar`.
- **No migra los nombres viejos.** Los detecta y los reporta; el procedimiento está en `docs/INSTALAR.md`.

Sin `process.exit(1)`: reporta, no frena — es capa mecánica, el juicio queda del lado del agente.
