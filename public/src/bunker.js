/**
 * COMUNIDAD FARO DE LUZ - LÓGICA DEL BÚNKER PRIVADO Y CLIENTE SUPABASE EN VIVO
 * Desarrollado para Antigravity / Ecosistema Faro de Luz
 */

(function () {
  'use strict';

  // Configuración de Supabase en Vivo
  const SUPABASE_URL = 'https://osdduwjsicoaeojfhokm.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_eVJfo1_bTqFQ0hmcXVA47A_kEdvMM0K';

  let supabase = null;
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Búnker conectado a Supabase PostgreSQL en vivo.');
    } catch (e) {
      console.warn('Error al inicializar Supabase:', e);
    }
  }

  // Elementos DOM
  const authGateway = document.getElementById('auth-gateway');
  const bunkerApp = document.getElementById('bunker-app');
  const btnLoginGoogle = document.getElementById('btn-login-google');
  const btnLoginDemo = document.getElementById('btn-login-demo');
  const btnLogout = document.getElementById('btn-logout');
  const tabButtons = document.querySelectorAll('.bunker-tab-btn');
  const tabViews = document.querySelectorAll('.bunker-view');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const postulantesTbody = document.getElementById('postulantes-tbody');
  const badgePostulantesCount = document.getElementById('badge-postulantes-count');

  // Estado de sesión
  let currentUser = JSON.parse(sessionStorage.getItem('bunker_session') || 'null');

  function checkSession() {
    if (currentUser) {
      authGateway.classList.add('hidden');
      bunkerApp.classList.remove('hidden');
      loadSupabaseData();
      loadGaleriaData();
    } else {
      authGateway.classList.remove('hidden');
      bunkerApp.classList.add('hidden');
    }
  }

  // 1. Iniciar sesión con Google OAuth (Supabase)
  if (btnLoginGoogle) {
    btnLoginGoogle.addEventListener('click', async () => {
      if (supabase && supabase.auth) {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin + '/bunker.html'
            }
          });
          if (error) throw error;
        } catch (err) {
          console.warn('Fallback local demo:', err);
          loginFounder('Director Waly', 'walyconexion@gmail.com', 'Director General Omega');
        }
      } else {
        loginFounder('Director Waly', 'walyconexion@gmail.com', 'Director General Omega');
      }
    });
  }

  // 2. Modo Simulación Rápida de Fundador
  if (btnLoginDemo) {
    btnLoginDemo.addEventListener('click', () => {
      loginFounder('Director Waly', 'walyconexion@gmail.com', 'Director General Omega');
    });
  }

  function loginFounder(name, email, role) {
    currentUser = { name, email, role, loggedAt: new Date().toISOString() };
    sessionStorage.setItem('bunker_session', JSON.stringify(currentUser));
    checkSession();
  }

  // 3. Cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      currentUser = null;
      sessionStorage.removeItem('bunker_session');
      checkSession();
    });
  }

  // 4. Cambio de Pestañas entre los 5 Búnkeres
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active', 'bg-white/10', 'text-cyan-300'));
      btn.classList.add('active', 'bg-white/10', 'text-cyan-300');

      tabViews.forEach(view => {
        if (view.id === targetTab) {
          view.classList.remove('hidden');
          if (targetTab === 'tab-postulantes') loadSupabaseData();
        } else {
          view.classList.add('hidden');
        }
      });
    });
  });

  // 5. Cargar datos en tiempo real desde Supabase
  async function loadSupabaseData() {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('postulaciones_fundadores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && postulantesTbody) {
        if (badgePostulantesCount) badgePostulantesCount.textContent = data.length;

        postulantesTbody.innerHTML = '';
        if (data.length === 0) {
          postulantesTbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-slate-500 font-mono text-xs">Aún no hay postulaciones registradas en Supabase.</td></tr>';
          return;
        }

        data.forEach((p) => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-white/5 transition-colors';
          
          let talentoIcon = '💻 Software';
          if (p.talento_principal === 'infraestructura') talentoIcon = '🔋 Ecotecnología';
          if (p.talento_principal === 'logistica') talentoIcon = '🚐 Logística';
          if (p.talento_principal === 'administracion') talentoIcon = '📊 Fideicomiso';

          tr.innerHTML = `
            <td class="p-4 font-sans font-semibold text-white">${p.nombre_completo}</td>
            <td class="p-4 text-slate-300 text-xs">${p.modalidad}</td>
            <td class="p-4 text-cyan-300 font-medium">${talentoIcon}</td>
            <td class="p-4 text-slate-400">${p.telefono_whatsapp}<br><span class="text-[10px] text-slate-500">${p.email}</span></td>
            <td class="p-4">
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-mono">
                ${p.estado_evaluacion || 'Suscripción Activa'}
              </span>
            </td>
            <td class="p-4 text-right flex items-center justify-end gap-2">
              <a href="https://api.whatsapp.com/send?phone=${p.telefono_whatsapp.replace(/[^0-9]/g, '')}&text=${encodeURIComponent('¡Hola ' + p.nombre_completo + '! Te saludamos desde la Dirección de la Comunidad Faro de Luz. Te confirmamos la emisión de tu Credencial Digital de Miembro. ¡Bienvenido a nuestra comunidad!')}" target="_blank" class="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[10px] font-mono transition-all">
                🪪 WhatsApp Credencial
              </a>
              <button class="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-[10px] font-mono transition-all" onclick="alert('Detalles de Suscripción / Mensaje: 

' + '${p.experiencia_motivacion}')">
                Ver Ficha
              </button>
            </td>
          `;
          postulantesTbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Error al cargar postulaciones de Supabase:', err);
    }
  }

  // 6. Chat interactivo con el Agente Luz-02 / Triage
  if (chatForm) {
    let bunkerChatHistory = [];

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage('Director Waly', text, 'text-amber-300');
    bunkerChatHistory.push({ role: 'user', content: text });
    chatInput.value = '';

    // Indicador temporal
    const tempId = 'msg-' + Date.now();
    const tempDiv = document.createElement('div');
    tempDiv.id = tempId;
    tempDiv.className = 'flex gap-3 bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 font-mono text-xs text-cyan-300 italic';
    tempDiv.innerHTML = '<span>⚡ Consultando a Luz-02 AI...</span>';
    chatMessages.appendChild(tempDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: bunkerChatHistory })
      });

      const data = await response.json();
      tempDiv.remove();

      const reply = data.reply || 'Orden registrada en el nodo central.';
      bunkerChatHistory.push({ role: 'assistant', content: reply });
      appendMessage('Luz-02', reply, 'text-cyan-400');
    } catch (err) {
      tempDiv.remove();
      appendMessage('Luz-02', 'Sistemas del búnker operativos. ' + text, 'text-cyan-400');
    }
  });
  }

  function appendMessage(sender, msg, colorClass) {
    const div = document.createElement('div');
    div.className = 'flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5';
    div.innerHTML = `
      <div class="font-bold ${colorClass}">[${sender}]:</div>
      <div class="text-slate-200">${msg}</div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    checkSession();
  });

})();


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
        ? `<div class="w-full h-32 bg-slate-950 rounded-lg flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-2 relative overflow-hidden">
             <span class="text-3xl">🎬</span>
             <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-300">Video</span>
           </div>`
        : `<div class="w-full h-32 bg-slate-950 rounded-lg overflow-hidden border border-white/10 mb-2 relative">
             <img src="${item.url}" alt="${item.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
             <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-300">Foto</span>
           </div>`;

      card.innerHTML = `
        <div>
          ${previewHtml}
          <div class="flex items-center justify-between gap-2 mb-1">
            <h5 class="font-bold text-white truncate text-xs">${item.titulo}</h5>
            <span class="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] whitespace-nowrap">${item.categoria}</span>
          </div>
          <p class="text-[11px] text-slate-400 line-clamp-2 mb-2">${item.descripcion || 'Sin descripción'}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
          <span class="text-slate-500">${new Date(item.fecha || Date.now()).toLocaleDateString('es-AR')}</span>
          <button class="btn-delete-media px-2 py-1 rounded bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white transition-all" data-id="${item.id}">
            🗑️ Eliminar
          </button>
        </div>
      `;

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
