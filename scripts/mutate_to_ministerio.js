const fs = require('fs');
const path = require('path');

console.log("Iniciando mutación a Ministerio Caminos de Fe...");

function mutateHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Metadatos y Head
  html = html.replace(/<title>.*?<\/title>/gi, '<title>Ministerio Caminos de Fe — Altar de Montaña, Cultos y Discipulado en Traslasierra</title>');
  html = html.replace(/favicon-faro\.svg/g, 'favicon-mcf.svg');
  html = html.replace(/og-faro\.jpg/g, 'favicon-mcf.svg');
  html = html.replace(/Comunidad Faro de Luz — Base Montaña Traslasierra/g, 'Ministerio Caminos de Fe — Altar de Montaña y Cultos');
  html = html.replace(/2027 — Unión de fe, ecotecnología y comunidad en el corazón de Traslasierra, Córdoba\./g, 'Levantando una generación que camina en fe y brilla con la luz del Evangelio. Valle de Traslasierra, Córdoba.');
  html = html.replace(/https:\/\/farodeluz\.dpdns\.org\//g, 'https://caminosdefe.dpdns.org/');
  html = html.replace(/Comunidad Faro de Luz/g, 'Ministerio Caminos de Fe');

  // 2. Preloader
  html = html.replace(/Inicializando Búnker y Fotogramas/g, 'Inicializando Altar de Adoración y Streaming');
  html = html.replace(/border-t-amber-400 animate-spin/g, 'border-t-purple-400 animate-spin');
  html = html.replace(/border-amber-500\/20/g, 'border-purple-500/20');
  html = html.replace(/from-amber-500 to-amber-300/g, 'from-purple-600 via-amber-400 to-amber-300');

  // 3. Navbar
  html = html.replace(/>FARO DE LUZ<\/span>/g, '>CAMINOS DE FE</span>');
  html = html.replace(/>Búnker Táctico<\/span>/g, '>Búnker Pastoral</span>');
  html = html.replace(/bg-amber-500 hover:bg-amber-400 text-slate-950/g, 'bg-purple-600 hover:bg-purple-500 text-white');
  html = html.replace(/#ecotecnologia/g, '#cultos-campana');
  html = html.replace(/>Ecotecnología<\/a>/g, '>Cultos & Campañas</a>');
  html = html.replace(/>Organigrama<\/a>/g, '>Fichero Legal</a>');
  html = html.replace(/>Regla 70\/20\/10<\/a>/g, '>Sustento & Gracia</a>');

  // 4. Hero Section
  html = html.replace(/Base Comunitaria · Valle de Traslasierra, Córdoba/g, '✝️ Altar de Adoración & Cultos · Valle de Traslasierra, Córdoba');
  html = html.replace(/bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">Faro de Luz/g, 'bg-gradient-to-r from-purple-300 via-amber-300 to-amber-100 bg-clip-text text-transparent">Caminos de Fe');
  html = html.replace(/"2027 — Unión de fe, ecotecnología y comunidad en el corazón de Traslasierra\."/g, '"Levantando una generación que camina en fe y brilla con la luz del Evangelio."');
  html = html.replace(/🏔️ 1 Hectárea con Agua/g, '🏔️ Altar Central Mina Clavero');
  html = html.replace(/👥 6 Parejas Fundadoras/g, '⛺ Cultos de Campaña en Plazas');
  html = html.replace(/Deslizá para explorar la arquitectura/g, 'Deslizá para conocer la visión del Reino');

  // 5. Visión & Misión
  html = html.replace(/El fundamento que guía la convivencia, el trabajo y el desarrollo ecotecnológico en la montaña\./g, 'Volver a la sencillez de Jesús: gracia, comunión en las casas, restauración de familias y proclamación con excelencia.');
  html = html.replace(/Consolidarnos como un <strong>modelo pionero de comunidad de montaña autosustentable<\/strong>.*?de subsistencia\./s, 'Despertar en Traslasierra una <strong>generación consagrada que camine en fe genuina</strong>, demostrando el poder del Evangelio a través de relaciones sanas, familias unidas y un testimonio real de amor fraterno, libre de legalismos.');
  html = html.replace(/Construir y preservar un hábitat ecotecnológico donde <strong>6 familias fundadoras<\/strong>.*?amor fraterno\./s, 'Llevar la Palabra de Dios de forma gratuita y accesible: desde el <strong>Centro Base en Mina Clavero</strong> hacia <strong>células de comunión y mate en los hogares</strong> (El Nono, Panaholma, Las Rosas) y cultos masivos de campaña al aire libre, sustentados por <strong>ShopDigital</strong>.');
  html = html.replace(/Faro de inspiración ecotecnológica para Córdoba y la región\./g, 'Altar de adoración e intercesión permanente en la montaña.');
  html = html.replace(/Blindaje legal colectivo bajo Fideicomiso Co-Housing ante IPJ\./g, 'Iglesia horizontal y celular organizada bajo el amor de Cristo.');
  html = html.replace(/100% de sustento económico garantizado por servicios cloud e IA\./g, '100% de sustento económico provisto por ShopDigital.');
  html = html.replace(/Acción comunitaria activa a través de la Fundación y el Ministerio\./g, 'Acción comunitaria activa con la Fundación Valle de Luz.');

  // 6. Sustituir clases de tarjetas a glass-card-ministerio
  html = html.replace(/glass-card-faro/g, 'glass-card-ministerio');
  html = html.replace(/text-shadow-faro/g, 'text-shadow-ministerio');

  // 7. Calibración del Asistente Luz-02 -> Luz-04
  html = html.replace(/Luz-02/g, 'Luz-04');
  html = html.replace(/Ingeniera de Infraestructura y Asistente Oficial/g, 'Ingeniera de Sistemas de Culto, Audio y Legalidad');
  html = html.replace(/Asistente Oficial de Infraestructura/g, 'Asistente Oficial de Culto, Sonido & Legalidad');
  html = html.replace(/¡Hola! Soy Luz-04, ingeniera de infraestructura.*?de Traslasierra\./g, '¡La paz de Dios sea contigo! Soy Luz-04, ingeniera de sistemas de culto y sonido del Ministerio Caminos de Fe. ¿En qué puedo orientarte hoy?');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Mutado con éxito:", filePath);
}

mutateHtml(path.join(__dirname, '../index.html'));
mutateHtml(path.join(__dirname, '../public/index.html'));
