const fs = require('fs');

// 1. Agregar chip a index.html y public/index.html
function addUbicacionChip(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('¿Dónde está ubicada la Comunidad?')) {
    html = html.replace(
      '<button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-200 transition-all text-left">\n              🌐 ¿Cómo está formado el Ecosistema de 4 Pilares?',
      '<button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-all text-left">\n              📍 ¿Dónde está ubicada la Comunidad en Traslasierra?\n            </button>\n            <button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-200 transition-all text-left">\n              🌐 ¿Cómo está formado el Ecosistema de 4 Pilares?'
    );
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Chip Ubicación agregado a:', filePath);
  }
}

addUbicacionChip('index.html');
addUbicacionChip('public/index.html');

// 2. Actualizar fallback de respuestas en scrollytelling.js y api/chat.js
function updateUbicacionChat(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  const ubicacionCondition = `if (q.includes('donde') || q.includes('ubicac') || q.includes('mapa') || q.includes('panaholma') || q.includes('brochero') || q.includes('llegar')) {
    return 'La Comunidad Faro de Luz está emplazada en un predio de 1 hectárea con provisión de agua propia en el Valle de Traslasierra, Córdoba, ubicado estratégicamente en el corredor entre Panaholma (a 10 min) y Villa Cura Brochero / Mina Clavero (a 15 min), con acceso consolidado para todo tipo de vehículos y a 2.5 hs de Córdoba Capital por las Altas Cumbres.';
  }`;

  if (!code.includes("q.includes('panaholma')")) {
    code = code.replace(
      "if (q.includes('ecosistema')",
      ubicacionCondition + "\n    if (q.includes('ecosistema')"
    );
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Lógica de Ubicación agregada a:', filePath);
  }
}

updateUbicacionChat('src/scrollytelling.js');
updateUbicacionChat('public/src/scrollytelling.js');
updateUbicacionChat('api/chat.js');
