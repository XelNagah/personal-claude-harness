// Las carpetas `base/` de las skills de instalacion que hay en el repo: el recorrido
// `funcionalidades/*/skills/*/base`. Unica copia del repo: la usan las tres Herramientas que
// comparan lo que viaja contra lo instalado — `sincronizar-base`, `lint-harness` y `medir-contexto`.
//
// Por que existe: el recorrido estuvo escrito tres veces, y las tres copias ya habian empezado a
// divergir en la forma (una funcion con parametro en una, codigo suelto en las otras dos). El dia
// que cambie donde viven las carpetas `base/`, se toca una vez.
//
// A diferencia de los otros modulos de esta carpeta, este NO viaja a los Agentes Desplegados: sirve
// solo a quien publica el Agente Multiproposito. Lo declara su fila en el Indice de Herramientas
// del Agente Desplegado, que es lo que lee el control de `lint-harness`.

const fs = require('fs');
const path = require('path');

// Devuelve las rutas absolutas de las carpetas `base/` que existen bajo `raiz`.
function basesDeInstalacion(raiz) {
  const out = [];
  const funcDir = path.join(raiz, 'funcionalidades');
  if (!fs.existsSync(funcDir)) return out;
  for (const f of fs.readdirSync(funcDir, { withFileTypes: true })) {
    if (!f.isDirectory()) continue;
    const skillsDir = path.join(funcDir, f.name, 'skills');
    if (!fs.existsSync(skillsDir)) continue;
    for (const s of fs.readdirSync(skillsDir)) {
      const b = path.join(skillsDir, s, 'base');
      if (fs.existsSync(b)) out.push(b);
    }
  }
  return out;
}

module.exports = { basesDeInstalacion };
