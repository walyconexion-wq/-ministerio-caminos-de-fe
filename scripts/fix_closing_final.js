const fs = require('fs');

function fixClosing(filePath) {
  let content = fs.readFileSync(filePath, 'utf8').trim();
  if (content.endsWith('})();')) {
    content = content.slice(0, -5).trim() + '\n\n})();\n';
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

let scrolly = fs.readFileSync('src/scrollytelling.js', 'utf8').trim();
scrolly = scrolly.replace(/\n\)\(\);?\s*$/, '\n})();\n');
fs.writeFileSync('src/scrollytelling.js', scrolly, 'utf8');
fs.writeFileSync('public/src/scrollytelling.js', scrolly, 'utf8');

let bunker = fs.readFileSync('src/bunker.js', 'utf8').trim();
bunker = bunker.replace(/\n\)\(\);?\s*$/, '\n})();\n');
fs.writeFileSync('src/bunker.js', bunker, 'utf8');
fs.writeFileSync('public/src/bunker.js', bunker, 'utf8');

console.log("Cierres reparados.");
