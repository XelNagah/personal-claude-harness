**Estado: Análisis · Creado 26-08-05.**

# Migrar los consumidores al contrato de ocho estados

El contrato de ocho estados y la familia de habilidades por verbo ya están publicados y corriendo en el repo autor. Falta llevar a los Agentes Desplegados, que quedaron en generaciones distintas y **no cuestan lo mismo**.

## Punto de partida

El cambio es **aditivo**: el juego anterior tenía cinco estados (`Nuevo`, `En curso`, `Diferido`, `Ejecutado`, `Descartado`) y el contrato conserva los cinco con el mismo nombre y la misma carpeta, sumando `Análisis`, `Listo` y `En pausa`. Por eso ningún plan queda con un estado inválido por el solo hecho de nivelar. Lo que cuesta es todo lo demás.

El nivelador **ya detecta bien** las tres situaciones: emite `sin frontmatter de Indice`, `tabla sin el nucleo del Indice` y el divergente `columna(s) fuera de la convencion de la Base`, y trae `ESTADOS.md` nuevo como `contenido viejo`. Verificado el 05/08/2026 con su vista previa contra `bs-overlay`, que propuso 33 acciones. No hace falta tocarlo.

## Censo (verificado el 05/08/2026)

### Población 1 — aditiva, con un cabo semántico

`Contabilidad-Personal-IA` y `analisis/como-uso-claude`. Tienen `ESTADOS.md` de cinco, `ESTADOS-LOCAL.md` sin filas, manifiesto y lint co-ubicado. Nivelar los deja verdes sin tocar una fila.

El cabo es que el remap de la migración anterior mandó `estacionado`, `idea`, `en diseño` y `listo` todos a `Diferido`, porque `Listo` no existía. `Contabilidad-Personal-IA` tiene hoy **14 de 23 planes en `Diferido`**. Ahora que `Análisis` y `Listo` existen, parte de esos catorce quedan describiendo algo que no son: figuran como pospuestos a propósito cuando estaban listos para ejecutar. `Diferido` sigue siendo válido, así que **el lint da verde igual** y nadie se entera. Reclasificar es a mano, plan por plan, y es la única parte que necesita criterio sobre el contenido.

Cuántos de los catorce están mal es **inferencia**, no dato: no se abrió cada plan.

### Población 2 — choque de definiciones

`Agente-Coordinador` se adelantó y definió en su `ESTADOS-LOCAL.md` **exactamente los tres estados que el contrato agrega**. Al llegar la Base, los tres quedan repetidos y el lint dispara `ESTADO REPETIDO EN ESTADOS-LOCAL.md`. Además difiere en dos transiciones y en el mecanismo de retomar:

- Local permite `En pausa → Diferido` y `En pausa → Descartado`; el contrato solo `Análisis` y `En curso`.
- Local permite `Diferido → Descartado`; el contrato solo `Análisis`.
- Local dice que «la ficha asociada indica si retoma»; el contrato usa el dato `estado_a_retomar` en el archivo del plan. Verificado: **ningún archivo** de ese repo lo tiene hoy.

Atenuante: **cero planes** en esos tres estados (tiene 3 `Nuevo`, 2 `En curso`, 1 `Diferido`, 1 `Ejecutado`, 1 `Descartado`). Así que alcanza con borrar las tres filas locales y decidir qué pasa con las dos transiciones que el contrato no permite — sin reclasificar nada.

Las dos transiciones son una decisión del usuario, no del agente: o el repo se ajusta al contrato, o el contrato las incorpora porque el caso es legítimo.

### Población 3 — registro de generación anterior

`bs-overlay/BeatSaber-Overlay` y `local-wispflow` están más atrás que el contrato: su `PLANES.md` es `Plan | Estado | Creado | Cerrado | Origen | Notas` —sin `Código`, sin `Nombre`, sin `Descripción`—, no tiene frontmatter, y no tienen `MANIFIESTO.md` ni `lint-planes/` propio. Les falta la forma actual del registro, no tres estados. `bs-overlay` además tiene `.claude/` fuera del control de versiones, así que ahí no hay red de git para volver atrás.

### Dormidos

`compraventa-nuevo-inmueble`, `Correr IAs locales`, `Impresion3d`, `Salud` y `analisis-particion-sucesion-melody` ya tienen `PLANES.md`: se migraron por reconciliación al reusarse, como estaba previsto. `Integral-Collective` y `Analisis Whatsapp` no tienen planes reconocibles. **No se verificó en qué generación quedó cada uno.**

## Trabajo

1. Poblaciones 1 y 3: correr `amp:actualizar` en cada repo y resolver el divergente de columnas con el usuario, que es el único bloqueante.
2. Población 2: resolver antes las dos transiciones, y recién después nivelar.
3. `Contabilidad-Personal-IA`: repasar los catorce `Diferido` y reclasificar los que hoy son `Análisis` o `Listo`.
4. Cerrar cada repo con su lint de planes en cero.

**Origen:** se desprende del plan ejecutado Local-0011 (Migrar repos consumidores a los estados nuevos), que hizo la migración anterior y dejó explícito que los dormidos se migran por reconciliación al reusarse.
