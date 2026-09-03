const fs = require('fs');
const path = require('path');

console.log("=== CALIBRANDO GESTOR MAESTRO DE GALERÍA (MINISTERIO CAMINOS DE FE) ===");

// 1. ACTUALIZAR BUNKER.JS
function calibrateBunkerJs(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Key de storage unificada
  code = code.replace(/const STORAGE_KEY = ['"].*?['"];/, "const STORAGE_KEY = 'mcf_galeria_live_v1';\n  const DELETED_KEY = 'mcf_galeria_deleted_ids';");

  // Inyectar o asegurar 6 elementos iniciales del ministerio
  const mcfInitialMedia = `const initialMasterMedia = [
    {
      id: 'mcf-item-1',
      titulo: 'Altar de Adoración en la Montaña',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Cultos & Alabanza',
      descripcion: 'Encuentro de adoración, intercesión y comunión en el Domo Central de Traslasierra.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'mcf-item-2',
      titulo: 'Culto de Campaña al Aire Libre',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Campañas en la Montaña',
      descripcion: 'Despliegue móvil de sonido en plazas públicas y parajes del valle con la Hilux 4x4.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'mcf-item-3',
      titulo: 'Generación de Fuego — Discipulado Joven',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Discipulado de Jóvenes',
      descripcion: 'Jóvenes consagrados aprendiendo producción de medios, streaming y música contemporánea.',
      destacado: false,
      fecha: new Date().toISOString()
    },
    {
      id: 'mcf-item-4',
      titulo: 'Bautismos y Testimonio en el Río',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Testimonios de Fe',
      descripcion: 'Testimonios vivos de transformación y renovación espiritual en el río Panaholma.',
      destacado: false,
      fecha: new Date().toISOString()
    },
    {
      id: 'mcf-item-5',
      titulo: 'Consola Digital 32 CH & Búnker Acústico',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Música & Sonido',
      descripcion: 'Procesamiento DSP, monitoreo personal In-Ear y mezcla estéreo para streaming web.',
      destacado: false,
      fecha: new Date().toISOString()
    },
    {
      id: 'mcf-item-6',
      titulo: 'Transmisión de Culto en Vivo — Altar Central',
      tipo: 'video',
      url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      categoria: 'Cultos & Alabanza',
      descripcion: 'Registro audiovisual de cultos dominicales y mensajes del Reino transmitidos al valle.',
      destacado: true,
      fecha: new Date().toISOString()
    }
  ];`;

  code = code.replace(/const initialMasterMedia = \[[\s\S]*?\];/, mcfInitialMedia);

  // Filtrar items borrados permanentemente
  code = code.replace(
    /const localData = localStorage\.getItem\(STORAGE_KEY\);[\s\S]*?renderBunkerGaleria\(items\);/s,
    `const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData !== null) {
      try {
        items = JSON.parse(localData).filter(i => !deleted.includes(i.id));
      } catch (e) {
        items = initialMasterMedia.filter(i => !deleted.includes(i.id));
      }
    } else {
      items = initialMasterMedia.filter(i => !deleted.includes(i.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    renderBunkerGaleria(items);`
  );

  // Borrado permanente con DELETED_KEY
  code = code.replace(
    /const updated = localData\.filter\(i => i\.id !== id\);[\s\S]*?localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(updated\)\);/s,
    `const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
        if (!deleted.includes(id)) {
          deleted.push(id);
          localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
        }
        const updated = localData.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));`
  );

  // Restauración
  code = code.replace(
    /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(initialMasterMedia\)\);/,
    "localStorage.removeItem(DELETED_KEY);\n      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMasterMedia));"
  );

  // Colores violeta real y oro celestial
  code = code.replace(/bg-cyan-500/g, 'bg-purple-600');
  code = code.replace(/text-cyan-300/g, 'text-purple-300');
  code = code.replace(/text-cyan-400/g, 'text-purple-300');
  code = code.replace(/border-cyan-500/g, 'border-purple-500');

  fs.writeFileSync(filePath, code, 'utf8');
  console.log("Bunker JS calibrado:", filePath);
}

