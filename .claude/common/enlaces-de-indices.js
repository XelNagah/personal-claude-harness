// Los enlaces que declaran los Indices de Subsistema, como rutas relativas a `.claude/`.
//
// Un Indice enlaza a lo que declara: el catalogo de `subsistemas` a la carpeta de cada casa, el de
// `herramientas` a la carpeta o al archivo de cada Herramienta, el de `planes` a cada plan, el de
// `conocimiento` a cada pagina. Leidos todos juntos dan la respuesta a "que de lo que hay en
// `.claude/` esta declarado por alguien", que es la pregunta que se hacen las dos puntas:
//
// - En el ORIGEN, `sincronizar-base` la usa acotada a `origen: agente-desplegado` para saber que es
//   Aprendizaje de este repo y por lo tanto no viaja.
// - En el DESTINO, `inventariar-componentes-sueltos` la usa sin acotar para saber que hijo de
//   `.claude/` pertenece a algo declarado y no es un componente suelto.
//
// Unica copia del repo: la pregunta es la misma y las sutilezas ya pagadas tambien —los enlaces con
// espacios y con `%20`, la marca de orden de bytes que tapa el frontmatter, los anclas—. Escrito
// dos veces divergiria, y la punta que quede vieja no falla: contesta de menos, y contestar de
// menos es nombrar como suelto algo que si estaba declarado.

const fs = require('fs');
const path = require('path');
const { leerFrontmatter, sinMarcaDeOrden } = require('./frontmatter.js');

// Todas las rutas relativas a `.claude/` que enlazan los Indices de Subsistema que haya adentro.
// `origen`, opcional, acota a los Indices que lo declaren en su frontmatter.
//
// Se resuelven desde la carpeta del Indice y se aceptan con espacios y con `%20`: los planes se
// llaman con una frase entera, asi que un patron que corte en el primer espacio deja afuera a los
// 110 archivos de `planes/` y los nombra a todos como no declarados.
//
// Los enlaces que salen de `.claude/` se descartan —un README que apunta a la raiz del repo no
// declara nada de adentro— igual que los que llevan esquema (`https:`, `mailto:`).
function enlacesDeIndices(dirClaude, opciones) {
  const origen = (opciones || {}).origen || null;
  const out = new Set();
  let subs = [];
  try { subs = fs.readdirSync(dirClaude, { withFileTypes: true }).filter(e => e.isDirectory()); } catch (e) { return out; }
  for (const sub of subs) {
    const dir = path.join(dirClaude, sub.name);
    let archivos = [];
    try { archivos = fs.readdirSync(dir).filter(n => n.endsWith('.md')); } catch (e) { continue; }
    for (const f of archivos) {
      let txt; try { txt = fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { continue; }
      const fm = leerFrontmatter(txt);
      if (!fm || !fm.indice) continue;
      if (origen && fm.origen !== origen) continue;
      for (const m of sinMarcaDeOrden(txt).matchAll(/\]\(([^)]+)\)/g)) {
        let destino = m[1].trim().replace(/^<|>$/g, '').split('#')[0];
        if (!destino || /^[a-z][a-z0-9+.-]*:/i.test(destino)) continue;
        try { destino = decodeURIComponent(destino); } catch (e) { /* la ruta cruda sirve igual */ }
        const rel = path.relative(dirClaude, path.resolve(dir, destino)).replace(/\\/g, '/');
        if (rel && !rel.startsWith('..')) out.add(rel.replace(/\/$/, ''));
      }
    }
  }
  return out;
}

// El primer segmento de cada ruta: los hijos directos de `.claude/` que alguien declaro. Lo que le
// sirve al inventario del destino, que clasifica hijos directos y no el arbol entero.
function hijosDeclarados(dirClaude, opciones) {
  const out = new Set();
  for (const r of enlacesDeIndices(dirClaude, opciones)) {
    const primero = r.split('/')[0];
    if (primero) out.add(primero);
  }
  return out;
}

module.exports = { enlacesDeIndices, hijosDeclarados };
