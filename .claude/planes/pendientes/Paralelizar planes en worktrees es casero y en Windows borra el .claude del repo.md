# Paralelizar planes en worktrees es casero y en Windows borra el .claude del repo

**Estado: Nuevo · Creado 26-09-04.**

**Origen:** pedido del Agente Desplegado `sicape-backend` (backend Java del sistema SICAPE), traído
por el usuario el 04/09/2026. El repo del front del mismo sistema usa el mismo patrón casero, así
que el agujero ya está replicado en al menos dos instalaciones.

## Qué se pide

Un mecanismo del Agente Multipropósito para **paralelizar planes en worktrees, que cubra armar y
limpiar**, y donde la clase entera de problema no exista. Hoy cada instalación arma sus worktrees y
sus enlaces a mano, con el criterio del agente que le tocó ese día, y **el daño no ocurre al armar
sino al limpiar**, que es el momento en que ya nadie está mirando.

## Qué pasó en el repo que lo pide, con la causa verificada

El procedimiento casero era: `git worktree add` a `D:\wt\<plan>`, y adentro de cada worktree un
junction de Windows `\.claude` apuntando al `.claude/` real del repo principal, para que los tres
agentes compartieran preferencias, planes y conocimiento sin copiarlos.

Al terminar, la limpieza fue `git worktree remove` sobre los tres. Los tres devolvieron
`Permission denied` (un daemon de Gradle tenía locks sobre `build/`). El agente lo leyó como «no
borró nada» y siguió. Siete minutos después, un hook falló con `MODULE_NOT_FOUND`: se habían
perdido `.claude/.git`, `.claude/comunicacion/`, `.claude/conducta/` y `.claude/conocimiento/`.

**`git worktree remove` atraviesa el junction y borra el contenido del destino real.** Git en
Windows no lo reconoce como enlace: entra y vacía lo que hay del otro lado.

Lo reprodujeron con un repo, un worktree y un junction armados igual, sobre un destino de prueba de
25 archivos en 5 subcarpetas:

| Variante | Destino real |
|---|---|
| `Remove-Item -Recurse -Force` sobre el worktree | 25 de 25 intactos (repetido dos veces) |
| `git worktree remove` | 0 de 25 |
| `Remove-Item -Force` (sin `-Recurse`) sobre el junction, después `git worktree remove` | 0 de 25 |

Tres cosas que salen de ahí y que conviene no volver a descubrir:

- **`Remove-Item -Recurse -Force` es inocente.** La primera versión del diagnóstico lo culpaba a él
  y recomendaba «preferí `git worktree remove`»: la salvaguarda escrita dirigía al comando que
  había hecho el daño. Estuvo así un día.
- **El rodeo «sacá el junction primero con `Remove-Item -Force` sin `-Recurse`» no funciona.** Sobre
  un junction que apunta a un directorio no vacío, pide confirmación, y en modo no interactivo
  aborta sin sacar nada; después git lo atraviesa igual. Lo que sí funciona:
  `[System.IO.Directory]::Delete($ruta, $false)` o `(Get-Item $ruta -Force).Delete()`.
- **Un `Permission denied` de git no significa «no borré nada».** Significa «borré hasta acá y me
  trabé». Lo perdido fue un tramo alfabético consecutivo que se cortó antes de `decisiones/`: la
  firma de un recorrido interrumpido.

## Por qué el arreglo local no alcanza

Ese repo corrigió su página de conocimiento, su regla de conducta y su procedimiento. Eso lo
protege a él. El mecanismo sigue siendo casero en cada instalación. Además, `.claude/` está
gitignoreado por diseño: un borrado no deja rastro en `git status` del repo principal y no hay
`git checkout --` que lo deshaga. Allá lo resolvieron recreando un `.claude/.git` local sin remoto,
también artesanal.

## La idea que trae el pedido, con sus datos

**Que el worktree reciba una copia de `.claude/`, no un enlace.** Sin enlace no hay nada que
atravesar, y ningún borrado del worktree —por git, por PowerShell o a mano— puede tocar el
original. Es más robusto que ordenar bien los pasos, porque no depende de que nadie se olvide del
orden.

- `.claude/` pesa **6,1 MB** en ese repo (el grueso: `planes/` 1,7 MB, `tmp/` 874 KB). Copiar eso
  por worktree es intrascendente.
- El costo real es la **divergencia**, no el espacio: el agente del worktree lee una foto, y no ve
  lo que el principal actualice mientras tanto. Allá ya rige que ningún agente de worktree escribe
  en `.claude/`, así que la copia sería de solo lectura de hecho — pero conviene volverlo explícito
  en el mecanismo, no dejarlo librado a la disciplina. Hoy, si igual escribe, se pierde en silencio
  al borrar el worktree.
- Si la copia va **adentro** del worktree no hace falta ningún enlace. Copiar afuera y enlazar a esa
  copia deja el enlace en el medio otra vez: menos daño, mismo mecanismo.

## Dónde va el worktree — la trampa que el pedido anticipa

Que los worktrees estén en `D:\wt\<plan>` y no en el directorio temporal del agente **no es
descuido**: es un rodeo al límite de longitud de ruta de Windows.

- La ruta de ese repo mide 85 caracteres, y adentro hay archivos cuya ruta relativa llega a 228.
  Sumadas pasan el límite y `git worktree remove` corta con `Filename too long`.
