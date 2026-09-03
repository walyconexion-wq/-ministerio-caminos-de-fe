const fs = require('fs');
const path = require('path');

console.log("Iniciando mutación de galería para Ministerio Caminos de Fe...");

// 1. MUTACIÓN DE BUNKER.JS
function mutateBunkerJs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/faro_galeria_items/g, 'mcf_galeria_items');
  content = content.replace(/bunker_session/g, 'bunker_mcf_session');
  content = content.replace(/Comunidad Faro de Luz/g, 'Ministerio Caminos de Fe');

  // Insertar DELETED_KEY si no está
  if (!content.includes('DELETED_KEY')) {
    content = content.replace(
      /const STORAGE_KEY = 'mcf_galeria_items';/,
      "const STORAGE_KEY = 'mcf_galeria_items';\n  const DELETED_KEY = 'mcf_galeria_deleted_ids';"
    );
  }

  // Reemplazar initialMasterMedia
  const mcfMedia = `const initialMasterMedia = [
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

  content = content.replace(/const initialMasterMedia = \[[\s\S]*?\];/, mcfMedia);

  // Inyectar filtrado de deletedIds en loadGaleriaData
  content = content.replace(
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

  // Actualizar eliminación para persistir en DELETED_KEY
  content = content.replace(
    /\/\/ 2\. Eliminar de LocalStorage[\s\S]*?localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(updated\)\);/s,
    `// 1. Guardar en DELETED_KEY para borrado permanente
        const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
        if (!deleted.includes(id)) {
          deleted.push(id);
          localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
        }

        // 2. Eliminar de LocalStorage
        let localData = [];
        try {
          localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
          localData = [];
        }
        const updated = localData.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));`
  );

  // Restaurar por defecto
  content = content.replace(
    /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(initialMasterMedia\)\);/,
    "localStorage.removeItem(DELETED_KEY);\n      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMasterMedia));"
  );

  // Colores violeta real
  content = content.replace(/bg-cyan-500/g, 'bg-purple-600');
  content = content.replace(/text-cyan-300/g, 'text-purple-300');
  content = content.replace(/text-cyan-400/g, 'text-purple-300');
  content = content.replace(/border-cyan-500/g, 'border-purple-500');
  content = content.replace(/hover:border-cyan-400/g, 'hover:border-amber-400');
  content = content.replace(/hover:text-cyan-300/g, 'hover:text-amber-300');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Bunker JS mutado con éxito:", filePath);
}

// 2. MUTACIÓN DE SCROLLYTELLING.JS
function mutateScrollyJs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/faro_galeria_items/g, 'mcf_galeria_items');
  content = content.replace(/Comunidad Faro de Luz/g, 'Ministerio Caminos de Fe');

  if (!content.includes('DELETED_KEY')) {
    content = content.replace(
      /const STORAGE_KEY = 'mcf_galeria_items';/,
      "const STORAGE_KEY = 'mcf_galeria_items';\n    const DELETED_KEY = 'mcf_galeria_deleted_ids';"
    );
  }

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

  content = content.replace(/const defaultMedia = \[[\s\S]*?\];/, mcfDefaultMedia);

  // Filtrar con deleted en fetchMedia
  content = content.replace(
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

  // Colores en lightbox y tarjetas
  content = content.replace(/bg-amber-500/g, 'bg-purple-600');
  content = content.replace(/text-cyan-300/g, 'text-purple-300');
  content = content.replace(/bg-cyan-500/g, 'bg-purple-600');
  content = content.replace(/border-cyan-500/g, 'border-purple-500');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Scrollytelling JS mutado con éxito:", filePath);
}

// 3. MUTACIÓN DE BUNKER.HTML (CATEGORÍAS Y ESTILOS)
function mutateBunkerHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Metadatos y títulos
  html = html.replace(/<title>.*?<\/title>/gi, '<title>Búnker Pastoral & Técnico — Ministerio Caminos de Fe</title>');
  html = html.replace(/favicon-faro\.svg/g, 'favicon-mcf.svg');
  html = html.replace(/Comunidad Faro de Luz/g, 'Ministerio Caminos de Fe');
  html = html.replace(/Búnker Faro de Luz/g, 'Búnker Caminos de Fe');

  // Categorías del selector
  const selectCategorias = `<select id="media-categoria" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-purple-400">
                      <option value="Cultos & Alabanza">Cultos & Alabanza</option>
                      <option value="Campañas en la Montaña">Campañas en la Montaña</option>
                      <option value="Discipulado de Jóvenes">Discipulado de Jóvenes</option>
                      <option value="Testimonios de Fe">Testimonios de Fe</option>
                      <option value="Música & Sonido">Música & Sonido</option>
                    </select>`;

  html = html.replace(/<select id="media-categoria"[\s\S]*?<\/select>/, selectCategorias);

  // Reemplazar colores en bunker.html
  html = html.replace(/bg-cyan-500/g, 'bg-purple-600');
  html = html.replace(/text-cyan-300/g, 'text-purple-300');
  html = html.replace(/text-cyan-400/g, 'text-purple-300');
  html = html.replace(/border-cyan-500/g, 'border-purple-500');
  html = html.replace(/hover:border-cyan-400/g, 'hover:border-amber-400');
  html = html.replace(/hover:text-cyan-300/g, 'hover:text-amber-300');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Bunker HTML mutado con éxito:", filePath);
}

// 4. MUTACIÓN DE BOTONES DE FILTRO EN INDEX.HTML
function mutateIndexHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const filterButtonsHtml = `<div class="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button class="galeria-filter-btn px-4 py-2 rounded-xl bg-purple-600 text-white font-mono text-xs font-semibold transition-all border border-purple-400 shadow-md" data-categoria="todos">
              Todos los Testimonios
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-all border border-white/10" data-categoria="Cultos & Alabanza">
              Cultos & Alabanza
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-all border border-white/10" data-categoria="Campañas en la Montaña">
              Campañas en la Montaña
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-all border border-white/10" data-categoria="Discipulado de Jóvenes">
              Discipulado de Jóvenes
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-all border border-white/10" data-categoria="Testimonios de Fe">
              Testimonios de Fe
            </button>
            <button class="galeria-filter-btn px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-all border border-white/10" data-categoria="Música & Sonido">
              Música & Sonido
            </button>
          </div>
          <div id="galeria-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"></div>`;

  html = html.replace(/<div class="flex flex-wrap items-center justify-center gap-2 mb-8">[\s\S]*?<div id="galeria-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"><\/div>/, filterButtonsHtml);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Index HTML mutado con éxito:", filePath);
}

mutateBunkerJs(path.join(__dirname, '../src/bunker.js'));
mutateBunkerJs(path.join(__dirname, '../public/src/bunker.js'));
mutateScrollyJs(path.join(__dirname, '../src/scrollytelling.js'));
mutateScrollyJs(path.join(__dirname, '../public/src/scrollytelling.js'));
mutateBunkerHtml(path.join(__dirname, '../bunker.html'));
mutateBunkerHtml(path.join(__dirname, '../public/bunker.html'));
mutateIndexHtml(path.join(__dirname, '../index.html'));
mutateIndexHtml(path.join(__dirname, '../public/index.html'));

console.log("=== MUTACIÓN INTEGRAL DE GALERÍA FINALIZADA ===");
