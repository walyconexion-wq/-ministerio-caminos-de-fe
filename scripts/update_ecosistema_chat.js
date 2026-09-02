const fs = require('fs');

// 1. Agregar chip a index.html y public/index.html
function addEcosistemaChip(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('¿Cómo está formado el Ecosistema?')) {
    html = html.replace(
      '<button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-all text-left">\n              🧭 ¿Cuál es la Visión y Misión de la Comunidad?',
      '<button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-200 transition-all text-left">\n              🌐 ¿Cómo está formado el Ecosistema de 4 Pilares?\n            </button>\n            <button class="luz-quick-chip text-[11px] px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-all text-left">\n              🧭 ¿Cuál es la Visión y Misión de la Comunidad?'
    );
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Chip Ecosistema agregado a:', filePath);
  }
}

addEcosistemaChip('index.html');
addEcosistemaChip('public/index.html');

// 2. Actualizar fallback de respuestas en scrollytelling.js y api/chat.js
function updateEcosistemaChat(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  const ecosistemaCondition = `if (q.includes('ecosistema') || q.includes('4 pilares') || q.includes('plataforma') || q.includes('ramas')) {
    return 'Nuestro Ecosistema está compuesto por 4 pilares independientes: 1) ShopDigital (empresa de software e IA que sustenta el 100% de los fondos), 2) Comunidad Faro de Luz (la base física de montaña y hábitat modular), 3) Fundación Valle de Luz (acción social y apoyo comunitario en Traslasierra), y 4) Ministerio Caminos de Fe (formación espiritual, culto y adoración).';
  }`;

  if (!code.includes("q.includes('ecosistema')")) {
    code = code.replace(
      "if (q.includes('vision')",
      ecosistemaCondition + "\n    if (q.includes('vision')"
    );
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Lógica de Ecosistema agregada a:', filePath);
  }
}

updateEcosistemaChat('src/scrollytelling.js');
updateEcosistemaChat('public/src/scrollytelling.js');
updateEcosistemaChat('api/chat.js');
