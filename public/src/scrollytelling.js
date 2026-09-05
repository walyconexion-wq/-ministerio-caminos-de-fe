/**
 * COMUNIDAD FARO DE LUZ - MOTOR MAESTRO DE SCROLLYTELLING Y EXPERIENCIA INTERACTIVA
 * Sincronizado con Supabase Cloud, Reloj Digital, Asistente Asistente Luz y Galería Multimedia
 */

(function () {
  'use strict';

  // 1. CONFIGURACIÓN DE SUPABASE CLIENT
  const SUPABASE_URL = 'https://osdduwjsicoaeojfhokm.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_eVJfo1_bTqFQ0hmcXVA47A_kEdvMM0K';
  let supabase = null;

  try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (err) {
    console.warn('Supabase inicializado en modo offline/fallback:', err);
  }

  // 2. CONSTANTES Y ELEMENTOS DEL CANVAS SCROLLYTELLING
  const FRAME_COUNT = 240;
  const canvas = document.getElementById('scrolly-canvas');
  let ctx = null;
  if (canvas) {
    ctx = canvas.getContext('2d', { alpha: false });
  }

  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderText = document.getElementById('preloader-text');

  const images = [];
  let loadedCount = 0;
  let currentFrame = 0;
  let targetFrame = 0;
  let isReady = false;

  function getFramePath(index) {
    const frameNumber = String(index + 1).padStart(4, '0');
    return `/frames/frame_${frameNumber}.jpg`;
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    renderFrame(Math.round(currentFrame));
  }

  function renderFrame(index) {
    if (!ctx || !canvas) return;
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    ctx.drawImage(img, nx, ny, nw, nh);
  }

  function animationLoop() {
    if (isReady && canvas) {
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.01) {
        currentFrame += diff * 0.12;
        renderFrame(Math.round(currentFrame));
      }
    }
    requestAnimationFrame(animationLoop);
  }

  function onScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / docHeight));
    targetFrame = Math.min(FRAME_COUNT - 1, Math.floor(scrollFraction * FRAME_COUNT));
  }

  function preloadImages() {
    // Failsafe garantizado: Cerrar preloader a los 1.5s pase lo que pase
    setTimeout(() => {
      if (!isReady) finishLoading();
    }, 1500);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / FRAME_COUNT) * 100);
        if (preloaderBar) preloaderBar.style.width = `${percent}%`;
        if (preloaderText) preloaderText.textContent = `Iniciando Fotogramas: ${percent}%`;

        if (loadedCount === 1) {
          resizeCanvas();
        }
        if (loadedCount >= Math.min(30, FRAME_COUNT) && !isReady) {
          finishLoading();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= 10 && !isReady) finishLoading();
      };
      images.push(img);
    }
  }

  function finishLoading() {
    isReady = true;
    resizeCanvas();
    renderFrame(0);
    if (preloader) {
      preloader.classList.add('opacity-0');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }
  }

  // 3. RELOJ DIGITAL EN VIVO (HEADER)
  function initLiveClock() {
    const clockEl = document.getElementById('clock-display');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = now.getFullYear();
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());

      clockEl.textContent = `${day}/${month}/${year} · ${hours}:${minutes}:${seconds}`;
    }

    update();
    setInterval(update, 1000);
  }

