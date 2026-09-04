const fs = require('fs');

function fixConflict(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  const startMarker = '<<<<<<< HEAD';
  const endMarker = '>>>>>>> 043353f (feat(frontend): cambiar Comunidad por Ministerio en portada, isotipo de cruz en Asistente Luz y efecto scrollspy dinámico en menú)';
  
  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);

  if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `              <a href="#hero" class="w-full py-2.5 px-4 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold text-xs font-mono text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-default">
                <span>Estás Aquí (Altar)</span>
                <span>✓</span>
              </a>`;
    text = text.substring(0, startIdx) + replacement + text.substring(endIdx + endMarker.length);
    fs.writeFileSync(filePath, text, 'utf8');
    console.log("Conflicto eliminado limpiamente en:", filePath);
  } else {
    console.log("No se encontraron marcadores en:", filePath);
  }
}

fixConflict('index.html');
fixConflict('public/index.html');
