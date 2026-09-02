const fs = require('fs');
const path = require('path');

function fixWidget(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/L-02/g, 'L-04');
  html = html.replace(/Atención a la Comunidad/g, 'Sistemas de Culto, Audio & Legal');
  html = html.replace(/Ingeniería & Atención a la Comunidad/g, 'Sistemas de Culto, Sonido & Fichero');
  html = html.replace(/la ingeniera asistente de la Ministerio Caminos de Fe/g, 'la ingeniera de sistemas de culto y sonido del Ministerio Caminos de Fe');
  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Widget corregido en:", filePath);
}

fixWidget(path.join(__dirname, '../index.html'));
fixWidget(path.join(__dirname, '../public/index.html'));