// 4. ASISTENTE FLOTANTE LUZ-02 (CONECTADO A /api/chat Y /api/tts)
  function initLuzAssistant() {
    const btnToggle = document.getElementById('btn-toggle-luz-chat');
    const btnClose = document.getElementById('btn-close-luz-chat');
    const chatWindow = document.getElementById('luz-chat-window');
    const chatForm = document.getElementById('luz-chat-form');
    const chatInput = document.getElementById('luz-chat-input');
    const chatBody = document.getElementById('luz-chat-body');
    const quickChips = document.querySelectorAll('.luz-quick-chip');
    const btnToggleVoice = document.getElementById('btn-toggle-voice');

    let isOpen = false;
    let chatHistory = [];
    let isVoiceActive = true;
    let currentAudio = null;

    if (btnToggleVoice) {
      btnToggleVoice.innerHTML = '<span>🔊</span><span>Voz ON</span>';
      btnToggleVoice.addEventListener('click', () => {
        isVoiceActive = !isVoiceActive;
        if (isVoiceActive) {
          btnToggleVoice.innerHTML = '<span>🔊</span><span>Voz ON</span>';
          btnToggleVoice.classList.remove('opacity-50');
          btnToggleVoice.classList.add('text-amber-300');
        } else {
          btnToggleVoice.innerHTML = '<span>🔇</span><span>Voz OFF</span>';
          btnToggleVoice.classList.add('opacity-50');
          btnToggleVoice.classList.remove('text-amber-300');
          if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
          }
        }
      });
    }

    // REPRODUCCIÓN AUTOMÁTICA DE VOZ HUMANA (AUTOPLAY TOTAL AL ESCRIBIR)
    let audioPlayer = null;

    function desbloquearAudioContext() {
      try {
        if (!audioPlayer) {
          audioPlayer = new Audio();
        }
        // Desbloqueo silencioso inmediato con el gesto del usuario
        audioPlayer.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audioPlayer.play().catch(() => {});
        if ('speechSynthesis' in window) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        }
      } catch (e) {}
    }

    function reproducirVozHumana(texto) {
      if (typeof isVoiceActive !== 'undefined' && !isVoiceActive) return;

      const textoLimpio = texto
        .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
        .replace(/[*_#`~<>\[\]]/g, '')
        .substring(0, 280)
        .trim();

      if (!textoLimpio) return;

      if (!audioPlayer) {
        audioPlayer = new Audio();
      }

      const audioUrl = '/api/tts?voice=es-AR-ElenaNeural&text=' + encodeURIComponent(textoLimpio);
      audioPlayer.src = audioUrl;

      audioPlayer.play().catch(err => {
        console.warn('Autoplay audio falló, activando SpeechSynthesis nativo:', err);
        try {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textoLimpio);
            utterance.lang = 'es-AR';
            utterance.rate = 1.05;
            const voices = window.speechSynthesis.getVoices();
            const esVoice = voices.find(v => v.lang === 'es-AR') || voices.find(v => v.lang.startsWith('es'));
            if (esVoice) utterance.voice = esVoice;
            window.speechSynthesis.speak(utterance);
          }
        } catch (speechErr) {
          console.error('Error en síntesis:', speechErr);
        }
      });
    }

    function toggleChat(force) {
      isOpen = typeof force === 'boolean' ? force : !isOpen;
      if (!chatWindow) return;

      if (isOpen) {
        chatWindow.classList.remove('hidden');
        setTimeout(() => {
          chatWindow.classList.remove('scale-95', 'opacity-0');
          chatWindow.classList.add('scale-100', 'opacity-100');
          if (chatInput) chatInput.focus();
        }, 10);
      } else {
        chatWindow.classList.remove('scale-100', 'opacity-100');
        chatWindow.classList.add('scale-95', 'opacity-0');
        if (audioPlayer) {
          audioPlayer.pause();
        }
        setTimeout(() => {
          chatWindow.classList.add('hidden');
        }, 300);
      }
    }

    if (btnToggle) btnToggle.addEventListener('click', () => toggleChat());
    if (btnClose) btnClose.addEventListener('click', () => toggleChat(false));

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        desbloquearAudioContext();

        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';
        handleUserMessage(text);
      });
    }

    async function handleUserMessage(text) {
      appendChatMessage('Tú', text, 'user');
      chatHistory.push({ role: 'user', content: text });

      const indicator = document.createElement('div');
      indicator.className = 'flex gap-2 items-center text-[10px] text-amber-300 font-mono italic p-2';
      indicator.innerHTML = '<span class="animate-spin text-xs">⚡</span> Asistente Luz está pensando...';
      chatBody.appendChild(indicator);
      chatBody.scrollTop = chatBody.scrollHeight;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: chatHistory })
        });

        const data = await response.json();
        indicator.remove();

        const reply = data.reply || getLocalFallback(text);
        chatHistory.push({ role: 'assistant', content: reply });
        appendChatMessage('Asistente Luz', reply, 'assistant');
        reproducirVozHumana(reply);
      } catch (err) {
        indicator.remove();
        const reply = getLocalFallback(text);
        chatHistory.push({ role: 'assistant', content: reply });
        appendChatMessage('Asistente Luz', reply, 'assistant');
        reproducirVozHumana(reply);
      }
    }

    function appendChatMessage(sender, msg, type) {
      const isUser = type === 'user';
      const div = document.createElement('div');
      div.className = isUser ? 'flex justify-end' : 'flex gap-2.5 items-start';

      if (isUser) {
        div.innerHTML = `<div class="p-3 rounded-2xl rounded-tr-sm bg-amber-500/20 border border-amber-500/30 text-amber-100 max-w-[85%]">${msg}</div>`;
      } else {
        div.innerHTML = `
          <div class="w-7 h-7 rounded-lg overflow-hidden border border-amber-500/40 p-1 bg-black/50 shadow-sm flex items-center justify-center shrink-0 mt-0.5"><img src="/favicon-mcf.svg" alt="Cruz" class="w-full h-full object-contain"></div>
          <div class="space-y-1.5 max-w-[85%]">
            <div class="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-slate-200">
              ${msg}
            </div>
            
          </div>
        `;
      }

      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function getLocalFallback(text) {
      const q = text.toLowerCase();
      if (q.includes('donde') || q.includes('ubicac') || q.includes('mapa') || q.includes('panaholma') || q.includes('brochero')) {
        return 'La Ministerio Caminos de Fe está emplazada en un predio de 1 hectárea con provisión de agua propia en el Valle de Traslasierra, Córdoba, ubicado estratégicamente en el corredor entre Panaholma (a 10 min) y Villa Cura Brochero / Mina Clavero (a 15 min), con acceso consolidado para todo tipo de vehículos y a 2.5 hs de Córdoba Capital.';
      }
      if (q.includes('ecosistema') || q.includes('4 pilares')) {
        return 'Nuestro Ecosistema está compuesto por 4 pilares: 1) ShopDigital (sustento económico), 2) Ministerio Caminos de Fe (base física y Co-Housing), 3) Fundación Valle de Luz (acción social) y 4) Ministerio Caminos de Fe (culto cristiano y formación).';
      }
      if (q.includes('vision') || q.includes('mision')) {
        return 'Nuestra Visión es ser un modelo pionero de comunidad de montaña autosustentable en Traslasierra. Nuestra Misión es albergar a 6 familias fundadoras que integran fe cristiana, desarrollo en ShopDigital (Regla 70/20/10) y ecotecnología de vanguardia.';
      }
      if (q.includes('vivienda') || q.includes('casa') || q.includes('modular') || q.includes('container') || q.includes('domo')) {
        return 'Las viviendas son 6 módulos en contenedores marítimos de 40ft High Cube en herradura con triple aislamiento térmico y Domo Central de 10m de diámetro.';
      }
      if (q.includes('shopdigital') || q.includes('sustento') || q.includes('70/20')) {
        return 'Aplicamos la regla 70/20/10: 70% trabajo remoto en ShopDigital (garantiza el fondo común), 20% tareas comunitarias y 10% servicio social y espiritual.';
      }
      return '¡Hola! Soy el Asistente Luz, de sistemas de culto y sonido del Ministerio Caminos de Fe. Te invito a explorar nuestra web o registrarte en el formulario de contacto para recibir tu Credencial Digital de Miembro.';
    }
  }

