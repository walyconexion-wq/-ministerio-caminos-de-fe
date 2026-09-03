const fs = require('fs');
const path = require('path');

function fixIIFE(filePath) {
  let content = fs.readFileSync(filePath, 'utf8').trim();
  if (content.endsWith('})();')) {
    content = content.slice(0, -5).trim() + '\n\n})();\n';
  } else if (!content.endsWith('})();')) {
    content = content + '\n})();\n';
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// Corregir scrollytelling
let scrolly = fs.readFileSync('src/scrollytelling.js', 'utf8').trim();
if (!scrolly.endsWith('})();')) {
  scrolly += '\n})();\n';
} else {
  // Asegurar que el cierre tenga } y no solo )();
  scrolly = scrolly.replace(/\n\)\(\);?\s*$/, '\n})();');
  if (!scrolly.endsWith('})();')) scrolly += '\n})();';
}
// Comprobar balance
let bScrolly = 0;
for (let c of scrolly) {
  if (c === '{') bScrolly++;
  if (c === '}') bScrolly--;
}
if (bScrolly === 1) {
  scrolly = scrolly.replace(/\)\(\);?\s*$/, '})();');
}

fs.writeFileSync('src/scrollytelling.js', scrolly, 'utf8');
fs.writeFileSync('public/src/scrollytelling.js', scrolly, 'utf8');

// Comprobar bunker.js
let bunker = fs.readFileSync('src/bunker.js', 'utf8').trim();
let bBunker = 0;
for (let c of bunker) {
  if (c === '{') bBunker++;
  if (c === '}') bBunker--;
}
if (bBunker === 1) {
  bunker = bunker.replace(/\)\(\);?\s*$/, '})();');
}
fs.writeFileSync('src/bunker.js', bunker, 'utf8');
fs.writeFileSync('public/src/bunker.js', bunker, 'utf8');

console.log("Cierres de IIFE corregidos.");
