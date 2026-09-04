const fs = require('fs');

function resolveConflict(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Resolver bloque de conflicto manteniendo "Estás Aquí (Altar)"
  const conflictRegex = /<<<<<<< HEAD[\s\S]*?<a href="#hero" class="w-full py-2\.5 px-4 rounded-xl bg-purple-500\/20 border border-purple-500\/40 text-purple-300 font-semibold text-xs font-mono text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-default">\s*<span>Estás Aquí \(Altar\)<\/span>\s*<span>✓<\/span>\s*<\/a>[\s\S]*?>>>>>>> [0-9a-f]+.*?\n/g;

  content = content.replace(conflictRegex, `<a href="#hero" class="w-full py-2.5 px-4 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold text-xs font-mono text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-default">
                <span>Estás Aquí (Altar)</span>
                <span>✓</span>
              </a>\n`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Conflicto resuelto en:", filePath);
}

resolveConflict('index.html');
resolveConflict('public/index.html');
