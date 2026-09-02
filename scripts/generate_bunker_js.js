const fs = require('fs');

const bunkerJs = `/**
 * COMUNIDAD FARO DE LUZ - LÓGICA DEL BÚNKER PRIVADO Y CLIENTE SUPABASE
 * Desarrollado para Antigravity / Ecosistema Faro de Luz
 */

(function () {
  'use strict';

  // Configuración de Supabase (Variables de Entorno o Configuración por defecto)
  const SUPABASE_URL = window.__SUPABASE_URL || 'https://xyzcompany.supabase.co';
  const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  // Inicializar Supabase si está disponible la librería
  let supabase = null;
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('Supabase inicializado en modo offline/mock.');
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

  // Estado de sesión
  let currentUser = JSON.parse(sessionStorage.getItem('bunker_session') || 'null');

  function checkSession() {
    if (currentUser) {
      authGateway.classList.add('hidden');
      bunkerApp.classList.remove('hidden');
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
          console.warn('Error OAuth Supabase, activando fallback local:', err);
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
        } else {
          view.classList.add('hidden');
        }
      });
    });
  });

  // 5. Chat interactivo con el Agente Luz-02 / Triage
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      // Mensaje del usuario
      appendMessage('Director Waly', text, 'text-amber-300');
      chatInput.value = '';

      // Respuesta simulada del Agente con inteligencia técnica
      setTimeout(() => {
        let reply = 'Orden procesada. He actualizado la telemetría del nodo y verificado los parámetros de la Comunidad Faro de Luz.';
        const lower = text.toLowerCase();
        
        if (lower.includes('postulacion') || lower.includes('talento') || lower.includes('aspirante')) {
          reply = 'Se registran 12 postulaciones en la base de datos de Supabase. 2 parejas ya cuentan con perfil de evaluación completo para software y ecotecnología.';
        } else if (lower.includes('solar') || lower.includes('litio') || lower.includes('bateria') || lower.includes('agua')) {
          reply = 'Telemetría: Banco de litio al 94.2%, generación fotovoltaica a 18.4 kW en los 6 contenedores. La cisterna en torre tiene 22.000 litros disponibles.';
        } else if (lower.includes('dinero') || lower.includes('fideicomiso') || lower.includes('shopdigital') || lower.includes('plata')) {
          reply = 'El Fideicomiso registra superávit. El aporte mensual inyectado por ShopDigital ($6.500.000 ARS) cubre con holgura los $2.180.000 ARS de gastos comunales.';
        }

        appendMessage('Luz-02', reply, 'text-cyan-400');
      }, 700);
    });
  }

  function appendMessage(sender, msg, colorClass) {
    const div = document.createElement('div');
    div.className = 'flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5';
    div.innerHTML = \`
      <div class="font-bold \${colorClass}">[\${sender}]:</div>
      <div class="text-slate-200">\${msg}</div>
    \`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    checkSession();
  });

})();
`;

fs.writeFileSync('src/bunker.js', bunkerJs, 'utf8');
console.log('src/bunker.js generado exitosamente.');
