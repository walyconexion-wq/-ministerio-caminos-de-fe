const fs = require('fs');

const publicGaleriaJs = `
  // ==========================================
  // RENDERIZADOR DE GALERÍA PÚBLICA (SUPABASE)
  // ==========================================
  const galeriaGrid = document.getElementById('galeria-public-grid');
  const filterBtns = document.querySelectorAll('.galeria-filter-btn');
  const lightboxModal = document.getElementById('galeria-lightbox');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxBadge = document.getElementById('lightbox-badge');

  const defaultPublicMedia = [
    {
      id: 'm1',
      titulo: 'Emblema Oficial Faro de Luz 3D',
      tipo: 'foto',
      url: 'https://farodeluz.dpdns.org/og-faro.jpg',
      categoria: 'Montaña & Predio',
      descripcion: 'Insignia dorada en relieve 3D sobre metal oscuro y haces de luz.',
      destacado: true
    },
    {
      id: 'm2',
      titulo: 'Amanecer en las Altas Cumbres',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Montaña & Predio',
      descripcion: 'Vista panorámica de las sierras cordobesas donde se asienta la comunidad.',
      destacado: true
    },
    {
      id: 'm3',
      titulo: 'Domo Geodésico y Búnker Central',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Domo & Obra',
      descripcion: 'Estructura geodésica central de frecuencia 4/5 para reuniones y telecomunicaciones.',
      destacado: true
    },
    {
      id: 'm4',
      titulo: 'Microrred Solar Fotovoltaica 18.4kW',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Ecotecnología',
      descripcion: 'Generación solar con banco de baterías de litio 48V para autonomía continua.',
      destacado: false
    },
    {
      id: 'm5',
      titulo: 'Viviendas Modulares 40ft High Cube',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Domo & Obra',
      descripcion: 'Montaje sobre pilotes antisísmicos con aislamiento térmico de poliuretano proyectado.',
      destacado: false
    },
    {
      id: 'm6',
      titulo: 'Recorrido Panorámico del Valle',
      tipo: 'video',
      url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      categoria: 'Montaña & Predio',
      descripcion: 'Registro audiovisual de la geografía y entorno natural de Traslasierra.',
      destacado: true
    }
  ];

  let currentMediaList = defaultPublicMedia;
  let activeCategory = 'todos';

  async function fetchPublicGaleria() {
    if (!galeriaGrid) return;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('galeria_multimedia')
          .select('*')
          .order('fecha', { ascending: false });

        if (!error && data && data.length > 0) {
          currentMediaList = data;
        } else {
          currentMediaList = defaultPublicMedia;
        }
      } catch (e) {
        currentMediaList = defaultPublicMedia;
      }
    } else {
      currentMediaList = defaultPublicMedia;
    }

    renderPublicGaleria();
  }

  function renderPublicGaleria() {
    if (!galeriaGrid) return;
    galeriaGrid.innerHTML = '';

    const filtered = currentMediaList.filter(item => {
      if (activeCategory === 'todos') return true;
      if (activeCategory === 'video') return item.tipo === 'video';
      return item.categoria === activeCategory;
    });

    if (filtered.length === 0) {
      galeriaGrid.innerHTML = '<div class="col-span-full text-center p-8 text-slate-400 font-mono text-xs">No hay medios en esta categoría por el momento.</div>';
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-card-faro rounded-3xl overflow-hidden shadow-2xl hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between transform hover:scale-[1.02] cursor-pointer';

      const isVideo = item.tipo === 'video';
      const thumbnailHtml = isVideo
        ? \`<div class="relative w-full h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
             <div class="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 z-20 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-lg">
               ▶
             </div>
             <span class="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-cyan-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">
               🎬 Video
             </span>
           </div>\`
        : \`<div class="relative w-full h-48 bg-slate-950 overflow-hidden">
             <img src="\${item.url}" alt="\${item.titulo}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
             <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">
               📷 Foto
             </span>
           </div>\`;

      card.innerHTML = \`
        \${thumbnailHtml}
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-mono text-[10px] uppercase">
                \${item.categoria}
              </span>
              \${item.destacado ? '<span class="text-amber-400 text-xs">⭐ Destacado</span>' : ''}
            </div>
            <h4 class="font-serif text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">
              \${item.titulo}
            </h4>
            <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed text-shadow-faro">
              \${item.descripcion || 'Registro oficial de la Comunidad Faro de Luz.'}
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <span>Ver en Pantalla Completa</span>
            <span>↗</span>
          </div>
        </div>
      \`;

      card.addEventListener('click', () => openLightbox(item));
      galeriaGrid.appendChild(card);
    });
  }

  function openLightbox(item) {
    if (!lightboxModal) return;

    lightboxTitle.textContent = item.titulo;
    lightboxDesc.textContent = item.descripcion || 'Registro oficial de la base de montaña.';
    lightboxBadge.textContent = item.tipo === 'video' ? '🎬 Video' : '📷 Fotografía';
    lightboxBadge.className = item.tipo === 'video'
      ? 'px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase'
      : 'px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase';

    if (item.tipo === 'video') {
      let embedUrl = item.url;
      if (embedUrl.includes('watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/');
      }
      lightboxContent.innerHTML = \`<iframe src="\${embedUrl}?autoplay=1" class="w-full h-[50vh] sm:h-[60vh] border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\`;
    } else {
      lightboxContent.innerHTML = \`<img src="\${item.url}" alt="\${item.titulo}" class="max-h-[65vh] w-auto object-contain rounded-xl p-2" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">\`;
    }

    lightboxModal.classList.remove('hidden');
  }

  if (btnCloseLightbox) {
    btnCloseLightbox.addEventListener('click', () => {
      lightboxModal.classList.add('hidden');
      lightboxContent.innerHTML = '';
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.add('hidden');
        lightboxContent.innerHTML = '';
      }
    });
  }

  // Filtros de categoría
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'active');
        b.classList.add('glass-card-faro', 'text-slate-300');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'active');
      btn.classList.remove('glass-card-faro', 'text-slate-300');

      activeCategory = btn.getAttribute('data-category');
      renderPublicGaleria();
    });
  });

  // Carga inicial
  fetchPublicGaleria();
`;

function injectScrollytellingGaleria(path) {
  let code = fs.readFileSync(path, 'utf8');

  if (!code.includes('RENDERIZADOR DE GALERÍA PÚBLICA')) {
    code = code.replace(
      'window.addEventListener(\'DOMContentLoaded\', initScrollytelling);',
      publicGaleriaJs.trim() + '\n\nwindow.addEventListener(\'DOMContentLoaded\', initScrollytelling);'
    );
    if (!code.includes('RENDERIZADOR DE GALERÍA PÚBLICA')) {
      code += '\n' + publicGaleriaJs;
    }
  }

  fs.writeFileSync(path, code, 'utf8');
  console.log('scrollytelling.js actualizado en:', path);
}

injectScrollytellingGaleria('src/scrollytelling.js');
injectScrollytellingGaleria('public/src/scrollytelling.js');
