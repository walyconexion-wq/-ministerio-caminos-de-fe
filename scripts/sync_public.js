const fs = require('fs');

function fixScrolly(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  // Ajustar getFramePath para que use 'frames/frame_XXXX.jpg'
  code = code.replace(
    /const getFramePath = \(index\) => `public\/frames\/frame_\$\{String\(index \+ 1\)\.padStart\(4, '0'\)\}\.jpg`;/g,
    "const getFramePath = (index) => `frames/frame_${String(index + 1).padStart(4, '0')}.jpg`;"
  );
  fs.writeFileSync(filePath, code, 'utf8');
}

fixScrolly('src/scrollytelling.js');
fixScrolly('public/src/scrollytelling.js');

console.log('Archivos sincronizados en public/ y rutas actualizadas.');
