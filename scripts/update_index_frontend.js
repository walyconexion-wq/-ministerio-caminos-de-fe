const fs = require('fs');
const path = require('path');

function updateHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Portada: Comunidad -> Ministerio
  html = html.replace(
    /Comunidad<br>\s*<span class="bg-gradient-to-r from-purple-300 via-amber-300 to-amber-100 bg-clip-text text-transparent">Caminos de Fe<\/span>/gi,
    'Ministerio<br><span class="bg-gradient-to-r from-purple-300 via-amber-300 to-amber-100 bg-clip-text text-transparent">Caminos de Fe</span>'
  );

  // 2. Sección cultos-campana (ID de sección y alias)
  html = html.replace(
    /<section id="ecotecnologia" class="min-h-\[140vh\]/g,
    '<section id="cultos-campana" data-alias="ecotecnologia" class="min-h-[140vh]'
  );

  // 3. Navbar con clases nav-link para scrollspy
  const oldNavbarLinks = `<div class="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-300">
        <a href="#mision-vision" class="hover:text-amber-300 transition-colors">Visión & Misión</a>
        <a href="#ecosistema" class="hover:text-cyan-300 transition-colors">Ecosistema</a>
        <a href="#cultos-campana" class="hover:text-amber-300 transition-colors">Cultos & Campañas</a>
        <a href="#gobernanza" class="hover:text-amber-300 transition-colors">Fichero Legal</a>
        <a href="#regla-tiempo" class="hover:text-amber-300 transition-colors">Sustento & Gracia</a>
        <a href="#ubicacion" class="hover:text-amber-300 transition-colors">Ubicación</a>
        <a href="#galeria" class="hover:text-amber-300 transition-colors">Galería</a>
        <a href="#tablero-maestro" class="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Tablero de Búnkeres
        </a>
        <a href="#formacion" class="hover:text-amber-300 transition-colors">Centro de Formación</a>
      </div>`;

  const newNavbarLinks = `<div class="hidden lg:flex items-center gap-2.5 xl:gap-4 text-xs font-medium text-slate-300" id="navbar-links">
        <a href="#mision-vision" class="nav-link hover:text-amber-300">Visión & Misión</a>
        <a href="#ecosistema" class="nav-link hover:text-cyan-300">Ecosistema</a>
        <a href="#cultos-campana" class="nav-link hover:text-amber-300">Cultos & Campañas</a>
        <a href="#gobernanza" class="nav-link hover:text-amber-300">Fichero Legal</a>
        <a href="#regla-tiempo" class="nav-link hover:text-amber-300">Sustento & Gracia</a>
        <a href="#ubicacion" class="nav-link hover:text-amber-300">Ubicación</a>
        <a href="#galeria" class="nav-link hover:text-amber-300">Galería</a>
        <a href="#tablero-maestro" class="nav-link hover:text-cyan-300 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Tablero
        </a>
        <a href="#formacion" class="nav-link hover:text-amber-300">Formación</a>
      </div>`;

  html = html.replace(oldNavbarLinks, newNavbarLinks);

  // 4. Asistente flotante: Logotipo de la cruz y nombre "Asistente Luz"
  // Reemplazar botón flotante
  html = html.replace(
    /<div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-serif font-bold text-xs shadow-md shadow-amber-500\/20">\s*L-04\s*<\/div>/g,
    `<div class="w-9 h-9 rounded-xl overflow-hidden border border-amber-400/50 shadow-md shadow-amber-500/20 flex items-center justify-center bg-black/60 p-1">
          <img src="/favicon-mcf.svg" alt="Cruz Ministerio" class="w-full h-full object-contain">
        </div>`
  );

  // Reemplazar header del chat
  html = html.replace(
    /<div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-serif font-bold text-sm shadow-md shadow-amber-500\/20">\s*L-04\s*<\/div>/g,
    `<div class="w-10 h-10 rounded-2xl overflow-hidden border border-amber-400/50 shadow-md shadow-amber-500/20 flex items-center justify-center bg-black/60 p-1.5">
              <img src="/favicon-mcf.svg" alt="Cruz Ministerio" class="w-full h-full object-contain">
            </div>`
  );

  // Reemplazar avatar de mensaje inicial
  html = html.replace(
    /<div class="w-6 h-6 rounded-lg bg-amber-500\/20 border border-amber-500\/40 text-amber-300 flex items-center justify-center text-\[10px\] font-bold shrink-0 mt-0.5">\s*L\s*<\/div>/g,
    `<div class="w-7 h-7 rounded-lg overflow-hidden border border-amber-500/40 p-1 bg-black/50 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
            <img src="/favicon-mcf.svg" alt="Cruz" class="w-full h-full object-contain">
          </div>`
  );

  // Cambiar Asistente Luz-04 -> Asistente Luz
  html = html.replace(/Asistente Luz-04/g, 'Asistente Luz');
  html = html.replace(/la ingeniera de sistemas de culto y sonido del Ministerio Caminos de Fe/g, 'del equipo de sistemas de culto y sonido del Ministerio Caminos de Fe');
  html = html.replace(/placeholder="Escribí tu consulta a Luz-04\.\.\."/g, 'placeholder="Escribí tu consulta al Asistente Luz..."');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("HTML actualizado en:", filePath);
}

updateHtml('index.html');
updateHtml('public/index.html');
