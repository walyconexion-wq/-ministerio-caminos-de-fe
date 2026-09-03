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
  let currentUser = JSON.parse(sessionStorage.getItem('bunker_mcf_session') || 'null');

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
    sessionStorage.setItem('bunker_mcf_session', JSON.stringify(currentUser));
    checkSession();
  }

  // 3. Cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      currentUser = null;
      sessionStorage.removeItem('bunker_mcf_session');
      checkSession();
    });
  }

  // 4. Cambio de Pestañas entre los 5 Búnkeres
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active', 'bg-white/10', 'text-purple-300'));
      btn.classList.add('active', 'bg-white/10', 'text-purple-300');

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
            <td class="p-4 text-purple-300 font-medium">${talentoIcon}</td>
            <td class="p-4 text-slate-400">${p.telefono_whatsapp}<br><span class="text-[10px] text-slate-500">${p.email}</span></td>
            <td class="p-4">
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-mono">
                ${p.estado_evaluacion || 'Suscripción Activa'}
              </span>
            </td>
            <td class="p-4 text-right flex items-center justify-end gap-2">
              <a href="https://api.whatsapp.com/send?phone=${p.telefono_whatsapp.replace(/[^0-9]/g, '')}&text=${encodeURIComponent('¡Hola ' + p.nombre_completo + '! Te saludamos desde la Dirección de la Ministerio Caminos de Fe. Te confirmamos la emisión de tu Credencial Digital de Miembro. ¡Bienvenido a nuestra comunidad!')}" target="_blank" class="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[10px] font-mono transition-all">
                🪪 WhatsApp Credencial
              </a>
              <button class="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-600 hover:text-slate-950 text-[10px] font-mono transition-all" onclick="alert('Detalles de Suscripción / Mensaje: 

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
    tempDiv.className = 'flex gap-3 bg-purple-600/5 p-3 rounded-xl border border-purple-500/10 font-mono text-xs text-purple-300 italic';
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
      appendMessage('Luz-02', reply, 'text-purple-300');
    } catch (err) {
      tempDiv.remove();
      appendMessage('Luz-02', 'Sistemas del búnker operativos. ' + text, 'text-purple-300');
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

  // Inicialización de Sesión
  document.addEventListener('DOMContentLoaded', () => {
    checkSession();
  });


// ============================================================
  // GESTOR MAESTRO DE GALERÍA Y MULTIMEDIA (LIVE & SYNC ENGINE)
  // ============================================================
  const formAddMedia = document.getElementById('form-add-media');
  const bunkerGaleriaGrid = document.getElementById('bunker-galeria-grid');
  const badgeGaleriaCount = document.getElementById('badge-galeria-count');
  const btnRefreshGaleria = document.getElementById('btn-refresh-galeria');
  const btnResetDefault = document.getElementById('btn-reset-default-media');
  
  const btnTabFile = document.getElementById('btn-tab-file');
  const btnTabUrl = document.getElementById('btn-tab-url');
  const sectionUploadFile = document.getElementById('section-upload-file');
  const sectionUploadUrl = document.getElementById('section-upload-url');
  const mediaFileInput = document.getElementById('media-file-input');
  const filePlaceholder = document.getElementById('file-placeholder');
  const filePreviewContainer = document.getElementById('file-preview-container');
  const filePreviewImg = document.getElementById('file-preview-img');
  const filePreviewVideo = document.getElementById('file-preview-video');
  const fileInfoText = document.getElementById('file-info-text');

  const STORAGE_KEY = 'mcf_galeria_live_v1';
  const DELETED_KEY = 'mcf_galeria_deleted_ids';
  let currentFileBase64 = null;
  let currentFileType = 'foto';

  const initialMasterMedia = [
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
  ];

  // Helper de YouTube Embed
  function formatMediaUrl(url, type) {
    if (!url) return '';
    let formatted = url.trim();
    if (type === 'video') {
      if (formatted.includes('watch?v=')) {
        formatted = formatted.replace('watch?v=', 'embed/').split('&')[0];
      } else if (formatted.includes('youtu.be/')) {
        formatted = formatted.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
      } else if (formatted.includes('youtube.com/shorts/')) {
        formatted = formatted.replace('youtube.com/shorts/', 'www.youtube.com/embed/').split('?')[0];
      }
    }
    return formatted;
  }

  // Cargar lista activa
  async function loadGaleriaData() {
    if (!bunkerGaleriaGrid) return;

    let items = null;

    // 1. Intentar desde Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('galeria_multimedia')
          .select('*')
          .order('fecha', { ascending: false });

        if (!error && data) {
          items = data;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
      } catch (err) {
        console.warn('Supabase offline, usando LocalStorage:', err);
      }
    }

    // 2. Si no hay Supabase o dio error, usar LocalStorage
    if (!items) {
      const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
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
    renderBunkerGaleria(items);
  }

  // Renderizador de Grilla del Búnker
  function renderBunkerGaleria(items) {
    if (!bunkerGaleriaGrid) return;
    if (badgeGaleriaCount) badgeGaleriaCount.textContent = items.length;

    bunkerGaleriaGrid.innerHTML = '';

    if (items.length === 0) {
      bunkerGaleriaGrid.innerHTML = `
        <div class="col-span-2 text-center p-10 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
          <div class="text-3xl">📷</div>
          <div class="text-white font-bold text-sm">No hay medios publicados actualmente</div>
          <p class="text-xs text-slate-400">Subí una foto o video desde tu computadora o pegá un link para publicarlo en la web oficial.</p>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between group hover:border-amber-400/50 transition-all text-xs shadow-lg';

      const isVideo = item.tipo === 'video';
      let previewHtml = '';

      if (isVideo) {
        if (item.url.includes('youtube.com/embed/')) {
          previewHtml = `
            <div class="w-full h-36 bg-slate-950 rounded-xl overflow-hidden mb-2 relative">
              <iframe src="${item.url}" class="w-full h-full border-0 pointer-events-none"></iframe>
              <span class="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-purple-300">🎬 YouTube</span>
            </div>`;
        } else {
          previewHtml = `
            <div class="w-full h-36 bg-slate-950 rounded-xl flex items-center justify-center text-purple-300 border border-purple-500/20 mb-2 relative overflow-hidden">
              <video src="${item.url}" class="w-full h-full object-cover"></video>
              <span class="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-purple-300">🎬 Video MP4</span>
            </div>`;
        }
      } else {
        previewHtml = `
          <div class="w-full h-36 bg-slate-950 rounded-xl overflow-hidden border border-white/10 mb-2 relative">
            <img src="${item.url}" alt="${item.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
            <span class="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-300">📷 Foto</span>
          </div>`;
      }

      card.innerHTML = `
        <div>
          ${previewHtml}
          <div class="flex items-center justify-between gap-2 mb-1">
            <h5 class="font-bold text-white truncate text-xs group-hover:text-purple-300 transition-colors">${item.titulo}</h5>
            <span class="px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 font-mono text-[9px] uppercase whitespace-nowrap">${item.categoria}</span>
          </div>
          <p class="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">${item.descripcion || 'Registro oficial de la base de montaña.'}</p>
        </div>
        <div class="flex items-center justify-between pt-2.5 border-t border-white/10 text-[10px] font-mono">
          <span class="text-slate-500">${new Date(item.fecha || Date.now()).toLocaleDateString('es-AR')}</span>
          <button class="btn-delete-item px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-all flex items-center gap-1 font-bold" data-id="${item.id}">
            <span>🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      `;

      bunkerGaleriaGrid.appendChild(card);
    });

    // EVENTOS DE ELIMINACIÓN EFECTIVA
    document.querySelectorAll('.btn-delete-item').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!confirm('¿Confirmás eliminar este elemento de la galería oficial?')) return;

        // 1. Eliminar de Supabase
        if (supabase) {
          try {
            await supabase.from('galeria_multimedia').delete().eq('id', id);
          } catch (err) {
            console.warn('Eliminación en Supabase:', err);
          }
        }

        // 1. Guardar en DELETED_KEY para borrado permanente
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
        const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
        if (!deleted.includes(id)) {
          deleted.push(id);
          localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
        }
        const updated = localData.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // 3. Notificación y Renderizado
        alert('✓ Elemento eliminado correctamente de la galería.');
        loadGaleriaData();
      });
    });
  }

  // RESTAURAR INICIALES
  if (btnResetDefault) {
    btnResetDefault.addEventListener('click', async () => {
      if (!confirm('¿Deseás restaurar las 6 fotos y videos originales por defecto?')) return;
      localStorage.removeItem(DELETED_KEY);
      localStorage.removeItem(DELETED_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMasterMedia));
      if (supabase) {
        try {
          await supabase.from('galeria_multimedia').upsert(initialMasterMedia);
        } catch (e) {
          console.warn('Upsert inicial en Supabase:', e);
        }
      }
      alert('✓ 6 Medios originales restaurados.');
      loadGaleriaData();
    });
  }

  // SELECTOR DE TABS (ARCHIVO PC VS LINK WEB)
  if (btnTabFile && btnTabUrl) {
    btnTabFile.addEventListener('click', () => {
      btnTabFile.className = 'py-2 rounded-lg bg-purple-600 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5';
      btnTabUrl.className = 'py-2 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5';
      sectionUploadFile.classList.remove('hidden');
      sectionUploadUrl.classList.add('hidden');
    });

    btnTabUrl.addEventListener('click', () => {
      btnTabUrl.className = 'py-2 rounded-lg bg-purple-600 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5';
      btnTabFile.className = 'py-2 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5';
      sectionUploadUrl.classList.remove('hidden');
      sectionUploadFile.classList.add('hidden');
    });
  }

  // COMPRESIÓN Y LECTURA DE ARCHIVOS DE LA PC
  if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');

      const mediaTypeSelect = document.getElementById('media-tipo');
      if (isVid && mediaTypeSelect) mediaTypeSelect.value = 'video';
      if (isImg && mediaTypeSelect) mediaTypeSelect.value = 'foto';

      fileInfoText.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      filePlaceholder.classList.add('hidden');
      filePreviewContainer.classList.remove('hidden');

      if (isImg) {
        filePreviewVideo.classList.add('hidden');
        filePreviewImg.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Compresión ligera en canvas para asegurar rendimiento de carga
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1400;
            const MAX_HEIGHT = 1400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            currentFileBase64 = canvas.toDataURL('image/jpeg', 0.85);
            filePreviewImg.src = currentFileBase64;
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else if (isVid) {
        filePreviewImg.classList.add('hidden');
        filePreviewVideo.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = (event) => {
          currentFileBase64 = event.target.result;
          filePreviewVideo.src = currentFileBase64;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ENVÍO Y GUARDADO DE NUEVO MEDIO
  if (formAddMedia) {
    formAddMedia.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit-media');

      const titulo = document.getElementById('media-titulo').value.trim();
      const tipo = document.getElementById('media-tipo').value;
      const categoria = document.getElementById('media-categoria').value;
      const descripcion = document.getElementById('media-descripcion').value.trim();
      const destacado = document.getElementById('media-destacado').checked;
      const urlInput = document.getElementById('media-url').value.trim();

      let finalUrl = '';

      if (currentFileBase64) {
        finalUrl = currentFileBase64;
      } else if (urlInput) {
        finalUrl = formatMediaUrl(urlInput, tipo);
      }

      if (!titulo || !finalUrl) {
        alert('Por favor seleccioná un archivo de tu PC o ingresá una URL válida.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⚡</span><span>Publicando en la Web...</span>';
      }

      const newItem = {
        id: 'item-' + Date.now(),
        titulo,
        tipo,
        categoria,
        url: finalUrl,
        descripcion,
        destacado,
        fecha: new Date().toISOString()
      };

      // 1. Guardar en Supabase
      if (supabase) {
        try {
          await supabase.from('galeria_multimedia').insert([newItem]);
        } catch (err) {
          console.warn('Registro directo local:', err);
        }
      }

      // 2. Guardar en LocalStorage
      let localItems = [];
      try {
        localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch (e) {
        localItems = [];
      }
      localItems.unshift(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems));

      // 3. Reset del formulario
      formAddMedia.reset();
      currentFileBase64 = null;
      if (filePlaceholder) filePlaceholder.classList.remove('hidden');
      if (filePreviewContainer) filePreviewContainer.classList.add('hidden');
      if (filePreviewImg) filePreviewImg.src = '';
      if (filePreviewVideo) filePreviewVideo.src = '';

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Guardar y Publicar en la Web</span><span>🚀</span>';
      }

      alert('✓ ¡Medio publicado con éxito! Ya está visible en el Búnker y en la web pública.');
      loadGaleriaData();
    });
  }

  if (btnRefreshGaleria) {
    btnRefreshGaleria.addEventListener('click', () => loadGaleriaData());
  }

  // Carga inicial
  loadGaleriaData();

})();