// 5. GALERÍA PÚBLICA & LIGHTBOX (SINCRONIZADO CON BÚNKER Y SUPABASE)
  function initGaleriaPublic() {
    const galeriaGrid = document.getElementById('galeria-public-grid');
    const filterBtns = document.querySelectorAll('.galeria-filter-btn');
    const lightboxModal = document.getElementById('galeria-lightbox');
    const btnCloseLightbox = document.getElementById('btn-close-lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxBadge = document.getElementById('lightbox-badge');

    const STORAGE_KEY = 'mcf_galeria_live_v1';

    const defaultMedia = [
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
    ];

    let currentList = defaultMedia;
    let activeCategory = 'todos';

    async function fetchMedia() {
      if (!galeriaGrid) return;
      let fetched = null;

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('galeria_multimedia')
            .select('*')
            .order('fecha', { ascending: false });

          if (!error && data) {
            fetched = data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fetched));
          }
        } catch (e) {
          console.warn('Fallback a LocalStorage:', e);
        }
      }

      if (!fetched) {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local !== null) {
          try {
            fetched = JSON.parse(local);
          } catch (e) {
            fetched = defaultMedia;
          }
        } else {
          fetched = defaultMedia;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMedia));
        }
      }

      currentList = fetched || defaultMedia;
      render();
    }

    function render() {
      if (!galeriaGrid) return;
      galeriaGrid.innerHTML = '';

      if (currentList.length === 0) {
        galeriaGrid.innerHTML = `
          <div class="col-span-full text-center p-12 glass-card-faro rounded-3xl space-y-3">
            <div class="text-3xl">📷</div>
            <div class="text-white font-serif text-lg font-bold">Galería en Actualización</div>
            <p class="text-xs text-slate-400">Pronto publicaremos nuevos registros audiovisuales de las obras.</p>
          </div>
        `;
        return;
      }

      const filtered = currentList.filter(item => {
        if (activeCategory === 'todos') return true;
        if (activeCategory === 'video') return item.tipo === 'video';
        return item.categoria === activeCategory;
      });

      filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-card-faro rounded-3xl overflow-hidden shadow-2xl hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between transform hover:scale-[1.02] cursor-pointer';

        const isVideo = item.tipo === 'video';
        let thumbHtml = '';

        if (isVideo) {
          if (item.url.includes('youtube.com/embed/')) {
            thumbHtml = `
              <div class="relative w-full h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
                <iframe src="${item.url}" class="w-full h-full border-0 pointer-events-none"></iframe>
                <div class="absolute inset-0 bg-transparent z-10"></div>
                <div class="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 z-20 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-lg">▶</div>
                <span class="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-cyan-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">🎬 Video</span>
              </div>`;
          } else {
            thumbHtml = `
              <div class="relative w-full h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
                <video src="${item.url}" class="w-full h-full object-cover"></video>
                <div class="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 z-20 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-lg">▶</div>
                <span class="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-cyan-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">🎬 Video</span>
              </div>`;
          }
        } else {
          thumbHtml = `
            <div class="relative w-full h-48 bg-slate-950 overflow-hidden">
              <img src="${item.url}" alt="${item.titulo}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
              <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">📷 Foto</span>
            </div>`;
        }

        card.innerHTML = `
          ${thumbHtml}
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-mono text-[10px] uppercase">${item.categoria}</span>
                ${item.destacado ? '<span class="text-amber-400 text-xs font-bold">⭐ Destacado</span>' : ''}
              </div>
              <h4 class="font-serif text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">${item.titulo}</h4>
              <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed text-shadow-faro">${item.descripcion || 'Registro oficial de la Ministerio Caminos de Fe.'}</p>
            </div>
            <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <span>Ver en Pantalla Completa</span>
              <span>↗</span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          if (!lightboxModal) return;
          lightboxTitle.textContent = item.titulo;
          lightboxDesc.textContent = item.descripcion || 'Registro oficial de la base de montaña.';
          lightboxBadge.textContent = item.tipo === 'video' ? '🎬 Video' : '📷 Fotografía';
          lightboxBadge.className = item.tipo === 'video'
            ? 'px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase'
            : 'px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase';

          if (item.tipo === 'video') {
            if (item.url.includes('youtube.com/embed/')) {
              lightboxContent.innerHTML = `<iframe src="${item.url}?autoplay=1" class="w-full h-[50vh] sm:h-[60vh] border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else {
              lightboxContent.innerHTML = `<video src="${item.url}" controls autoplay class="max-h-[65vh] w-full object-contain rounded-xl"></video>`;
            }
          } else {
            lightboxContent.innerHTML = `<img src="${item.url}" alt="${item.titulo}" class="max-h-[65vh] w-auto object-contain rounded-xl p-2" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">`;
          }

          lightboxModal.classList.remove('hidden');
        });

        galeriaGrid.appendChild(card);
      });
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

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-amber-500', 'text-slate-950', 'active');
          b.classList.add('glass-card-faro', 'text-slate-300');
        });
        btn.classList.add('bg-amber-500', 'text-slate-950', 'active');
        btn.classList.remove('glass-card-faro', 'text-slate-300');

        activeCategory = btn.getAttribute('data-category');
        render();
      });
    });

    fetchMedia();
  }

  // 6. EMBUDO DE SUSCRIPCIÓN Y CREDENCIALES
  function initCommunityForm() {
    const communityForm = document.getElementById('talent-form');
    const credentialSuccessCard = document.getElementById('credential-success-card');
    const credName = document.getElementById('cred-name');
    const credModalidad = document.getElementById('cred-modalidad');
    const credId = document.getElementById('cred-id');
    const btnWhatsappDirect = document.getElementById('btn-whatsapp-direct');

    if (!communityForm) return;

    communityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = communityForm.querySelector('button[type="submit"]');

      const nombre = document.getElementById('form-nombre')?.value.trim() || 'Aspirante';
      const modalidad = document.getElementById('form-modalidad')?.value || 'Miembro Adherente';
      const telefono = document.getElementById('form-telefono')?.value.trim() || '';
      const email = document.getElementById('form-email')?.value.trim() || '';
      const ciudad = document.getElementById('form-ciudad')?.value.trim() || '';
      const talentoEl = document.querySelector('input[name="talento"]:checked');
      const talento = talentoEl ? talentoEl.value : 'software';
      const mensaje = document.getElementById('form-mensaje')?.value.trim() || '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin text-base">⚡</span> Procesando Credencial en el Búnker...';
      }

      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const credentialCode = 'MCF-2027-' + randomCode;

      if (supabase) {
        try {
          await supabase.from('postulaciones_fundadores').insert([{
            nombre_completo: nombre,
            modalidad: modalidad,
            telefono_whatsapp: telefono,
            email: email,
            talento_principal: talento + ' (' + ciudad + ')',
            experiencia_motivacion: mensaje + ' [Credencial: ' + credentialCode + ']',
            estado_evaluacion: 'Credencial Emitida'
          }]);
        } catch (err) {
          console.warn('Registro guardado localmente:', err);
        }
      }

      if (credName) credName.textContent = nombre;
      if (credModalidad) credModalidad.textContent = modalidad;
      if (credId) credId.textContent = credentialCode;

      if (btnWhatsappDirect) {
        const cleanPhone = telefono.replace(/[^0-9]/g, '');
        const whatsappMsg = encodeURIComponent('¡Hola Director Waly! Acabo de registrarme en la Ministerio Caminos de Fe con la Credencial ' + credentialCode + ' (' + nombre + ' - ' + modalidad + '). Me gustaría recibir más información y estar en contacto.');
        btnWhatsappDirect.href = 'https://wa.me/5491100000000?text=' + whatsappMsg;
      }

      setTimeout(() => {
        communityForm.classList.add('hidden');
        if (credentialSuccessCard) {
          credentialSuccessCard.classList.remove('hidden');
          credentialSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 700);
    });
  }

  // 7. INICIALIZACIÓN GLOBAL
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });

  
  // 7. SCROLLSPY Y EFECTO ACTIVO EN MENÚ DE NAVEGACIÓN
  function initScrollSpy() {
    const navLinks = document.querySelectorAll('#navbar-links .nav-link');
    if (!navLinks || navLinks.length === 0) return;

    const sections = [];
    navLinks.forEach(link => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const sec = document.querySelector(hash);
        if (sec) {
          sections.push({ hash, element: sec, link });
        }
      }
    });

    if (sections.length === 0) return;

    function onScrollSpy() {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      let activeIndex = -1;

      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].element.offsetTop;
        const height = sections[i].element.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          activeIndex = i;
          break;
        }
      }

      if (window.scrollY < window.innerHeight * 0.35) {
        activeIndex = -1;
      } else if (activeIndex === -1) {
        for (let i = sections.length - 1; i >= 0; i--) {
          if (scrollPos >= sections[i].element.offsetTop) {
            activeIndex = i;
            break;
          }
        }
      }

      navLinks.forEach((l, idx) => {
        if (idx === activeIndex) {
          l.classList.add('nav-link-active');
        } else {
          l.classList.remove('nav-link-active');
        }
      });
    }

    window.addEventListener('scroll', onScrollSpy, { passive: true });
    setTimeout(onScrollSpy, 250);
  }

  function initAll() {
    try { initScrollSpy(); } catch(e) { console.warn("ScrollSpy:", e); }
    try { preloadImages(); } catch(e) { console.warn('Preload:', e); finishLoading(); }
    try { resizeCanvas(); } catch(e) { console.warn('Canvas:', e); }
    try { requestAnimationFrame(animationLoop); } catch(e) { console.warn('Loop:', e); }
    try { initLiveClock(); } catch(e) { console.warn('Clock:', e); }
    try { initLuzAssistant(); } catch(e) { console.warn('Luz:', e); }
    try { initGaleriaPublic(); } catch(e) { console.warn('Galeria:', e); }
    try { initCommunityForm(); } catch(e) { console.warn('Form:', e); }
    setTimeout(finishLoading, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
