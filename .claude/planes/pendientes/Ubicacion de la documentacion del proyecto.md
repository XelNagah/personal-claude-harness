# Ubicación de la documentación del proyecto

**Estado: Nuevo · Creado 26-07-24.**

## Problema

Hace falta un documento de instrucciones de instalación/actualización del harness (`INSTALAR.md` o similar), referenciable desde el README. Pero surge una pregunta estructural más grande, sin resolver: **¿dónde vive la documentación del proyecto (páginas de docs para humanos) que no es README ni REGISTRO?**

El README es el landing de GitHub. Referencia otras páginas, que a su vez pueden linkear a cualquier lado. El requisito del usuario: **la raíz tiene que tener lo MENOS posible** — es el escaparate, donde vive el Producto del Propósito. Si cada página de docs nueva (instalar, guías, referencias) se tira en la raíz junto al Producto, la raíz se ensucia.

## Restricciones (lo que ya está descartado)

- **No en la raíz suelto:** una página por doc tirada en la raíz rompe "la raíz con lo mínimo". El escaparate se llena de archivos de documentación mezclados con el Producto del Propósito.
- **No dentro de `.claude/`:** `.claude/` es la casa de datos de los subsistemas — lo que el **agente** lee/escribe en ejecución. La documentación del proyecto la lee un **humano** para montar/entender el harness (mismo estatus que README/REGISTRO). El manifiesto de conocimiento ya fija ese borde (los `.md` de la raíz son documentación del proyecto, no dato de agente; y a la inversa). Un `docs/` dentro de `.claude/` sería un componente ajeno al Patrón de subsistema (lo marcarían `inventariar-componentes-sueltos` y `lint-harness`) y en un repo consumidor viajaría mezclado con datos del agente. Cruza con el Test de demarcación (decisión 0020).

## A resolver

- **Dónde** viven las páginas de docs del proyecto: ¿carpeta `docs/` en la raíz? ¿otra convención? Que el README las referencie limpio desde el landing.
- **Qué** cuenta como documentación del proyecto vs. README/REGISTRO (que se quedan en la raíz por convención GitHub) vs. dato de agente (`.claude/`).
- **Si es solo de este repo** (autor) o es una convención del harness que viaja a los consumidores (¿un repo consumidor también tendría su `docs/`?).
- Recién con eso resuelto: escribir `INSTALAR.md` (instalación por plugin/junction + actualización con `amp-actualizar`, las dos vías —misma PC/otra PC— trabajadas el 24/07/2026) y linkearlo desde el README, **y** poner el README al día (título AMP decisión 0014, glosario→semantica, scripts→herramientas, +conducta +amp-actualizar, MANIFIESTO en vez de "índice siempre en contexto", repo ahora público).

## Contexto

Se abrió al detectar que el README está completamente desactualizado y que hacía falta un doc de instalación/actualización. El usuario frenó la ejecución para resolver primero la ubicación de los docs, en vez de tirar el archivo en la raíz. La actualización del README y la escritura de `INSTALAR.md` quedan **bloqueadas** por esta decisión de ubicación.
