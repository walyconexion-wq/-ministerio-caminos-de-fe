/**
 * LUZ VOICE GUIDE - Sistema de Audio-Guía Espacial y Web Sonora (SNC 2.0)
 * Diseñado por Luz 01 para el Director Waly.
 * 
 * - Detección de secciones por IntersectionObserver.
 * - Consentimiento primero (cumplimiento estricto de autoplay de navegadores).
 * - Motor de voz natural calibrado (Web Speech API + selector de voces en español).
 * - Mini-reproductor neumórfico 3D flotante no invasivo.
 * - Respeto al silencio: frases cortas de 5-7s, cooldown inteligente y cancelación por scroll rápido.
 */
(function() {
  'use strict';

  // Configuración de Guiones Pastorales y Cálidos por Sección
  const SECTIONS_SCRIPTS = {
    'hero': {
      title: 'Bienvenida',
      text: 'Bienvenido a Caminos de Fe. Te acompaño en este recorrido de fe, oración y comunidad en las sierras.'
    },
    'mision-vision': {
      title: 'Nuestra Misión',
      text: 'Aquí compartimos el corazón de nuestra misión, guiados por la palabra y el amor al prójimo.'
    },
    'ecosistema': {
      title: 'Ecosistema de Luz',
      text: 'Conocé nuestro ecosistema: el Ministerio, la Fundación Valle de Luz y la Comunidad Faro de Luz.'
    },
    'regla-tiempo': {
      title: 'Tiempos de Fe',
      text: 'Aquí podés consultar los horarios de cultos, vigilias y momentos de oración comunitaria.'
    },
    'legalidad': {
      title: 'Fichero Legal & Cero Diezmo',
      text: 'En Caminos de Fe el sustento es 100% autónomo a través de ShopDigital. Sin diezmos forzados, con total transparencia y legalidad a la vista.'
    },
    'ubicacion': {
      title: 'Altar de Montaña',
      text: 'Nuestro altar se encuentra en Panaholma, en el corazón del Valle de Traslasierra.'
    },
    'galeria': {
      title: 'Registro Visual',
      text: 'Recorré los momentos compartidos, cultos al aire libre y encuentros en las sierras.'
    },
    'formacion': {
      title: 'Formación y Voluntariado',
      text: 'Sumate a nuestros programas de formación, discipulado y servicio a la comunidad.'
    },
    'postulacion': {
      title: 'Postulación',
      text: 'Si sentís el llamado a colaborar, completá el formulario y nos contactaremos con vos.'
    }
  };

  // Estado del Sistema
  const state = {
    isActive: false,       // Activado por el usuario
    isSpeaking: false,     // Hablando actualmente
    isMuted: false,        // Silenciado temporalmente
    currentSectionId: null,// Sección actual
    lastSpokenTime: {},    // Control de cooldown para no repetir (timestamp)
    synth: window.speechSynthesis || null,
    currentUtterance: null,
    preferredVoice: null,
    currentAudio: null,    // Instancia HTML5 Audio para voz neural natural
    audioCache: {}         // Pre-calentamiento de audios
  };

  // Precalentar audios neurales en caché del navegador (Vercel Edge /api/tts)
  function prewarmAudioCache() {
    try {
      Object.keys(SECTIONS_SCRIPTS).forEach(key => {
        const text = SECTIONS_SCRIPTS[key].text;
        const url = `/api/tts?voice=es-AR-ElenaNeural&text=${encodeURIComponent(text)}`;
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        state.audioCache[key] = audio;
      });
    } catch(e) {
      console.warn('Error en prewarmAudioCache:', e);
    }
  }

  // Buscar mejor voz en español para fallback en SpeechSynthesis si no hay red
  function resolveBestVoice() {
    if (!state.synth) return null;
    const voices = state.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    let voice = voices.find(v => v.lang === 'es-AR') ||
                voices.find(v => v.lang.startsWith('es-') && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('helena') || v.name.toLowerCase().includes('sabina') || v.name.toLowerCase().includes('zira'))) ||
                voices.find(v => v.lang.startsWith('es-419')) ||
                voices.find(v => v.lang.startsWith('es'));

    return voice || voices[0];
  }

  if (state.synth && state.synth.onvoiceschanged !== undefined) {
    state.synth.onvoiceschanged = () => {
      state.preferredVoice = resolveBestVoice();
    };
  }

  // Hablar frase de sección usando Voz Neural Humana Argentina (es-AR-ElenaNeural)
  function speakScript(text, onComplete) {
    if (!state.isActive || state.isMuted) return;

    // Detener cualquier audio previo
    stopSpeaking();

    // 1. INTENTO PRINCIPAL: Audio Neural de Microsoft Edge Elena Argentina vía API Vercel
    try {
      const ttsUrl = `/api/tts?voice=es-AR-ElenaNeural&text=${encodeURIComponent(text)}`;
      const audio = new Audio(ttsUrl);
      state.currentAudio = audio;
      audio.volume = 1.0;

      audio.onplay = () => {
        state.isSpeaking = true;
        updatePlayerUI(true);
        updateNavbarVoiceButton(true, true);
      };

      audio.onended = () => {
        state.isSpeaking = false;
        state.currentAudio = null;
        updatePlayerUI(false);
        updateNavbarVoiceButton(true, false);
        if (onComplete) onComplete();
      };

      audio.onerror = (err) => {
        console.warn('Error en streaming neural, recurriendo a SpeechSynthesis local:', err);
        state.isSpeaking = false;
        state.currentAudio = null;
        updatePlayerUI(false);
        updateNavbarVoiceButton(true, false);
        speakWithSpeechSynthesis(text, onComplete);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Interrupción o política de autoplay del navegador:', err);
          state.isSpeaking = false;
          updatePlayerUI(false);
          updateNavbarVoiceButton(true, false);
        });
      }
      return;
    } catch (e) {
      console.warn('Fallo en reproductor Audio neural:', e);
      speakWithSpeechSynthesis(text, onComplete);
    }
  }

  // Fallback secundario con Web Speech API
  function speakWithSpeechSynthesis(text, onComplete) {
    if (!state.synth || !state.isActive || state.isMuted) return;

    try {
      state.synth.cancel();
    } catch(e) {}

    const utterance = new SpeechSynthesisUtterance(text);
    if (!state.preferredVoice) {
      state.preferredVoice = resolveBestVoice();
    }
    if (state.preferredVoice) {
      utterance.voice = state.preferredVoice;
    }
    utterance.lang = state.preferredVoice ? state.preferredVoice.lang : 'es-AR';
    utterance.pitch = 1.04;
    utterance.rate = 0.94;
    utterance.volume = 0.95;

    utterance.onstart = () => {
      state.isSpeaking = true;
      updatePlayerUI(true);
      updateNavbarVoiceButton(true, true);
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      updatePlayerUI(false);
      updateNavbarVoiceButton(true, false);
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      state.isSpeaking = false;
      updatePlayerUI(false);
      updateNavbarVoiceButton(true, false);
    };

    state.currentUtterance = utterance;
    state.synth.speak(utterance);
  }

  // Detener la voz suavemente
  function stopSpeaking() {
    if (state.currentAudio) {
      try {
        state.currentAudio.pause();
        state.currentAudio.currentTime = 0;
      } catch(e) {}
      state.currentAudio = null;
    }
    if (state.synth) {
      try {
        state.synth.cancel();
      } catch(e) {}
    }
    state.isSpeaking = false;
    updatePlayerUI(false);
    updateNavbarVoiceButton(state.isActive, false);
  }

  // Intersección de secciones al escrolear
  function setupScrollObserver() {
    const sectionIds = Object.keys(SECTIONS_SCRIPTS);
    const elementsToObserve = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) elementsToObserve.push(el);
    });

    if (elementsToObserve.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      if (!state.isActive || state.isMuted) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          const sectionId = entry.target.id;
          const now = Date.now();
          const lastTime = state.lastSpokenTime[sectionId] || 0;

          // Cooldown de 45 segundos para no ser repetitivo si el usuario sube y baja
          if (now - lastTime > 45000 && sectionId !== state.currentSectionId) {
            state.currentSectionId = sectionId;
            state.lastSpokenTime[sectionId] = now;

            const scriptData = SECTIONS_SCRIPTS[sectionId];
            if (scriptData) {
              updateCurrentLabel(scriptData.title);
              // Pequeño retardo de 250ms para que el usuario termine de acomodar la vista
              setTimeout(() => {
                if (state.currentSectionId === sectionId && state.isActive) {
                  speakScript(scriptData.text);
                }
              }, 250);
            }
          }
        }
      });
    }, {
      threshold: [0.35, 0.6]
    });

    elementsToObserve.forEach(el => observer.observe(el));
  }

  // Construcción del Mini-Reproductor Neumórfico Flotante
  function injectPlayerUI() {
    if (document.getElementById('luz-voice-guide-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'luz-voice-guide-widget';
    widget.className = 'fixed bottom-4 left-4 z-40 flex items-center select-none font-sans transition-all duration-300';

    widget.innerHTML = `
      <!-- ESTADO 1: BOTÓN DE ACTIVACIÓN COMPACTO (Inicial - Oculto por defecto ya que el Navbar superior es el disparador principal) -->
      <button id="btn-activate-voice-guide" type="button" class="hidden group items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#0b0f19]/90 hover:bg-[#131b2e] border border-amber-500/40 shadow-lg shadow-black/70 backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 text-left cursor-pointer">
        <div class="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-400/40 flex items-center justify-center shadow-inner">
          <svg class="w-4 h-4 text-amber-300 group-hover:text-amber-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        </div>
        <div>
          <div class="text-[11px] sm:text-xs font-bold text-amber-200 group-hover:text-amber-100 flex items-center gap-1.5">
            Guía con Luz
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono">Audio</span>
          </div>
          <div class="text-[9px] text-zinc-400 leading-none mt-0.5">Tocá para escuchar al navegar</div>
        </div>
      </button>

      <!-- ESTADO 2: PANEL DE CONTROL ACTIVO (Oculto al inicio) -->
      <div id="panel-voice-guide-active" class="hidden flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#090d16]/95 border border-amber-500/50 shadow-2xl shadow-black/90 backdrop-blur-md">
        <!-- Ecualizador de ondas animadas -->
        <div class="flex items-center gap-0.5 h-4 px-1" title="Luz hablando">
          <span class="voice-bar w-1 bg-amber-400 rounded-full h-2 transition-all"></span>
          <span class="voice-bar w-1 bg-amber-300 rounded-full h-3 transition-all"></span>
          <span class="voice-bar w-1 bg-amber-400 rounded-full h-1.5 transition-all"></span>
        </div>

        <div class="text-left pr-1">
          <div class="text-[10px] font-bold text-amber-300 leading-tight">Guía Activa</div>
          <div id="voice-guide-section-label" class="text-[9px] text-zinc-300 font-mono leading-tight max-w-[110px] sm:max-w-[140px] truncate">
            Bienvenida
          </div>
        </div>

        <!-- Botón Repetir Sección Actual -->
        <button id="btn-replay-voice-guide" type="button" class="w-7 h-7 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-600/50 flex items-center justify-center text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer" title="Repetir sección">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <!-- Botón Mute / Pausa -->
        <button id="btn-toggle-voice-mute" type="button" class="w-7 h-7 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-600/50 flex items-center justify-center text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer" title="Silenciar / Reanudar">
          <svg id="icon-voice-sound" class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <svg id="icon-voice-muted" class="w-3.5 h-3.5 text-rose-400 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </button>

        <!-- Botón Cerrar Guía -->
        <button id="btn-close-voice-guide" type="button" class="w-6 h-6 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition-colors ml-0.5 cursor-pointer" title="Desactivar guía">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(widget);

    // Animación CSS para las barras del ecualizador
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes voiceWave {
        0%, 100% { height: 4px; }
        50% { height: 16px; }
      }
      .voice-speaking .voice-bar:nth-child(1) { animation: voiceWave 0.6s infinite ease-in-out; }
      .voice-speaking .voice-bar:nth-child(2) { animation: voiceWave 0.4s infinite ease-in-out 0.1s; }
      .voice-speaking .voice-bar:nth-child(3) { animation: voiceWave 0.5s infinite ease-in-out 0.2s; }
    `;
    document.head.appendChild(style);

    bindUIEvents();
  }

  // Actualizar etiqueta de la sección en el reproductor
  function updateCurrentLabel(title) {
    const label = document.getElementById('voice-guide-section-label');
    if (label) label.textContent = title;
  }

  // Actualizar estado visual cuando habla o calla
  function updatePlayerUI(speaking) {
    const panel = document.getElementById('panel-voice-guide-active');
    if (panel) {
      if (speaking) {
        panel.classList.add('voice-speaking');
      } else {
        panel.classList.remove('voice-speaking');
      }
    }
    updateNavbarVoiceButton(state.isActive, speaking);
  }

  // Sincronizar apariencia del botón 3D en la barra superior (Navbar)
  function updateNavbarVoiceButton(isActive, isSpeaking) {
    const btn = document.getElementById('navbar-voice-toggle-btn');
    if (!btn) return;

    const pulse = document.getElementById('nav-voice-pulse');
    const dot = document.getElementById('nav-voice-dot');
    const badge = document.getElementById('nav-voice-badge');
    const waves = document.getElementById('nav-voice-waves');
    const icon = document.getElementById('nav-voice-icon');
    const label = document.getElementById('nav-voice-label');

    if (isActive) {
      btn.classList.add('voice-active');
      if (dot) {
        dot.className = 'relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]';
      }
      if (pulse) {
        pulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80';
      }
      if (badge) {
        badge.textContent = 'ON';
        badge.className = 'hidden sm:inline-block text-[8px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-bold tracking-wider';
      }
      if (isSpeaking) {
        if (waves) {
          waves.classList.remove('hidden');
          waves.classList.add('flex');
        }
        if (icon) icon.classList.add('hidden');
      } else {
        if (waves) {
          waves.classList.add('hidden');
          waves.classList.remove('flex');
        }
        if (icon) icon.classList.remove('hidden');
      }
    } else {
      btn.classList.remove('voice-active');
      if (dot) {
        dot.className = 'relative inline-flex rounded-full h-2 w-2 bg-amber-500';
      }
      if (pulse) {
        pulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75';
      }
      if (badge) {
        badge.textContent = 'OFF';
        badge.className = 'hidden sm:inline-block text-[8px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold tracking-wider';
      }
      if (waves) {
        waves.classList.add('hidden');
        waves.classList.remove('flex');
      }
      if (icon) icon.classList.remove('hidden');
    }
  }

  // Activar Guía
  function activate() {
    state.isActive = true;
    state.isMuted = false;
    
    // Precalentar audios neurales en caché para transiciones instantáneas
    prewarmAudioCache();

    const panelActive = document.getElementById('panel-voice-guide-active');
    const btnActivate = document.getElementById('btn-activate-voice-guide');
    if (btnActivate) btnActivate.classList.add('hidden');
    if (panelActive) panelActive.classList.remove('hidden');
    
    updateNavbarVoiceButton(true, false);

    // Saludo o sección actual según la posición del scroll
    const secId = state.currentSectionId || 'hero';
    const scriptData = SECTIONS_SCRIPTS[secId] || SECTIONS_SCRIPTS['hero'];
    updateCurrentLabel(scriptData.title);
    speakScript(scriptData.text);
  }

  // Desactivar Guía
  function deactivate() {
    stopSpeaking();
    state.isActive = false;
    state.isMuted = false;
    
    const panelActive = document.getElementById('panel-voice-guide-active');
    const btnActivate = document.getElementById('btn-activate-voice-guide');
    if (panelActive) panelActive.classList.add('hidden');
    if (btnActivate) btnActivate.classList.add('hidden');
    
    updateNavbarVoiceButton(false, false);
  }

  // Alternar Guía (Toggle) con Feedback Háptico
  function toggle() {
    if (typeof window.playHapticPop === 'function') {
      try { window.playHapticPop(); } catch(e) {}
    }
    if (state.isActive) {
      deactivate();
    } else {
      activate();
    }
  }

  // Conectar eventos de los botones
  function bindUIEvents() {
    const btnActivate = document.getElementById('btn-activate-voice-guide');
    const panelActive = document.getElementById('panel-voice-guide-active');
    const btnReplay = document.getElementById('btn-replay-voice-guide');
    const btnMute = document.getElementById('btn-toggle-voice-mute');
    const btnClose = document.getElementById('btn-close-voice-guide');
    const iconSound = document.getElementById('icon-voice-sound');
    const iconMuted = document.getElementById('icon-voice-muted');
    const navVoiceBtn = document.getElementById('navbar-voice-toggle-btn');

    // 0. Botón en el Navbar Superior
    if (navVoiceBtn) {
      navVoiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
      });
    }

    // 1. Activar Guía desde Widget Flotante
    if (btnActivate) {
      btnActivate.addEventListener('click', () => {
        activate();
      });
    }

    // 2. Repetir Sección Actual
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        const secId = state.currentSectionId || 'hero';
        const scriptData = SECTIONS_SCRIPTS[secId] || SECTIONS_SCRIPTS['hero'];
        updateCurrentLabel(scriptData.title);
        speakScript(scriptData.text);
      });
    }

    // 3. Silenciar / Reanudar
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        state.isMuted = !state.isMuted;
        if (state.isMuted) {
          stopSpeaking();
          if (iconSound) iconSound.classList.add('hidden');
          if (iconMuted) iconMuted.classList.remove('hidden');
        } else {
          if (iconSound) iconSound.classList.remove('hidden');
          if (iconMuted) iconMuted.classList.add('hidden');
          // Reanudar sección actual
          const secId = state.currentSectionId || 'hero';
          const scriptData = SECTIONS_SCRIPTS[secId];
          if (scriptData) speakScript(scriptData.text);
        }
      });
    }

    // 4. Desactivar / Cerrar Guía
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        deactivate();
      });
    }
  }

  // Inicialización al cargar el DOM
  function init() {
    injectPlayerUI();
    setupScrollObserver();
    updateNavbarVoiceButton(state.isActive, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exportar API global para interoperabilidad
  window.luzVoiceGuide = {
    activate,
    deactivate,
    toggle,
    speakScript,
    stopSpeaking,
    getState: () => ({ ...state })
  };
})();
