const fs = require('fs');
const path = require('path');

console.log("Iniciando mutación de bunker.html...");

function mutateBunker(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Metadatos
  html = html.replace(/<title>.*?<\/title>/gi, '<title>Búnker Pastoral & Técnico — Ministerio Caminos de Fe</title>');
  html = html.replace(/favicon-faro\.svg/g, 'favicon-mcf.svg');
  html = html.replace(/og-faro\.jpg/g, 'favicon-mcf.svg');
  html = html.replace(/Comunidad Faro de Luz/g, 'Ministerio Caminos de Fe');
  html = html.replace(/Búnker Faro de Luz/g, 'Búnker Caminos de Fe');

  // Gateway Modal
  html = html.replace(/🔒 Acceso Privado · Fundadores/g, '🔒 Acceso Privado · Consejo Pastoral');
  html = html.replace(/Área restringida para la Dirección General \(Director Waly\) y los 13 miembros fundadores del Fideicomiso\./g, 'Terminal privada para el Director Waly, el equipo pastoral y los operadores de sonido y streaming.');
  html = html.replace(/bg-cyan-500/g, 'bg-purple-600');
  html = html.replace(/text-cyan-400/g, 'text-purple-300');
  html = html.replace(/border-cyan-500\/30/g, 'border-purple-500/30');
  html = html.replace(/shadow-cyan-950\/50/g, 'shadow-purple-950/50');
  html = html.replace(/⚡ Entrar como Director Waly \(Simulación\)/g, '✝️ Entrar como Director Waly (Simulación Pastoral)');

  // Topbar
  html = html.replace(/Terminal de Telemetría Comunitaria/g, 'Centro de Comando Pastoral & Audio');
  html = html.replace(/Búnker Táctico: Luz-02/g, 'Búnker Pastoral: Luz-04');
  html = html.replace(/Luz-02/g, 'Luz-04');
  html = html.replace(/Luz 02/g, 'Luz 04');

  // Tokens de color
  html = html.replace(/#06090E/g, '#070A14');
  html = html.replace(/#0D131D/g, '#0D1122');
  html = html.replace(/accent: '#06B6D4'/g, "accent: '#8B5CF6'");
  html = html.replace(/gold: '#E5C07B'/g, "gold: '#FBBF24'");

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Bunker mutado con éxito:", filePath);
}

mutateBunker(path.join(__dirname, '../bunker.html'));
mutateBunker(path.join(__dirname, '../public/bunker.html'));
