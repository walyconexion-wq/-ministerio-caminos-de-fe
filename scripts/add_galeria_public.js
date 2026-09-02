const fs = require('fs');

const galeriaPublicSection = `
      <!-- ESCENA NUEVA: GALERÍA MULTIMEDIA Y AVANCES DE OBRA (#galeria) -->
      <section id="galeria" class="min-h-[140vh] flex flex-col items-center justify-center px-4 py-16">
        <div class="max-w-6xl w-full space-y-8">
          
          <!-- Encabezado de Galería -->
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase mb-3">
              📸 Registros Audiovisuales · Traslasierra 2027
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase drop-shadow-xl mb-3">
              Galería Multimedia & Avances de Obra
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 font-light max-w-2xl mx-auto text-shadow-faro leading-relaxed">
              Explorá las fotografías de las sierras, el domo geodésico y el desarrollo del hábitat modular. Los registros se administran y actualizan en tiempo real desde el Búnker.
            </p>
          </div>

          <!-- BOTONES DE FILTRO -->
          <div class="flex flex-wrap items-center justify-center gap-2.5">
            <button class="galeria-filter-btn active px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-amber-500 text-slate-950 shadow-md transition-all" data-category="todos">
              Todos
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-faro hover:border-amber-400/40 hover:text-white transition-all" data-category="Montaña & Predio">
              🏔️ Montaña & Predio
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-faro hover:border-amber-400/40 hover:text-white transition-all" data-category="Domo & Obra">
              🏡 Domo & Obra
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-faro hover:border-amber-400/40 hover:text-white transition-all" data-category="Ecotecnología">
              🔋 Ecotecnología
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-faro hover:border-cyan-400/40 hover:text-white transition-all" data-category="video">
              🎬 Videos & Dron
            </button>
          </div>

          <!-- GRILLA DINÁMICA DE LA GALERÍA -->
          <div id="galeria-public-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Renderizado dinámicamente desde Supabase por scrollytelling.js -->
          </div>

          <!-- Pie informativo -->
          <div class="text-center pt-2 text-xs text-slate-400 font-mono">
            <span>Sincronización en vivo con Supabase Cloud y Búnker Táctico</span>
          </div>

        </div>
      </section>

      <!-- MODAL LIGHTBOX PARA FOTOS Y VIDEOS -->
      <div id="galeria-lightbox" class="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 hidden">
        <div class="relative max-w-4xl w-full bg-[#080C14] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl">
          <button id="btn-close-lightbox" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-all border border-white/20">
            ✕
          </button>
          <div id="lightbox-content" class="w-full flex flex-col items-center justify-center min-h-[300px] max-h-[80vh]">
            <!-- Contenido dinámico (Img o Iframe de video) -->
          </div>
          <div class="p-5 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h4 id="lightbox-title" class="font-bold text-white text-base">Título del medio</h4>
              <p id="lightbox-desc" class="text-xs text-slate-400">Descripción</p>
            </div>
            <span id="lightbox-badge" class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase">
              Foto
            </span>
          </div>
        </div>
      </div>
`;

function injectGaleriaPublic(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Agregar a Navbar
  if (!html.includes('href="#galeria"')) {
    html = html.replace(
      '<a href="#tablero-maestro"',
      '<a href="#galeria" class="hover:text-amber-300 transition-colors">Galería</a>\n        <a href="#tablero-maestro"'
    );
  }

  // Insertar sección antes de Escena 5: Tablero Maestro de Bunkeres
  if (!html.includes('id="galeria"')) {
    html = html.replace(
      '<!-- ESCENA 5: TABLERO MAESTRO',
      galeriaPublicSection.trim() + '\n\n      <!-- ESCENA 5: TABLERO MAESTRO'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Sección Galería agregada a:', filePath);
}

injectGaleriaPublic('index.html');
injectGaleriaPublic('public/index.html');
