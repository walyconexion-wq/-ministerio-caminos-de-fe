// ==============================================================================
// MOTOR DE BROADCASTING Y TRANSMISIÓN EN VIVO - MINISTERIO CAMINOS DE FE
// Conexión WebRTC P2P (Moto g04s / Cámara PC), YouTube/Twitch Embed y Chat Vivo
// ==============================================================================

const STREAMING_STORAGE_KEY = 'mcf_streaming_broadcast_state';
const PRAYERS_STORAGE_KEY = 'mcf_streaming_prayer_requests';

// Estado por defecto
const DEFAULT_BROADCAST_STATE = {
  isLive: false,
  streamType: 'webrtc', // 'webrtc', 'youtube', 'custom'
  roomName: 'caminosdefe-live-altar',
  youtubeId: '', // e.g. "jfKfPfyJRdk"
  streamTitle: 'Culto de Alabanza & Ministración en Vivo',
  preacher: 'Equipo Pastoral MCF & Misioneros',
  location: 'Altar Central Mina Clavero / Parajes Traslasierra',
  viewersCount: 42,
  updatedAt: new Date().toISOString()
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
  return DEFAULT_BROADCAST_STATE;
}

function getPrayerRequests() {
  try {
    const saved = localStorage.getItem(PRAYERS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error leyendo peticiones:', e);
  }
  return DEFAULT_PRAYERS;
}

function savePrayerRequest(name, location, text) {
  const prayers = getPrayerRequests();
  const newPrayer = {
    id: Date.now(),
    name: name.trim(),
    location: location.trim() || "Traslasierra",
    text: text.trim(),
    tag: "oracion",
    time: "Recién"
  };
  prayers.unshift(newPrayer);
  localStorage.setItem(PRAYERS_STORAGE_KEY, JSON.stringify(prayers.slice(0, 50)));
  return prayers;
}

// Inicializar y sincronizar reproductor en streaming.html
document.addEventListener('DOMContentLoaded', () => {
  renderPlayer();
  renderPrayers();

  // 1. Sincronización remota instantánea desde /api/broadcast (Nube / Celulares / PC)
  async function fetchRemoteBroadcastState() {
    try {
      const res = await fetch('/api/broadcast?t=' + Date.now());
      if (!res.ok) return;
      const remoteState = await res.json();
      const localState = getBroadcastState();

      // PROTECCIÓN COLD-START: Si remoto dice "apagado" pero local dice "vivo",
      // solo actualizamos si el estado remoto fue guardado hace menos de 5 minutos
      // (apagado real desde Búnker). Si es más viejo, fue un cold-start → ignorar.
      const remoteUpdatedAt = remoteState.updatedAt ? new Date(remoteState.updatedAt) : null;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const isRemoteRecent = remoteUpdatedAt && remoteUpdatedAt > fiveMinutesAgo;

      if (!remoteState.isLive && localState.isLive && !isRemoteRecent) {
        // Cold-start detectado → mantener señal viva, no apagar
        return;
      }

      const changed = remoteState.isLive !== localState.isLive ||
            remoteState.streamType !== localState.streamType ||
            remoteState.roomName !== localState.roomName ||
            remoteState.youtubeId !== localState.youtubeId;

      if (changed) {
        localStorage.setItem(STREAMING_STORAGE_KEY, JSON.stringify(remoteState));
        renderPlayer();
      }
    } catch (e) {
      // Ignorar errores de red temporales
    }
  }

  fetchRemoteBroadcastState();
  setInterval(fetchRemoteBroadcastState, 4000);

  // 2. Escuchar eventos de cambio desde el Búnker en la misma máquina
  window.addEventListener('storage', (e) => {
    if (e.key === STREAMING_STORAGE_KEY) {
      renderPlayer();
    }
    if (e.key === PRAYERS_STORAGE_KEY) {
      renderPrayers();
    }
  });

  // Configurar envío de peticiones
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

      // Feedback visual y sonoro
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
    viewersElem.textContent = `${state.isLive ? state.viewersCount : 0} Hermanos`;
  }

  if (titleElem) {
    titleElem.textContent = state.streamTitle || 'Culto Dominical & Ministración';
  }

  if (subtitleElem) {
    subtitleElem.textContent = `${state.location} · ${state.preacher}`;
  }

  if (state.isLive) {
    // EN VIVO
    if (badgeLive) {
      badgeLive.className = 'px-2.5 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30';
    }
    if (badgeText) {
      badgeText.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>🔴 EN VIVO AHORA';
    }

    if (!playerContainer) return;

    if (state.streamType === 'webrtc') {
      // VDO.Ninja P2P Broadcast Mode (Spectator / Viewer Only)
      const streamId = state.roomName || 'caminosdefe-live-altar';
      playerContainer.innerHTML = `
        <div class="relative w-full h-full bg-black">
          <iframe 
            src="https://vdo.ninja/?view=${encodeURIComponent(streamId)}&cleanoutput=1&transparent=0&autoplay=1&autostart=1"
            class="w-full h-full border-0 absolute inset-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen>
          </iframe>
          <div class="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-md bg-rose-600/90 text-white font-mono text-[11px] font-bold tracking-wider shadow flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
              ● SEÑAL EN DIRECTO
            </span>
            <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-emerald-400 font-mono border border-white/10">
              WebRTC Ultrabaja Latencia
            </span>
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
    } else if (state.streamType === 'custom') {
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
    // MODO STANDBY / FUERA DEL AIRE
    if (badgeLive) {
      badgeLive.className = 'px-2.5 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-400 font-mono text-xs flex items-center gap-1.5';
    }
    if (badgeText) {
      badgeText.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>⚪ FUERA DEL AIRE';
    }

    if (!playerContainer) return;
    playerContainer.innerHTML = `
      <div class="relative w-full h-full flex flex-col items-center justify-center p-6 text-center group">
        <!-- Fondo visual dinámico -->
        <div class="absolute inset-0 bg-gradient-to-t from-black via-purple-950/20 to-black pointer-events-none"></div>
        
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

// Exportar globalmente para interactuar si es necesario
window.mcfStreaming = {
  getBroadcastState,
  getPrayerRequests,
  savePrayerRequest,
  renderPlayer,
  renderPrayers
};
