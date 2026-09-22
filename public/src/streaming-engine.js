// ==============================================================================
// MOTOR DE BROADCASTING Y TRANSMISIÓN EN VIVO - MINISTERIO CAMINOS DE FE
// Conexión WebRTC P2P (Moto g04s / Cámara PC), YouTube/Twitch Embed y Chat Vivo
// ==============================================================================

const STREAMING_STORAGE_KEY = 'mcf_streaming_broadcast_state';
const PRAYERS_STORAGE_KEY = 'mcf_streaming_prayer_requests';

// Estado base por defecto
const DEFAULT_BROADCAST_STATE = {
  isLive: false,
  streamType: 'webrtc', // 'webrtc', 'youtube', 'custom'
  roomName: 'caminosdefe-live-altar',
  youtubeId: '',
  streamTitle: 'Culto Dominical & Ministración de Gracia',
  preacher: 'Equipo Pastoral MCF & Misioneros',
  location: 'Altar Central Mina Clavero / Parajes Traslasierra',
  viewersCount: 42,
  updatedAt: '1970-01-01T00:00:00.000Z'
};

// Peticiones iniciales
const DEFAULT_PRAYERS = [
  {
    id: 1,
    name: "Equipo Pastoral MCF",
    location: "Mina Clavero",
    text: "¡Bienvenidos hermanos y amigos de Traslasierra y de todo el país! Dejen sus peticiones de oración para ser ministradas al finalizar el culto.",
    tag: "pastoral",
    time: "En directo"
  },
  {
    id: 2,
    name: "Familia de Panaholma",
    location: "Panaholma",
    text: "Conectados desde las sierras en comunión. Oramos por la salud de nuestra abuela y por los chicos de la escuelita.",
    tag: "comunidad",
    time: "Hace 5 min"
  },
  {
    id: 3,
    name: "Hermana Marta",
    location: "El Nono",
    text: "Damos gracias a Dios por la obra del ministerio y por la visita a los parajes de montaña con la Sprinter.",
    tag: "gratitud",
    time: "Hace 12 min"
  }
];