// 2. ACTUALIZAR SCROLLYTELLING.JS
function calibrateScrollyJs(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Key de storage unificada
  code = code.replace(/const STORAGE_KEY = ['"].*?['"];/g, "const STORAGE_KEY = 'mcf_galeria_live_v1';\n    const DELETED_KEY = 'mcf_galeria_deleted_ids';");

  // Inyectar o asegurar 6 elementos iniciales en scrollytelling
  const mcfDefaultMedia = `const defaultMedia = [
      {
        id: 'mcf-item-1',
        titulo: 'Altar de Adoración en la Montaña',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Cultos & Alabanza',
        descripcion: 'Encuentro de adoración, intercesión y comunión en el Domo Central de Traslasierra.',
        destacado: true
      },
      {
        id: 'mcf-item-2',
        titulo: 'Culto de Campaña al Aire Libre',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Campañas en la Montaña',
        descripcion: 'Despliegue móvil de sonido en plazas públicas y parajes del valle con la Hilux 4x4.',
        destacado: true
      },
      {
        id: 'mcf-item-3',
        titulo: 'Generación de Fuego — Discipulado Joven',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Discipulado de Jóvenes',
        descripcion: 'Jóvenes consagrados aprendiendo producción de medios, streaming y música contemporánea.',
        destacado: false
      },
      {
        id: 'mcf-item-4',
        titulo: 'Bautismos y Testimonio en el Río',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Testimonios de Fe',
        descripcion: 'Testimonios vivos de transformación y renovación espiritual en el río Panaholma.',
        destacado: false
      },
      {
        id: 'mcf-item-5',
        titulo: 'Consola Digital 32 CH & Búnker Acústico',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Música & Sonido',
        descripcion: 'Procesamiento DSP, monitoreo personal In-Ear y mezcla estéreo para streaming web.',
        destacado: false
      },
      {
        id: 'mcf-item-6',
        titulo: 'Transmisión de Culto en Vivo — Altar Central',
        tipo: 'video',
        url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        categoria: 'Cultos & Alabanza',
        descripcion: 'Registro audiovisual de cultos dominicales y mensajes del Reino transmitidos al valle.',
        destacado: true
      }
    ];`;

  code = code.replace(/const defaultMedia = \[[\s\S]*?\];/, mcfDefaultMedia);

  // Filtrado de deleted en fetchMedia
  code = code.replace(
    /const local = localStorage\.getItem\(STORAGE_KEY\);[\s\S]*?currentList = fetched \|\| defaultMedia;\s*render\(\);/s,
    `const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
      const local = localStorage.getItem(STORAGE_KEY);
      if (local !== null) {
        try {
          fetched = JSON.parse(local).filter(i => !deleted.includes(i.id));
        } catch (e) {
          fetched = defaultMedia.filter(i => !deleted.includes(i.id));
        }
      } else {
        fetched = defaultMedia.filter(i => !deleted.includes(i.id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fetched));
      }

      currentList = fetched || defaultMedia;
      render();`
  );

  code = code.replace(/bg-amber-500/g, 'bg-purple-600');
  code = code.replace(/text-cyan-300/g, 'text-purple-300');
  code = code.replace(/bg-cyan-500/g, 'bg-purple-600');
  code = code.replace(/border-cyan-500/g, 'border-purple-500');

  fs.writeFileSync(filePath, code, 'utf8');
  console.log("Scrollytelling JS calibrado:", filePath);
}

// 3. ACTUALIZAR BUNKER.HTML
function calibrateBunkerHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Selector de categorías en bunker.html
  const selectCategorias = `<select id="media-categoria" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-purple-400">
                      <option value="Cultos & Alabanza">Cultos & Alabanza</option>
                      <option value="Campañas en la Montaña">Campañas en la Montaña</option>
                      <option value="Discipulado de Jóvenes">Discipulado de Jóvenes</option>
                      <option value="Testimonios de Fe">Testimonios de Fe</option>
                      <option value="Música & Sonido">Música & Sonido</option>
                    </select>`;

  html = html.replace(/<select id="media-categoria"[\s\S]*?<\/select>/, selectCategorias);
  html = html.replace(/bg-cyan-500/g, 'bg-purple-600');
  html = html.replace(/text-cyan-300/g, 'text-purple-300');
  html = html.replace(/text-cyan-400/g, 'text-purple-300');
  html = html.replace(/border-cyan-500/g, 'border-purple-500');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Bunker HTML calibrado:", filePath);
}

// 4. ACTUALIZAR INDEX.HTML
function calibrateIndexHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Reemplazar encabezado y botones de filtro de la galería
  const gallerySection = `<!-- ESCENA NUEVA: GALERÍA MULTIMEDIA Y TESTIMONIOS DE FE (#galeria) -->
      <section id="galeria" class="min-h-[140vh] flex flex-col items-center justify-center px-4 py-16">
        <div class="max-w-6xl w-full space-y-8">
          
          <!-- Encabezado de Galería -->
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono tracking-widest uppercase mb-3">
              📸 Testimonios Audiovisuales · Altar de Fe 2027
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase drop-shadow-xl mb-3">
              Galería de Adoración & Cultos
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 font-light max-w-2xl mx-auto text-shadow-ministerio leading-relaxed">
              Explorá los testimonios en video y fotografías del altar en la montaña, las campañas al aire libre en Traslasierra y la Generación de Fuego. Se administra y actualiza en tiempo real desde el Búnker Pastoral.
            </p>
          </div>

          <!-- BOTONES DE FILTRO -->
          <div class="flex flex-wrap items-center justify-center gap-2.5">
            <button class="galeria-filter-btn active px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-purple-600 text-white shadow-md transition-all border border-purple-400" data-category="todos">
              Todos los Testimonios
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-ministerio hover:border-purple-400/50 hover:text-white transition-all" data-category="Cultos & Alabanza">
              ✝️ Cultos & Alabanza
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-ministerio hover:border-purple-400/50 hover:text-white transition-all" data-category="Campañas en la Montaña">
              ⛺ Campañas en la Montaña
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-ministerio hover:border-purple-400/50 hover:text-white transition-all" data-category="Discipulado de Jóvenes">
              ⚡ Discipulado de Jóvenes
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-ministerio hover:border-purple-400/50 hover:text-white transition-all" data-category="Testimonios de Fe">
              🕊️ Testimonios de Fe
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl text-xs font-mono text-slate-300 glass-card-ministerio hover:border-purple-400/50 hover:text-white transition-all" data-category="Música & Sonido">
              🔊 Música & Sonido
            </button>
          </div>

          <!-- GRILLA DINÁMICA DE LA GALERÍA -->
          <div id="galeria-public-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Renderizado dinámicamente desde Supabase por scrollytelling.js -->
          </div>

          <!-- Pie informativo -->
          <div class="text-center pt-2 text-xs text-slate-400 font-mono">
            <span>Sincronización en vivo con Supabase Cloud y Búnker Pastoral</span>
          </div>

        </div>
      </section>`;

  html = html.replace(/<!-- ESCENA NUEVA: GALERÍA MULTIMEDIA Y AVANCES DE OBRA \(#galeria\) -->[\s\S]*?<\/section>/, gallerySection);
  html = html.replace(/<!-- ESCENA NUEVA: GALERÍA MULTIMEDIA Y TESTIMONIOS DE FE \(#galeria\) -->[\s\S]*?<\/section>/, gallerySection);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Index HTML calibrado:", filePath);
}

calibrateBunkerJs(path.join(__dirname, '../src/bunker.js'));
calibrateBunkerJs(path.join(__dirname, '../public/src/bunker.js'));
calibrateScrollyJs(path.join(__dirname, '../src/scrollytelling.js'));
calibrateScrollyJs(path.join(__dirname, '../public/src/scrollytelling.js'));
calibrateBunkerHtml(path.join(__dirname, '../bunker.html'));
calibrateBunkerHtml(path.join(__dirname, '../public/bunker.html'));
calibrateIndexHtml(path.join(__dirname, '../index.html'));
calibrateIndexHtml(path.join(__dirname, '../public/index.html'));

console.log("=== SINCRONIZACIÓN MAESTRA DE GALERÍA FINALIZADA CON ÉXITO ===");
