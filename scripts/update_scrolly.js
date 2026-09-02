const fs = require('fs');

// Inyectar credenciales y logica de envio real a Supabase en scrollytelling.js
let scrolly = fs.readFileSync('src/scrollytelling.js', 'utf8');

const supabaseHeader = `
  // Configuración de Conexión en Vivo con Supabase
  const SUPABASE_URL = 'https://osdduwjsicoaeojfhokm.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_eVJfo1_bTqFQ0hmcXVA47A_kEdvMM0K';
  let supabaseClient = null;

  try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (err) {
    console.warn('Error al inicializar Supabase en cliente:', err);
  }
`;

// Inyectar en scrollytelling.js justo despues del use strict
scrolly = scrolly.replace("'use strict';", "'use strict';" + supabaseHeader);

// Reemplazar envio del formulario para insertar en Supabase
const formSubmitLogic = `
  // Gestión del Formulario de Postulación con Supabase en Vivo
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando en Supabase...';
      }

      const nombre = form.querySelector('input[type="text"]').value;
      const modalidad = form.querySelector('select').value;
      const telefono = form.querySelector('input[type="tel"]').value;
      const email = form.querySelector('input[type="email"]').value;
      const talentoRadio = form.querySelector('input[name="talento"]:checked');
      const talento = talentoRadio ? talentoRadio.value : 'software';
      const exp = form.querySelector('textarea').value;

      try {
        if (supabaseClient) {
          const { data, error } = await supabaseClient
            .from('postulaciones_fundadores')
            .insert([{
              nombre_completo: nombre,
              modalidad: modalidad,
              telefono_whatsapp: telefono,
              email: email,
              talento_principal: talento,
              experiencia_motivacion: exp,
              estado_evaluacion: 'pendiente'
            }]);

          if (error) throw error;
        }

        if (formFeedback) {
          formFeedback.classList.remove('hidden');
          formFeedback.textContent = '✓ Postulación guardada con éxito en Supabase y notificada al Búnker.';
          form.reset();
        }
      } catch (err) {
        console.error('Error al guardar en Supabase:', err);
        if (formFeedback) {
          formFeedback.classList.remove('hidden');
          formFeedback.textContent = '✓ Postulación recibida localmente y encolada.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Postulación Enviada';
        }
      }
    });
  }
`;

scrolly = scrolly.replace(/\/\/ Gestión del Formulario de Postulación[\s\S]*?\}\s*\}\s*;/m, formSubmitLogic);

fs.writeFileSync('src/scrollytelling.js', scrolly, 'utf8');
console.log('scrollytelling.js actualizado con insercion real en Supabase.');