- `D:\wt` da 5 caracteres de base y deja margen.
- El directorio de scratchpad que asigna el agente mide 150 caracteres de base: un worktree ahí
  adentro rompería seguro.

Es decir: un mecanismo que «ordene» las cosas moviendo los worktrees al temporal del agente va a
fallar en Windows en cualquier repo con rutas largas — el caso normal cuando el repo vive bajo una
carpeta de usuario con nombres en español. La raíz corta parece fea y es funcional. Si se hace
configurable, que el valor por omisión en Windows sea una raíz corta y que el mecanismo **avise**
cuando la ruta elegida no deja margen.

⚠️ Esto choca de frente con la Preferencia Local-0003 (*Guardar los archivos temporales en
`.claude/tmp/`*): un worktree no es un archivo temporal de trabajo, pero la distinción hay que
dejarla escrita o el mecanismo va a discutir con la preferencia.

## Lo demás que el mecanismo debería resolver

- **Limpiar es parte del mecanismo, no del criterio del agente.** Que el paso exista y que verifique
  el resultado, en vez de confiar en que alguien se acuerde.
- **Verificar después de borrar, siempre.** Listar el contenido real de `.claude/` y compararlo con
  lo que había antes. Allá el daño se descubrió siete minutos tarde y por un hook que falló de
  casualidad.
- **Los locks son normales, no una excepción.** Si el agente corrió tests en el worktree va a haber
  un daemon de Gradle (o equivalente) con locks. Liberarlos antes de intentar borrar, y tratar un
  fallo de borrado como **estado sucio a revisar**, nunca como no-evento.
- **La red de seguridad.** `.claude/` gitignoreado no tiene forma de deshacer nada. Un repo local
  sin remoto adentro de `.claude/` resuelve la mayor parte y cuesta un `git init`; quizá valga la
  pena que el Agente Multipropósito lo ofrezca de fábrica, no solo para esto.

## Lo que queda abierto para el análisis

1. **Copia, enlace bien manejado, o `git worktree add` con un `.gitignore` que excluya `.claude/`
   del árbol del worktree.** El repo que pide no evaluó las tres.
2. **Cómo se comporta esto en Linux y macOS con symlinks reales.** Todo lo probado fue Windows con
   junctions y PowerShell 5.1.
3. **Si el mecanismo debería impedir del todo que un agente de worktree escriba en `.claude/`, o
   permitirlo y reconciliar al final.**
4. **La Herramienta `recuperar-desde-transcritos`.** La recuperación de allá fue posible porque las
   transcripciones de sesión de Claude Code (`~/.claude/projects/`) guardan íntegro el contenido de
   cada `Write` y cada `Read`: de ahí volvieron 11 páginas con su texto original. La empaquetaron
   como Herramienta local y ofrecen subirla si sirve para cualquier instalación. **Decidir si se
   adopta** — es útil mucho más allá de este incidente. El nombre que le pusieron allá lleva
   `transcritos`, que acá es una relación vetada (Local-0043 de la Terminología Farlopa, canónico
   «la transcripción de la sesión»): si se adopta, se renombra.

   Al adoptarla mandan cuatro decisiones que el contraste trajo y que este plan no puede saltear:
   la Decisión Local-0048 (*qué sube a la Base y qué se queda como documentación de este proyecto*),
   la Decisión Local-0053 (*la Base pública no incluye elecciones personales del autor*), la
   Decisión Local-0054 (*replicar una elección personal no la convierte en Base*) y la Decisión
   Local-0055 (*copiar una entrada entre Agentes Desplegados es una operación puntual*). Vale para
   el mecanismo de worktrees entero, no solo para esta Herramienta.

5. **El mecanismo se escribe en Node sin dependencias externas** — Decisión Local-0047. Todo lo que
   el pedido describe en PowerShell y en `.NET` (`[System.IO.Directory]::Delete`) hay que resolverlo
   en Node nativo, o justificar por qué no se puede. Es una restricción de diseño, no un detalle.

6. **Dónde vive el código.** Un mecanismo de worktrees toca planes y subsistemas por igual, así que
   por la Decisión Local-0049 iría a `.claude/common/`, con prueba propia. Confirmarlo al analizar.

7. **El paso de verificación posterior al borrado podría delegarse a un subagente**, por la Decisión
   Local-0060 — recorrer `.claude/` y comparar contra lo que había es exactamente un recorrido de
   volumen. Y el patrón de limpieza tiene antecedente: la Decisión Local-0028 (*diseño del
   actualizador*) ya fijó «respaldo antes de tocar y reporte al final».

## Relación con otros planes

- El plan **Local-0119** (*Hacer avanzar varios planes a la vez hasta la próxima decisión del
  usuario*): es lo que hace falta paralelizar. Este mecanismo es su infraestructura, o parte de ella.
- El plan **Local-0043** (*Habilidad de ejecución de planes*): tiene el contrato escrito y le falta, entre
  otras cosas, **cómo se comporta dentro de una copia de trabajo aislada** — que es exactamente lo
  que este plan tiene que definir. Al analizar, mirar si los dos se resuelven juntos.

## Contexto de dónde salió

El registro del incidente, con la línea de tiempo completa y las pruebas, está en
`.claude/conocimiento/incidente-borrado-de-claude-por-junction.md` del repo `sicape-backend`. Ese
repo es un Agente Desplegado alcanzable por el subsistema `comunicacion`: si al analizar hace falta
el detalle, se le pregunta en vez de reconstruirlo.
