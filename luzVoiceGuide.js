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

  // Eliminar cualquier widget flotante previo para dejar la pantalla limpia
  function removeLegacyPlayerUI() {
    const widget = document.getElementById('luz-voice-guide-widget');
    if (widget) widget.remove();
  }

  // Actualizar estado visual cuando habla o calla (exclusivo para Navbar 3D)
  function updatePlayerUI(speaking) {
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

  function updateCurrentLabel(title) {
    // Interfaz simplificada: sin widget inferior
  }

  // Activar Guía
  function activate() {
    state.isActive = true;
    state.isMuted = false;
    
    // Precalentar audios neurales en caché para transiciones instantáneas
    prewarmAudioCache();

    updateNavbarVoiceButton(true, false);

    // Saludo o sección actual según la posición del scroll
    const secId = state.currentSectionId || 'hero';
    const scriptData = SECTIONS_SCRIPTS[secId] || SECTIONS_SCRIPTS['hero'];
    speakScript(scriptData.text);
  }

  // Desactivar Guía
  function deactivate() {
    stopSpeaking();
    state.isActive = false;
    state.isMuted = false;
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

  // Conectar eventos del botón único en Navbar Superior
  function bindUIEvents() {
    const navVoiceBtn = document.getElementById('navbar-voice-toggle-btn');
    if (navVoiceBtn) {
      navVoiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
      });
    }
  }

  // Inicialización al cargar el DOM
  function init() {
    removeLegacyPlayerUI();
    bindUIEvents();
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
