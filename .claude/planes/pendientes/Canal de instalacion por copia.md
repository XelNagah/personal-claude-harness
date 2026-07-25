# Canal de instalación por copia

**Estado: Diferido · Creado 26-07-25.** Origen: [Modelo de distribución y empaquetado del harness](../ejecutados/Modelo%20de%20distribucion%20y%20empaquetado%20del%20harness.md), sección "Abierto" — el único punto que ese plan declaraba **no urgente**. Se desprende para que el paraguas cierre sin perderlo, no porque haya que hacerlo ahora.

## La idea

Sumar un **segundo canal** de instalación, al lado del marketplace: en vez de suscribirse a un plugin que se actualiza solo, **copiar** los archivos del harness dentro del repo destino, para poder leerlos, modificarlos y derivar los propios. Es el Modelo B que el plan padre descartó como canal **principal**, recuperado como **secundario**.

Referencia: Matt Pocock (`mattpocock/skills`) publica los dos canales desde un repo y les pone nombre a las dos filosofías — **plugin** (paquete gestionado, se auto-actualiza, "suscribirse") y **copia** (`npx skills add`, trae los archivos al repo para revisarlos y derivarlos, y además instala en Codex y en cualquier agente que lea Agent Skills).

## Por qué podría valer

- **Los agentes que no son Claude Code no tienen plugins.** Hoy Codex, Cursor y Gemini se sirven por enlace a `~/.agents/skills`, que es una decisión de máquina, no algo que un tercero pueda correr. Un canal de copia les daría instalación de verdad.
- **Derivar.** Un consumidor que quiere su propia variante de una skill hoy no tiene camino: el plugin se actualiza y le pisa el ajuste. Con copia, el archivo es suyo.
- **Leer antes de instalar.** El repo es público; alguien que evalúa el harness quiere ver qué le entra al repo antes de habilitarlo.

## Por qué está diferido

El plan padre lo marcó **no urgente**, y el motivo sigue vigente: el canal principal (marketplace) recién quedó firme con la decisión 0029, y el harness todavía se está moviendo. Un segundo canal duplica la superficie a mantener —cada cambio hay que publicarlo dos veces— antes de que el primero esté estable.

**Reanudar cuando:** el harness esté estable y aparezca un consumidor real que no sea Claude Code, o alguien pida derivar una skill.

## Se cruza con

- [Publicar el harness en inglés](Publicar%20el%20harness%20en%20ingles.md) — dos canales por dos idiomas son cuatro combinaciones a publicar; conviene decidir el idioma antes.
- [Control de desfase entre el harness en disco y el plugin cargado](Control%20de%20desfase%20entre%20el%20harness%20en%20disco%20y%20el%20plugin%20cargado.md) — el canal de copia es una tercera forma de tener las skills en una máquina, y las tres colisionan por nombre entre sí.
- El plan descartado `Restaurar la portabilidad copiar y pegar del orquestador` dejó la Herramienta `armar-prompt-portable` construida y **reservada en la rama git `piloto/plan4-portabilidad`**, explícitamente "por si sirve al canal-copia". Mirarla antes de escribir nada.
