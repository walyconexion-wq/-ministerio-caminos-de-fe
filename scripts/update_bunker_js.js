const fs = require('fs');

const bunkerJs = `/**
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

          tr.innerHTML = \`
            <td class="p-4 font-sans font-semibold text-white">\${p.nombre_completo}</td>
            <td class="p-4 capitalize text-slate-300">\${p.modalidad}</td>
            <td class="p-4 text-cyan-300 font-medium">\${talentoIcon}</td>
            <td class="p-4 text-slate-400">\${p.telefono_whatsapp}<br><span class="text-[10px] text-slate-500">\${p.email}</span></td>
            <td class="p-4">
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-mono">
                \${p.estado_evaluacion || 'Pendiente'}
              </span>
            </td>
            <td class="p-4 text-right">
              <button class="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-[10px] font-mono transition-all" onclick="alert('Evaluando postulacion de \${p.nombre_completo}: \\n\\nMotivacion: \${p.experiencia_motivacion}')">
                Evaluar
              </button>
            </td>
          \`;
          postulantesTbody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Error al cargar postulaciones de Supabase:', err);
    }
  }

  // 6. Chat interactivo con el Agente Luz-02 / Triage
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendMessage('Director Waly', text, 'text-amber-300');
      chatInput.value = '';

      setTimeout(() => {
        let reply = 'Orden procesada. He actualizado la telemetría del nodo y sincronizado con Supabase PostgreSQL.';
        const lower = text.toLowerCase();
        
        if (lower.includes('postulacion') || lower.includes('talento') || lower.includes('aspirante')) {
          reply = 'Tabla de Supabase sincronizada. Las postulaciones de aspirantes a fundadores se almacenan en tiempo real en la base de datos de São Paulo.';
        } else if (lower.includes('solar') || lower.includes('litio') || lower.includes('bateria') || lower.includes('agua')) {
          reply = 'Telemetría: Banco de litio al 94.2%, generación fotovoltaica a 18.4 kW en los 6 contenedores. Cisterna en torre al 88% con 22.000 L.';
        } else if (lower.includes('dinero') || lower.includes('fideicomiso') || lower.includes('shopdigital') || lower.includes('plata')) {
          reply = 'Fideicomiso en superávit. El aporte mensual inyectado por ShopDigital ($6.500.000 ARS) cubre holgadamente los $2.180.000 ARS de gastos comunales.';
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
console.log('src/bunker.js conectado a Supabase en vivo.');
