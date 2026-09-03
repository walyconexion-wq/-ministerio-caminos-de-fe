const fs = require('fs');

function fixBunker(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(
    /let localData = \[\];\s*try \{\s*localData = JSON\.parse\(localStorage\.getItem\(STORAGE_KEY\) \|\| '\[\]'\);\s*\} catch \(e\) \{\s*localData = \[\];\s*\}\s*const deleted = JSON\.parse\(localStorage\.getItem\(DELETED_KEY\) \|\| '\[\]'\);\s*if \(!deleted\.includes\(id\)\) \{\s*deleted\.push\(id\);\s*localStorage\.setItem\(DELETED_KEY, JSON\.stringify\(deleted\)\);\s*\}/s,
    `let localData = [];
        try {
          localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
          localData = [];
        }`
  );
  fs.writeFileSync(filePath, code, 'utf8');
}

fixBunker('src/bunker.js');
fixBunker('public/src/bunker.js');
console.log("Bunker.js corregido.");
