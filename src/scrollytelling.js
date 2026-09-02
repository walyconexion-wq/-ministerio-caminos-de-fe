/**
 * COMUNIDAD FARO DE LUZ - MOTOR MAESTRO DE SCROLLYTELLING Y EXPERIENCIA INTERACTIVA
 * Sincronizado con Supabase Cloud, Reloj Digital, Asistente Luz-02 y Galería Multimedia
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

  // 4. ASISTENTE FLOTANTE LUZ-02 (CONECTADO A /api/chat)
  function initLuzAssistant() {
    const btnToggle = document.getElementById('btn-toggle-luz-chat');
    const btnClose = document.getElementById('btn-close-luz-chat');
    const chatWindow = document.getElementById('luz-chat-window');
    const chatForm = document.getElementById('luz-chat-form');
    const chatInput = document.getElementById('luz-chat-input');
    const chatBody = document.getElementById('luz-chat-body');
    const quickChips = document.querySelectorAll('.luz-quick-chip');

    let isOpen = false;
    let chatHistory = [];

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
        setTimeout(() => {
          chatWindow.classList.add('hidden');
        }, 300);
      }
    }

    if (btnToggle) btnToggle.addEventListener('click', () => toggleChat());
    if (btnClose) btnClose.addEventListener('click', () => toggleChat(false));

    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.textContent.trim().replace(/^[^\w\s¿]+/, '').trim();
        handleUserMessage(query);
      });
    });

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
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
      indicator.innerHTML = '<span class="animate-spin text-xs">⚡</span> Luz-02 está procesando...';
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
        appendChatMessage('Luz-02', reply, 'assistant');
      } catch (err) {
        indicator.remove();
        const reply = getLocalFallback(text);
        chatHistory.push({ role: 'assistant', content: reply });
        appendChatMessage('Luz-02', reply, 'assistant');
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
          <div class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">L</div>
          <div class="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-slate-200 max-w-[85%]">${msg}</div>
        `;
      }

      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function getLocalFallback(text) {
      const q = text.toLowerCase();
      if (q.includes('donde') || q.includes('ubicac') || q.includes('mapa') || q.includes('panaholma') || q.includes('brochero')) {
        return 'La Comunidad Faro de Luz está emplazada en un predio de 1 hectárea con provisión de agua propia en el Valle de Traslasierra, Córdoba, ubicado estratégicamente en el corredor entre Panaholma (a 10 min) y Villa Cura Brochero / Mina Clavero (a 15 min), con acceso consolidado para todo tipo de vehículos y a 2.5 hs de Córdoba Capital.';
      }
      if (q.includes('ecosistema') || q.includes('4 pilares')) {
        return 'Nuestro Ecosistema está compuesto por 4 pilares: 1) ShopDigital (sustento económico), 2) Comunidad Faro de Luz (base física y Co-Housing), 3) Fundación Valle de Luz (acción social) y 4) Ministerio Caminos de Fe (culto cristiano y formación).';
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
      return '¡Hola! Soy Luz-02, ingeniera asistente de la Comunidad Faro de Luz. Te invito a explorar nuestra web o registrarte en el formulario de contacto para recibir tu Credencial Digital de Miembro.';
    }
  }

  // 5. GALERÍA PÚBLICA & LIGHTBOX
  function initGaleriaPublic() {
    const galeriaGrid = document.getElementById('galeria-public-grid');
    const filterBtns = document.querySelectorAll('.galeria-filter-btn');
    const lightboxModal = document.getElementById('galeria-lightbox');
    const btnCloseLightbox = document.getElementById('btn-close-lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxBadge = document.getElementById('lightbox-badge');

    const defaultMedia = [
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

    let currentList = defaultMedia;
    let activeCategory = 'todos';

    async function fetchMedia() {
      if (!galeriaGrid) return;
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('galeria_multimedia')
            .select('*')
            .order('fecha', { ascending: false });

          if (!error && data && data.length > 0) {
            currentList = data;
          }
        } catch (e) {
          console.warn('Fallback a medios por defecto:', e);
        }
      }
      render();
    }

    function render() {
      if (!galeriaGrid) return;
      galeriaGrid.innerHTML = '';

      const filtered = currentList.filter(item => {
        if (activeCategory === 'todos') return true;
        if (activeCategory === 'video') return item.tipo === 'video';
        return item.categoria === activeCategory;
      });

      filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-card-faro rounded-3xl overflow-hidden shadow-2xl hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between transform hover:scale-[1.02] cursor-pointer';

        const isVideo = item.tipo === 'video';
        const thumbHtml = isVideo
          ? `<div class="relative w-full h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
               <div class="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 z-20 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-lg">▶</div>
               <span class="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-cyan-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">🎬 Video</span>
             </div>`
          : `<div class="relative w-full h-48 bg-slate-950 overflow-hidden">
               <img src="${item.url}" alt="${item.titulo}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
               <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">📷 Foto</span>
             </div>`;

        card.innerHTML = `
          ${thumbHtml}
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-mono text-[10px] uppercase">${item.categoria}</span>
                ${item.destacado ? '<span class="text-amber-400 text-xs">⭐ Destacado</span>' : ''}
              </div>
              <h4 class="font-serif text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">${item.titulo}</h4>
              <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed text-shadow-faro">${item.descripcion || 'Registro oficial de la Comunidad Faro de Luz.'}</p>
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
            let embedUrl = item.url;
            if (embedUrl.includes('watch?v=')) embedUrl = embedUrl.replace('watch?v=', 'embed/');
            lightboxContent.innerHTML = `<iframe src="${embedUrl}?autoplay=1" class="w-full h-[50vh] sm:h-[60vh] border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
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
      const credentialCode = 'FL-2027-' + randomCode;

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
        const whatsappMsg = encodeURIComponent('¡Hola Director Waly! Acabo de registrarme en la Comunidad Faro de Luz con la Credencial ' + credentialCode + ' (' + nombre + ' - ' + modalidad + '). Me gustaría recibir más información y estar en contacto.');
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

  window.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    resizeCanvas();
    requestAnimationFrame(animationLoop);
    initLiveClock();
    initLuzAssistant();
    initGaleriaPublic();
    initCommunityForm();
  });

})();
