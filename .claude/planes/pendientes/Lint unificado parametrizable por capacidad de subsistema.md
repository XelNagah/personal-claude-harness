# Lint unificado parametrizable por capacidad de subsistema

Un solo lint parametrizable por la **capacidad declarada** de cada subsistema, en vez de N lints artesanales que repiten (y divergen en) la misma lógica. Objetivo del autor: generalizar las soluciones y que todo sea lo más estándar posible.

## Motivación

Hoy hay ocho lints con criterios que se fueron unificando de a uno (resolución de refs en 0.4.1, atribución pendiente en otro plan). Cada unificación es un barrido manual + `lint-harness` comparando fragmentos textuales entre copias. Mantener N lints distintos para lo que en el fondo es el mismo patrón (índice + entradas) es caro y propenso a divergencia.

Además, los subsistemas usan **porciones distintas** del patrón: glosario/decisiones son tabla en un solo dir (sin recursión); memoria/conocimiento/planes recorren subárbol; conocimiento tiene multi-índice recursivo. Que un subsistema use una porción no debería obligar a un lint aparte.

## Dirección

Un lint que toma una **declaración de forma** del subsistema y corre los chequeos que correspondan:

- **solo-índice** (tabla, un dir) → refs de detalle, huérfanos en el dir, numeración/colisiones según aplique.
- **índice + documento** → además, cada documento referenciado existe y está indexado.
- **índice + carpeta recursiva** → atribución por ancestro más cercano (decisión 0011), sub-índices, fallback por cadena de carpetas.

Cada subsistema declara qué capacidades usa; el lint detecta lo que se defina. Las variaciones genuinas (numeración de decisiones, reconciliación disco↔registro de planes) quedan como módulos opcionales, no como lints enteros aparte.

## Preguntas abiertas

- ¿Dónde vive la declaración de forma? (frontmatter del índice, un `lint.config`, convención por nombre de subsistema…)
- Distribución: hoy cada lint viaja embebido y co-ubicado (0008). Un lint único, ¿se co-ubica igual por subsistema con un config distinto, o pasa a Herramienta transversal? Choca con 0008 si se centraliza.
- Portabilidad: los repos consumidores reciben el lint por instalador; el cambio a config no puede romper el nivelar.
- ¿Retira los N lints o convive un tiempo? Migración incremental.
- Relación con 0011 y con el plan `Atribución por ancestro más cercano`: ese es la primera regla que este lint absorbería. Decidir orden para no hacer el trabajo dos veces.

## Riesgo

Alto: rediseño estructural que toca los ocho lints, su distribución y el nivelar de todos los repos consumidores. No arrancar sin resolver las preguntas abiertas. Es la generalización correcta, pero es su propio proyecto — no bloquea los arreglos puntuales.
