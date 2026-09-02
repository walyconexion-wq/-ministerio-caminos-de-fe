const fs = require('fs');

// 1. ACTUALIZAR scrollytelling.js Y public/src/scrollytelling.js
const formSubmitHandlerJs = `
  // ============================================================
  // GESTIÓN DEL EMBUDO DE SUSCRIPCIÓN Y CREDENCIALES (SUPABASE)
  // ============================================================
  const communityForm = document.getElementById('talent-form');
  const credentialSuccessCard = document.getElementById('credential-success-card');
  const credName = document.getElementById('cred-name');
  const credModalidad = document.getElementById('cred-modalidad');
  const credId = document.getElementById('cred-id');
  const btnWhatsappDirect = document.getElementById('btn-whatsapp-direct');

  if (communityForm) {
    communityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = communityForm.querySelector('button[type="submit"]');

      const nombre = document.getElementById('form-nombre').value.trim();
      const modalidad = document.getElementById('form-modalidad').value;
      const telefono = document.getElementById('form-telefono').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const ciudad = document.getElementById('form-ciudad').value.trim();
      const talentoEl = document.querySelector('input[name="talento"]:checked');
      const talento = talentoEl ? talentoEl.value : 'software';
      const mensaje = document.getElementById('form-mensaje').value.trim();

      if (!nombre || !telefono || !email) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin text-base">⚡</span> Procesando Credencial en el Búnker...';
      }

      // Generar código de credencial único
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const credentialCode = 'FL-2027-' + randomCode;

      // Inserción en Supabase en tiempo real
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
          console.warn('Registro local de suscripción:', err);
        }
      }

      // Renderizado visual de la Credencial Digital
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
`;

function updateScrollytellingJs(path) {
  let code = fs.readFileSync(path, 'utf8');

  const oldHandler = /if \(form\) \{[\s\S]*?\}\s*\}\);?\s*\}/;
  if (oldHandler.test(code)) {
    code = code.replace(oldHandler, formSubmitHandlerJs.trim());
    fs.writeFileSync(path, code, 'utf8');
    console.log('scrollytelling.js actualizado con credenciales en:', path);
  }
}

updateScrollytellingJs('src/scrollytelling.js');
updateScrollytellingJs('public/src/scrollytelling.js');

// 2. ACTUALIZAR bunker.html Y public/bunker.html (TAB 4 COMUNIDAD & SUSCRIPCIONES)
function updateBunkerTab4(path) {
  let html = fs.readFileSync(path, 'utf8');

  html = html.replace(
    '<span>4. Aspirantes Talentos</span>',
    '<span>4. Comunidad & Suscripciones</span>'
  );
  html = html.replace(
    '<h3 class="text-xl font-bold text-white flex items-center gap-2">\n                <span>👥</span> Triage de Aspirantes y Convocatoria de Fundadores\n              </h3>',
    '<h3 class="text-xl font-bold text-white flex items-center gap-2">\n                <span>🪪</span> Comunidad, Suscriptores y Emisión de Credenciales\n              </h3>'
  );

  fs.writeFileSync(path, html, 'utf8');
  console.log('bunker.html actualizado en:', path);
}

updateBunkerTab4('bunker.html');
updateBunkerTab4('public/bunker.html');

// 3. ACTUALIZAR bunker.js CON BOTÓN DE ENVIAR CREDENCIAL WHATSAPP
function updateBunkerJsCreds(path) {
  let code = fs.readFileSync(path, 'utf8');

  const oldRender = /tr\.innerHTML = `[\s\S]*?<\/td>\s*`;/;

  const newRender = `tr.innerHTML = \`
            <td class="p-4 font-sans font-semibold text-white">\${p.nombre_completo}</td>
            <td class="p-4 text-slate-300 text-xs">\${p.modalidad}</td>
            <td class="p-4 text-cyan-300 font-medium">\${talentoIcon}</td>
            <td class="p-4 text-slate-400">\${p.telefono_whatsapp}<br><span class="text-[10px] text-slate-500">\${p.email}</span></td>
            <td class="p-4">
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-mono">
                \${p.estado_evaluacion || 'Suscripción Activa'}
              </span>
            </td>
            <td class="p-4 text-right flex items-center justify-end gap-2">
              <a href="https://api.whatsapp.com/send?phone=\${p.telefono_whatsapp.replace(/[^0-9]/g, '')}&text=\${encodeURIComponent('¡Hola ' + p.nombre_completo + '! Te saludamos desde la Dirección de la Comunidad Faro de Luz. Te confirmamos la emisión de tu Credencial Digital de Miembro. ¡Bienvenido a nuestra comunidad!')}" target="_blank" class="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[10px] font-mono transition-all">
                🪪 WhatsApp Credencial
              </a>
              <button class="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-[10px] font-mono transition-all" onclick="alert('Detalles de Suscripción / Mensaje: \n\n' + '\${p.experiencia_motivacion}')">
                Ver Ficha
              </button>
            </td>
          \`;`;

  if (oldRender.test(code)) {
    code = code.replace(oldRender, newRender);
    fs.writeFileSync(path, code, 'utf8');
    console.log('bunker.js actualizado con emisión de credenciales en:', path);
  }
}

updateBunkerJsCreds('src/bunker.js');
updateBunkerJsCreds('public/src/bunker.js');
