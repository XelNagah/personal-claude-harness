// Los momentos donde EMITIR CUESTA UNA VUELTA COMPLETA DEL MODELO.
//
// En el resto de los momentos el hook deja una nota y el flujo sigue. En estos no: el harness no
// ofrece ninguna forma de hablar sin forzar otra respuesta —en `Stop`, tanto `decision: block` con
// `reason` como `hookSpecificOutput.additionalContext` continuan la conversacion (verificado contra
// la documentacion oficial el 22/08/2026)—, asi que la unica manera de que el turno cierre es que el
// hook no emita nada.
//
// De ahi la regla que rige ahi y en ningun otro lado: CALLAR ES EL DEFAULT. El texto fijo de una
// regla `Inyectar` no sale solo; sale cuando una regla `Bloquear` del mismo momento —un programa que
// mide— lo habilita. Una regla `Inyectar` sin esa habilitacion prometeria un comportamiento que, de
// entregarse siempre, dejaria al agente sin poder terminar: Claude Code corta recien a las 8
// continuaciones seguidas.
//
// UNICA COPIA DEL REPO, por el mismo motivo que `alcance-al-escribir.js`: la lista la necesitan las
// dos puntas —el repartidor `establecer-conducta/`, que decide si emite, y el `lint-conducta`, que
// marca la regla `Inyectar` que quedaria muda—. Escrita dos veces, la que sume un momento primero
// deja a la otra mirando para otro lado, y el sintoma seria una regla que existe y no se entrega
// nunca, sin ningun error en ninguna parte.
//
// Los nombres van en minuscula, como los compara todo el subsistema.
const MOMENTOS_QUE_CUESTAN_UN_TURNO = ['al cerrar tarea'];

function cuestaUnTurno(momento) {
  if (!momento) return false;
  return MOMENTOS_QUE_CUESTAN_UN_TURNO.includes(String(momento).toLowerCase());
}

module.exports = { MOMENTOS_QUE_CUESTAN_UN_TURNO, cuestaUnTurno };
