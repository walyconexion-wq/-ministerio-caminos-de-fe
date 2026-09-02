const fs = require('fs');

// 1. Agregar chip a index.html y public/index.html
function addChip(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('¿Cuál es la Visión y Misión')) {
    html = html.replace(
      '<button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-all text-left">\n              🏡 ¿Cómo son las viviendas modulares de montaña?',
      '<button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-all text-left">\n              🧭 ¿Cuál es la Visión y Misión de la Comunidad?\n            </button>\n            <button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-all text-left">\n              🏡 ¿Cómo son las viviendas modulares de montaña?'
    );
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Chip agregado a:', filePath);
  }
}

addChip('index.html');
addChip('public/index.html');

// 2. Actualizar fallback de respuestas en scrollytelling.js y api/chat.js
function updateChatResponses(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  const misionCondition = `if (q.includes('vision') || q.includes('mision') || q.includes('proposito') || q.includes('objetivo')) {
    return 'Nuestra Visión es ser un modelo pionero de comunidad de montaña autosustentable en Traslasierra, con soberanía energética y tecnológica. Nuestra Misión es albergar a 6 familias fundadoras que integran fe cristiana, excelencia profesional en ShopDigital (70/20/10) y desarrollo comunitario de vanguardia.';
  }`;

  if (!code.includes("q.includes('vision')")) {
    code = code.replace(
      "if (q.includes('vivienda')",
      misionCondition + "\n    if (q.includes('vivienda')"
    );
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Lógica de Visión/Misión agregada a:', filePath);
  }
}

updateChatResponses('src/scrollytelling.js');
updateChatResponses('public/src/scrollytelling.js');
updateChatResponses('api/chat.js');