function getBroadcastState() {
  try {
    const saved = localStorage.getItem(STREAMING_STORAGE_KEY);
    if (saved) return { ...DEFAULT_BROADCAST_STATE, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Error leyendo estado de streaming:', e);
  }
  return { ...DEFAULT_BROADCAST_STATE };
}

function saveBroadcastState(newState) {
  try {
    const merged = { ...getBroadcastState(), ...newState, updatedAt: new Date().toISOString() };
    localStorage.setItem(STREAMING_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Error guardando estado local:', e);
    return newState;
  }
}

function getPrayerRequests() {
  try {
    const saved = localStorage.getItem(PRAYERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error leyendo peticiones:', e);
  }
  return DEFAULT_PRAYERS;
}

function savePrayerRequest(name, location, text) {
  const prayers = getPrayerRequests();
  const newPrayer = {
    id: Date.now(),
    name: (name || 'Hermano/a').trim(),
    location: (location || 'Traslasierra').trim(),
    text: text.trim(),
    tag: "oracion",
    time: "Recién"
  };
  prayers.unshift(newPrayer);
  localStorage.setItem(PRAYERS_STORAGE_KEY, JSON.stringify(prayers.slice(0, 50)));
  return prayers;
}

// Inicialización general al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // 1. EVALUAR PARÁMETROS URL DE ENLACE DIRECTO (?live=1, ?vivo=1, ?stream=..., ?yt=...)
  // Esto garantiza que cualquier persona que abra un enlace desde WhatsApp/Facebook/Telegram
  // se conecte AL INSTANTE a la señal en vivo sin depender de APIs externas.
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const forceLive = urlParams.has('live') || urlParams.has('vivo') || urlParams.has('stream');
    
    if (forceLive) {
      const roomParam = urlParams.get('room') || urlParams.get('stream');
      const ytParam = urlParams.get('yt') || urlParams.get('youtube');
      const typeParam = urlParams.get('type') || (ytParam ? 'youtube' : 'webrtc');

      const forcedState = {
        isLive: true,
        streamType: typeParam,
        roomName: roomParam || 'caminosdefe-live-altar',
        youtubeId: ytParam || '',
        updatedAt: new Date().toISOString()
      };
      saveBroadcastState(forcedState);
    }
  } catch (err) {
    console.warn('Error parseando query params:', err);
  }

  // 2. Render inicial
  renderPlayer();
  renderPrayers();

  // 3. Sincronización remota desde /api/broadcast con escudo anti-cold-start
  async function fetchRemoteBroadcastState() {
    try {
      const res = await fetch('/api/broadcast?t=' + Date.now());
      if (!res.ok) return;
      const remote = await res.json();
      const local = getBroadcastState();

      // Si el servidor está en frío (isColdStart o updatedAt de 1970) y localmente estamos en vivo,
      // no apagar la señal local.
      if (remote.isColdStart || remote.updatedAt === '1970-01-01T00:00:00.000Z') {
        return;
      }

      // Si el remoto dice EN VIVO (isLive === true), adoptarlo de inmediato
      if (remote.isLive && !local.isLive) {
        localStorage.setItem(STREAMING_STORAGE_KEY, JSON.stringify(remote));
        renderPlayer();
        return;
      }

      // Si el remoto dice APAGADO (isLive === false), solo apagar si el timestamp remoto es más nuevo que el local
      if (!remote.isLive && local.isLive) {
        const remoteTime = new Date(remote.updatedAt).getTime();
        const localTime = new Date(local.updatedAt).getTime();
        if (remoteTime > localTime) {
          localStorage.setItem(STREAMING_STORAGE_KEY, JSON.stringify(remote));
          renderPlayer();
        }
        return;
      }

      // Si cambiaron detalles del streaming (sala, youtubeId, título)
      if (remote.streamType !== local.streamType ||
          remote.roomName !== local.roomName ||
          remote.youtubeId !== local.youtubeId) {
        localStorage.setItem(STREAMING_STORAGE_KEY, JSON.stringify(remote));
        renderPlayer();
      }
    } catch (e) {
      // Ignorar fallas de red momentáneas
    }
  }

  fetchRemoteBroadcastState();
  setInterval(fetchRemoteBroadcastState, 4000);

  // 4. Sincronización entre pestañas en el mismo navegador
  window.addEventListener('storage', (e) => {
    if (e.key === STREAMING_STORAGE_KEY) renderPlayer();
    if (e.key === PRAYERS_STORAGE_KEY) renderPrayers();
  });

  // 5. Configurar formulario de peticiones
  const prayerForm = document.getElementById('form-peticion-envivo');
  if (prayerForm) {
    prayerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputAuthor = document.getElementById('peticion-autor');
      const inputText = document.getElementById('peticion-texto');
      if (!inputText || !inputText.value.trim()) return;

      const rawAuthor = inputAuthor ? inputAuthor.value.trim() : '';
      let author = rawAuthor || 'Hermano/a';
      let loc = 'Traslasierra';

      if (rawAuthor.includes('(') && rawAuthor.includes(')')) {
        const parts = rawAuthor.split('(');
        author = parts[0].trim();
        loc = parts[1].replace(')', '').trim();
      } else if (rawAuthor.includes(' - ')) {
        const parts = rawAuthor.split(' - ');
        author = parts[0].trim();
        loc = parts[1].trim();
      }

      savePrayerRequest(author, loc, inputText.value);
      renderPrayers();

      if (window.soundFX && typeof window.soundFX.playNotification === 'function') {
        window.soundFX.playNotification();
      }

      const feedback = document.getElementById('peticion-feedback');
      if (feedback) {
        feedback.classList.remove('hidden');
        setTimeout(() => feedback.classList.add('hidden'), 3500);
      }

      inputText.value = '';
    });
  }
});

