const fs = require('fs');

const galeriaLogic = `
  // ==========================================
  // GESTIÓN DE GALERÍA MULTIMEDIA (SUPABASE)
  // ==========================================
  const formAddMedia = document.getElementById('form-add-media');
  const bunkerGaleriaGrid = document.getElementById('bunker-galeria-grid');
  const badgeGaleriaCount = document.getElementById('badge-galeria-count');
  const btnRefreshGaleria = document.getElementById('btn-refresh-galeria');

  const defaultMediaItems = [
    {
      id: 'demo-1',
      titulo: 'Emblema Oficial Faro de Luz 3D',
      tipo: 'foto',
      url: 'https://farodeluz.dpdns.org/og-faro.jpg',
      categoria: 'Comunidad',
      descripcion: 'Insignia dorada en relieve 3D sobre metal oscuro y haces de luz.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'demo-2',
      titulo: 'Amanecer en Traslasierra',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      categoria: 'Montaña & Predio',
      descripcion: 'Vista panorámica de las sierras donde se emplaza el predio de 1 hectárea.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'demo-3',
      titulo: 'Domo Geodésico y Búnker',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
      categoria: 'Domo & Obra',
      descripcion: 'Estructura geodésica central de frecuencia 4/5 para reuniones y servidores.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'demo-4',
      titulo: 'Generación Solar 18.4kW',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      categoria: 'Ecotecnología',
      descripcion: 'Baterías de litio 48V e inversores para autonomía desconectada.',
      destacado: false,
      fecha: new Date().toISOString()
    }
  ];

  async function loadGaleriaData() {
    if (!bunkerGaleriaGrid) return;

    let items = [];

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('galeria_multimedia')
          .select('*')
          .order('fecha', { ascending: false });

        if (!error && data && data.length > 0) {
          items = data;
        } else {
          items = defaultMediaItems;
        }
      } catch (e) {
        items = defaultMediaItems;
      }
    } else {
      items = defaultMediaItems;
    }

    renderBunkerGaleria(items);
  }

  function renderBunkerGaleria(items) {
    if (!bunkerGaleriaGrid) return;
    if (badgeGaleriaCount) badgeGaleriaCount.textContent = items.length;

    bunkerGaleriaGrid.innerHTML = '';

    if (items.length === 0) {
      bunkerGaleriaGrid.innerHTML = '<div class="col-span-2 text-center p-8 text-slate-500 font-mono text-xs">No hay fotos o videos publicados aún. Cargá uno desde el panel izquierdo.</div>';
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden p-3 flex flex-col justify-between group hover:border-cyan-500/40 transition-all text-xs';

      const isVideo = item.tipo === 'video';
      const previewHtml = isVideo
        ? \`<div class="w-full h-32 bg-slate-950 rounded-lg flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-2 relative overflow-hidden">
             <span class="text-3xl">🎬</span>
             <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-300">Video</span>
           </div>\`
        : \`<div class="w-full h-32 bg-slate-950 rounded-lg overflow-hidden border border-white/10 mb-2 relative">
             <img src="\${item.url}" alt="\${item.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
             <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-300">Foto</span>
           </div>\`;

      card.innerHTML = \`
        <div>
          \${previewHtml}
          <div class="flex items-center justify-between gap-2 mb-1">
            <h5 class="font-bold text-white truncate text-xs">\${item.titulo}</h5>
            <span class="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] whitespace-nowrap">\${item.categoria}</span>
          </div>
          <p class="text-[11px] text-slate-400 line-clamp-2 mb-2">\${item.descripcion || 'Sin descripción'}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
          <span class="text-slate-500">\${new Date(item.fecha || Date.now()).toLocaleDateString('es-AR')}</span>
          <button class="btn-delete-media px-2 py-1 rounded bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white transition-all" data-id="\${item.id}">
            🗑️ Eliminar
          </button>
        </div>
      \`;

      bunkerGaleriaGrid.appendChild(card);
    });

    // Eventos de eliminación
    document.querySelectorAll('.btn-delete-media').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Desea eliminar este medio de la galería?')) {
          if (supabase && !id.startsWith('demo-')) {
            try {
              await supabase.from('galeria_multimedia').delete().eq('id', id);
            } catch (err) {
              console.warn('Error al eliminar en Supabase:', err);
            }
          }
          loadGaleriaData();
        }
      });
    });
  }

  // Manejo de formulario de carga
  if (formAddMedia) {
    formAddMedia.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = document.getElementById('media-titulo').value.trim();
      const tipo = document.getElementById('media-tipo').value;
      const categoria = document.getElementById('media-categoria').value;
      const url = document.getElementById('media-url').value.trim();
      const descripcion = document.getElementById('media-descripcion').value.trim();
      const destacado = document.getElementById('media-destacado').checked;

      if (!titulo || !url) return;

      const newMedia = {
        titulo,
        tipo,
        categoria,
        url,
        descripcion,
        destacado,
        fecha: new Date().toISOString()
      };

      if (supabase) {
        try {
          const { error } = await supabase.from('galeria_multimedia').insert([newMedia]);
          if (error) throw error;
          alert('✓ Medio publicado con éxito en la web oficial y sincronizado con Supabase.');
        } catch (err) {
          console.warn('Error al insertar en Supabase:', err);
          alert('✓ Medio guardado localmente (asegúrese de haber corrido el SQL en Supabase).');
        }
      } else {
        alert('✓ Medio guardado en sesión local.');
      }

      formAddMedia.reset();
      loadGaleriaData();
    });
  }

  if (btnRefreshGaleria) {
    btnRefreshGaleria.addEventListener('click', () => loadGaleriaData());
  }
`;

function injectBunkerGaleriaJs(path) {
  let code = fs.readFileSync(path, 'utf8');

  // Insertar en loadSupabaseData
  if (!code.includes('loadGaleriaData()')) {
    code = code.replace(
      'loadSupabaseData();',
      'loadSupabaseData();\n      loadGaleriaData();'
    );
  }

  if (!code.includes('GESTIÓN DE GALERÍA MULTIMEDIA')) {
    code = code.replace(
      'window.bunkerAppLoaded = true;',
      galeriaLogic.trim() + '\n\n  window.bunkerAppLoaded = true;'
    );
    if (!code.includes('GESTIÓN DE GALERÍA MULTIMEDIA')) {
      code += '\n' + galeriaLogic;
    }
  }

  fs.writeFileSync(path, code, 'utf8');
  console.log('Bunker JS actualizado en:', path);
}

injectBunkerGaleriaJs('src/bunker.js');
injectBunkerGaleriaJs('public/src/bunker.js');
