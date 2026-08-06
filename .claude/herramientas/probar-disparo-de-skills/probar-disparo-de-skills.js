#!/usr/bin/env node
'use strict';

/**
 * probar-disparo-de-skills — corre el banco de consultas contra sesiones reales
 * y contesta si cada Skill se invoca sola.
 *
 * Qué mide: la PRIMERA herramienta que usa el agente ante la consulta. Si es
 * `Skill`, disparó; si es cualquier otra —o si contesta sin usar ninguna—, no.
 * Ese criterio es el que distingue los dos comportamientos que interesan: el
 * agente que consulta la Skill y el que estima poder resolverlo solo y se pone
 * a leer archivos a mano.
 *
 * Cada consulta corre en una sesión limpia con `claude --print`, o sea el hilo
 * principal real con el arranque real del repo, no una aproximación. Las
 * herramientas se limitan a lectura más `Skill`: si el agente intenta escribir,
 * el intento igual aparece en el flujo y se cuenta, pero no llega a tocar nada.
 *
 * ⚠️ Cuesta cuota real: una sesión por consulta.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const HERRAMIENTAS = ['Read', 'Glob', 'Grep', 'Skill'];
const TOPE_POR_CONSULTA_MS = 180000;

const raizRepo = process.cwd();
const dirHerramienta = __dirname;

function parseArgs(argv) {
  const opciones = { skill: null, id: null, listar: false };
  for (const a of argv.slice(2)) {
    if (a === '--listar') opciones.listar = true;
    else if (a.startsWith('--skill=')) opciones.skill = a.slice('--skill='.length);
    else if (a.startsWith('--id=')) opciones.id = a.slice('--id='.length);
  }
  return opciones;
}

/**
 * Corre una consulta y devuelve la primera herramienta que usó el agente.
 * Corta la sesión apenas la detecta: lo que pase después no cambia el resultado
 * y cada turno de más se paga.
 */
function correrConsulta(consulta) {
  return new Promise((resolve) => {
    const args = [
      '--print', consulta,
      '--output-format', 'stream-json',
      '--verbose',
      '--allowed-tools', ...HERRAMIENTAS,
    ];

    const proc = spawn('claude', args, { cwd: raizRepo, shell: true });

    let resto = '';
    let resuelto = false;
    let textoFinal = '';

    const terminar = (resultado) => {
      if (resuelto) return;
      resuelto = true;
      clearTimeout(reloj);
      try { proc.kill(); } catch (_) { /* ya murió */ }
      resolve(resultado);
    };

    const reloj = setTimeout(
      () => terminar({ primeraHerramienta: null, skillInvocada: null, motivo: 'se agotó el tiempo' }),
      TOPE_POR_CONSULTA_MS
    );

    proc.stdout.on('data', (chunk) => {
      resto += chunk.toString('utf8');
      const lineas = resto.split('\n');
      resto = lineas.pop();

      for (const linea of lineas) {
        if (!linea.trim()) continue;
        let evento;
        try { evento = JSON.parse(linea); } catch (_) { continue; }

        const contenido = evento.message && evento.message.content;
        if (Array.isArray(contenido)) {
          for (const bloque of contenido) {
            if (bloque.type === 'tool_use') {
              const nombreSkill = bloque.name === 'Skill'
                ? (bloque.input && (bloque.input.skill || bloque.input.name)) || '(sin nombre)'
                : null;
              return terminar({
                primeraHerramienta: bloque.name,
                skillInvocada: nombreSkill,
                motivo: null,
              });
            }
            if (bloque.type === 'text' && bloque.text.trim()) textoFinal = bloque.text.trim();
          }
        }
      }
    });

    proc.on('close', () => {
      terminar({
        primeraHerramienta: null,
        skillInvocada: null,
        motivo: textoFinal ? 'contestó sin usar ninguna herramienta' : 'no emitió nada',
      });
    });

    proc.on('error', (err) => {
      terminar({ primeraHerramienta: null, skillInvocada: null, motivo: `no se pudo correr claude: ${err.message}` });
    });
  });
}

async function main() {
  const opciones = parseArgs(process.argv);
  const banco = JSON.parse(fs.readFileSync(path.join(dirHerramienta, 'banco.json'), 'utf8'));

  let consultas = banco.consultas;
  if (opciones.skill) consultas = consultas.filter((c) => c.skill === opciones.skill);
  if (opciones.id) consultas = consultas.filter((c) => c.id === opciones.id);

  console.log(`== PROBAR DISPARO DE SKILLS: ${raizRepo} ==`);

  if (opciones.listar) {
    for (const c of consultas) {
      console.log(`  ${c.id.padEnd(16)} ${c.debe_disparar ? 'debe disparar    ' : 'no debe disparar '} ${c.skill}`);
      console.log(`  ${' '.repeat(16)} "${c.consulta}"`);
    }
    return;
  }

  if (!consultas.length) {
    console.error('el banco quedó vacío con esos filtros: no hay nada que probar.');
    process.exit(1);
  }

  console.log(`consultas: ${consultas.length} | una sesión real por consulta, esto cuesta cuota\n`);

  const resultados = [];
  for (const c of consultas) {
    process.stdout.write(`  ${c.id.padEnd(16)} corriendo… `);
    const r = await correrConsulta(c.consulta);
    const disparo = r.primeraHerramienta === 'Skill' && r.skillInvocada === c.skill;
    const acierta = disparo === c.debe_disparar;

    let observado;
    if (r.primeraHerramienta === 'Skill') observado = `disparó ${r.skillInvocada}`;
    else if (r.primeraHerramienta) observado = `usó ${r.primeraHerramienta}`;
    else observado = r.motivo;

    console.log(`${acierta ? 'OK  ' : 'FALLA'}  ${observado}`);
    resultados.push({ ...c, ...r, disparo, acierta });
  }

  const debian = resultados.filter((r) => r.debe_disparar);
  const noDebian = resultados.filter((r) => !r.debe_disparar);
  const dispararon = debian.filter((r) => r.disparo).length;
  const deMas = noDebian.filter((r) => r.disparo).length;

  console.log(`\n  de las que DEBEN disparar:    ${dispararon}/${debian.length}`);
  console.log(`  de las que NO deben disparar: ${deMas}/${noDebian.length} dispararon de más`);

  const fallas = resultados.filter((r) => !r.acierta);
  if (fallas.length) {
    console.log('\n---- FALLAS ----');
    for (const f of fallas) {
      const observado = f.primeraHerramienta === 'Skill' ? `disparó ${f.skillInvocada}` : (f.primeraHerramienta ? `usó ${f.primeraHerramienta}` : f.motivo);
      console.log(`  ${f.id}  "${f.consulta}"`);
      console.log(`     esperado: ${f.debe_disparar ? `dispara ${f.skill}` : `no dispara ${f.skill}`}  ·  observado: ${observado}`);
      console.log(`     por qué:  ${f.por_que}`);
    }
  }

  const salida = path.join(dirHerramienta, 'ultima-corrida.json');
  fs.writeFileSync(salida, JSON.stringify({ raizRepo, resultados }, null, 2), 'utf8');
  console.log(`\ndetalle en ${path.relative(raizRepo, salida)}`);

  process.exit(fallas.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