function renderPlayer() {
  const state = getBroadcastState();
  const playerContainer = document.getElementById('live-stream-container');
  const badgeLive = document.getElementById('badge-live-status');
  const badgeText = document.getElementById('badge-live-text');
  const titleElem = document.getElementById('live-stream-title');
  const subtitleElem = document.getElementById('live-stream-sub');
  const viewersElem = document.getElementById('badge-viewers-count');

  if (viewersElem) {
    viewersElem.textContent = `${state.isLive ? (state.viewersCount || 42) : 0} Hermanos`;
  }

  if (titleElem) {
    titleElem.textContent = state.streamTitle || 'Culto Dominical & Ministración';
  }

  if (subtitleElem) {
    subtitleElem.textContent = `${state.location || 'Altar Central Mina Clavero'} · ${state.preacher || 'Equipo Pastoral MCF'}`;
  }

  if (state.isLive) {
    // ==========================================
    // MODO: EN VIVO AHORA
    // ==========================================
    if (badgeLive) {
      badgeLive.className = 'px-2.5 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30';
    }
    if (badgeText) {
      badgeText.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>🔴 EN VIVO AHORA';
    }

    if (!playerContainer) return;

    if (state.streamType === 'webrtc') {
      const streamId = state.roomName || 'caminosdefe-live-altar';
      playerContainer.innerHTML = `
        <div class="relative w-full h-full bg-black flex flex-col justify-between">
          <iframe 
            id="vdo-player-iframe"
            src="https://vdo.ninja/?view=${encodeURIComponent(streamId)}&cleanoutput=1&transparent=0&autoplay=1&autostart=1"
            class="w-full h-full border-0 absolute inset-0"
            allow="autoplay; camera; microphone; fullscreen; picture-in-picture; display-capture"
            allowfullscreen>
          </iframe>

          <!-- Badges superiores de transmisión -->
          <div class="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-md bg-rose-600/90 text-white font-mono text-[11px] font-bold tracking-wider shadow flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
              ● SEÑAL EN DIRECTO
            </span>
            <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-emerald-400 font-mono border border-white/10">
              WebRTC P2P Ultrabaja Latencia
            </span>
          </div>

          <!-- Botonera de Asistencia Móvil (Audio / Reconectar) -->
          <div class="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <button onclick="reloadStreamIframe()" class="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur text-white font-mono text-[11px] border border-white/20 flex items-center gap-1 shadow transition-all">
              <span>🔄 Reconectar</span>
            </button>
            <button onclick="toggleAudioHint()" class="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 backdrop-blur text-white font-mono text-[11px] border border-purple-400/30 flex items-center gap-1 shadow transition-all">
              <span>🔊 Activar Audio</span>
            </button>
          </div>
        </div>
      `;
    } else if (state.streamType === 'youtube') {
      const ytId = state.youtubeId || 'jfKfPfyJRdk';
      playerContainer.innerHTML = `
        <div class="relative w-full h-full bg-black">
          <iframe 
            src="https://www.youtube.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0&modestbranding=1" 
            class="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
          <div class="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-md bg-red-600/90 text-white font-mono text-[11px] font-bold tracking-wider shadow">
              ● YOUTUBE LIVE
            </span>
          </div>
        </div>
      `;
    } else {
      const customUrl = state.customUrl || '';
      playerContainer.innerHTML = `
        <div class="relative w-full h-full bg-black">
          <iframe 
            src="${encodeURI(customUrl)}" 
            class="w-full h-full border-0 absolute inset-0"
            allow="autoplay; camera; microphone; fullscreen; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }

  } else {
    // ==========================================
    // MODO: STANDBY / FUERA DEL AIRE
    // ==========================================
    if (badgeLive) {
      badgeLive.className = 'px-2.5 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 font-mono text-xs flex items-center gap-1.5';
    }
    if (badgeText) {
      badgeText.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>⚪ FUERA DEL AIRE';
    }

    if (!playerContainer) return;
    playerContainer.innerHTML = `
      <div class="relative w-full h-full flex flex-col items-center justify-center p-6 text-center group">
        <!-- Fondo visual degradado -->
        <div class="absolute inset-0 bg-gradient-to-t from-black via-purple-950/30 to-black pointer-events-none"></div>
        
        <div class="relative z-10 space-y-4 max-w-md">
          <div class="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-300 text-3xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            🕊️
          </div>
          <div>
            <h3 class="font-serif text-xl sm:text-2xl font-bold text-white mb-1">Próxima Transmisión en Vivo</h3>
            <p class="text-xs text-amber-300 font-mono">Domingo 10:30 hs (Arg) · Miércoles 19:30 hs</p>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            La señal se activa automáticamente durante los cultos en el Altar Central y las campañas misioneras en los valles de Traslasierra.
          </p>

          <!-- BOTÓN DIRECTO PARA SINTONIZAR EN CASO DE EMISIÓN EN CURSO -->
          <div class="pt-2">
            <button onclick="forceTuneInLive()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-lg shadow-rose-600/30 flex items-center gap-2 mx-auto transition-all transform hover:scale-105 active:scale-95">
              <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>🔴 Sintonizar Señal en Directo</span>
            </button>
            <p class="text-[10px] text-slate-500 mt-2 font-mono">Hacé clic si el culto ya comenzó para abrir el altar ahora.</p>
          </div>

          <div class="pt-2 flex items-center justify-center gap-3 text-[11px] font-mono text-slate-300">
            <span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10">🎙️ Consola 32 Canales</span>
            <span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10">📡 Móvil Moto g04s Ready</span>
          </div>
        </div>

        <!-- Barra inferior del reproductor -->
        <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-xs text-slate-400 font-mono px-4">
          <span class="flex items-center gap-1.5 text-emerald-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Receptor Satelital Starlink Enlazado
          </span>
          <span class="text-[11px] text-slate-400">Transmisión Libre y Gratuita</span>
        </div>
      </div>
    `;
  }
}

// Forzar sintonización en vivo con un clic
window.forceTuneInLive = function() {
  const current = getBroadcastState();
  const forced = {
    ...current,
    isLive: true,
    updatedAt: new Date().toISOString()
  };
  saveBroadcastState(forced);
  renderPlayer();
};

// Reconectar el iframe de VDO.Ninja si se cortó el internet móvil
window.reloadStreamIframe = function() {
  const iframe = document.getElementById('vdo-player-iframe');
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = src; }, 150);
  }
};

// Recordatorio y ayuda sonora para navegadores de celular que bloquean autoplay con audio
window.toggleAudioHint = function() {
  alert('💡 Para escuchar en celulares: Tocá sobre el video de la transmisión para permitir que tu teléfono reproduzca el sonido.');
};

function renderPrayers() {
  const container = document.getElementById('lista-peticiones-envivo');
  if (!container) return;

  const prayers = getPrayerRequests();
  container.innerHTML = prayers.map(p => {
    let colorClass = "text-purple-300";
    if (p.tag === 'pastoral') colorClass = "text-amber-300";
    if (p.tag === 'gratitud') colorClass = "text-emerald-300";

    return `
      <div class="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-bold ${colorClass} text-[11px]">${escapeHtml(p.name)} <span class="font-normal text-slate-400 text-[10px]">(${escapeHtml(p.location)})</span></span>
          <span class="text-[9px] font-mono text-slate-500">${escapeHtml(p.time || 'Recién')}</span>
        </div>
        <p class="text-slate-300 text-xs leading-relaxed">${escapeHtml(p.text)}</p>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Exportar globalmente
window.mcfStreaming = {
  getBroadcastState,
  saveBroadcastState,
  getPrayerRequests,
  savePrayerRequest,
  renderPlayer,
  renderPrayers
};
