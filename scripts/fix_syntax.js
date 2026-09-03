const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Reemplazar ocurrencias dobles de const deleted
  content = content.replace(
    /const deleted = JSON\.parse\(localStorage\.getItem\(DELETED_KEY\) \|\| '\[\]'\);\s*const deleted = JSON\.parse\(localStorage\.getItem\(DELETED_KEY\) \|\| '\[\]'\);/g,
    "const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');"
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Limpio:", filePath);
}

cleanFile(path.join(__dirname, '../src/scrollytelling.js'));
cleanFile(path.join(__dirname, '../public/src/scrollytelling.js'));
cleanFile(path.join(__dirname, '../src/bunker.js'));
cleanFile(path.join(__dirname, '../public/src/bunker.js'));
