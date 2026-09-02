const fs = require('fs');
const path = require('path');

function polish(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Reemplazar códigos de credencial
  html = html.replace(/FL-2027/g, 'MCF-2027');
  html = html.replace(/COMUNIDAD FARO DE LUZ/g, 'MINISTERIO CAMINOS DE FE');
  html = html.replace(/Fideicomiso Inmobiliario de Co-Housing/g, 'Fichero Nacional de Cultos · Ley 21.745');
  html = html.replace(/IPJ Córdoba/g, 'Cancillería Argentina');
  html = html.replace(/Comunidad Ecotecnológica Faro de Luz/g, 'Ministerio Caminos de Fe');

  // 2. Modificar la sección #regla-tiempo para Cero Diezmos Obligatorios
  html = html.replace(/La Regla de Oro del Trabajo/g, 'Sustento 100% ShopDigital & Cero Diezmos Obligatorios');
  html = html.replace(/Asignación de Tiempo/g, 'Sustento & Principio de Gracia');
  html = html.replace(/La comunidad NO vive de agricultura de subsistencia\./g, 'El ministerio es 100% gratuito. Cero diezmos obligatorios.');

  // Inyectar el texto exacto de Cero Diezmos
  html = html.replace(
    /<div class="p-3\.5 rounded-xl bg-purple-950\/30 border border-purple-500\/30">[\s\S]*?<\/div>/,
    `<div class="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
        <div class="flex justify-between font-bold text-purple-300 mb-1">
          <span>🚫 Cero Diezmos Obligatorios</span>
          <span class="font-mono">Gracia Plena</span>
        </div>
        <p class="text-slate-300">"De gracia recibisteis, dad de gracia." Queda prohibida la coacción monetaria. Las ofrendas voluntarias van 100% a la Fundación Valle de Luz.</p>
      </div>`
  );

  // 3. Tarjeta de Legalidad en esa misma sección
  html = html.replace(/Fideicomiso Co-Housing \(Córdoba\)/g, 'Registro Nacional de Cultos (Secretaría de Culto)');
  html = html.replace(/Fideicomiso de Administración:.*?módulo\./s, 'Fichero de Cultos: Inscripto bajo Ley 21.745 para culto público y personería oficial.');
  html = html.replace(/Reglamento de Convivencia:.*?fundadores\./s, 'Comisión Directiva Fundacional: Presidida por el Director Waly (12-13 fundadores).');
  html = html.replace(/Plan de Acción Trienal:.*?Córdoba\./s, 'Habilitaciones Municipales: Permisos automáticos para cultos de campaña al aire libre.');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Pulido con éxito:", filePath);
}

polish(path.join(__dirname, '../index.html'));
polish(path.join(__dirname, '../public/index.html'));
