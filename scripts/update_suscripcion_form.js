const fs = require('fs');

// 1. ACTUALIZAR SECCIÓN EN index.html Y public/index.html
const suscripcionSection = `
      <!-- ESCENA: EMBUDO DE SUSCRIPCIÓN, CONTACTO Y COMUNIDAD (#comunidad) -->
      <section id="formacion" class="min-h-[160vh] flex flex-col items-center justify-center px-4 py-20">
        <div id="postulacion" class="max-w-5xl w-full glass-card-faro border-amber-500/35 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl shadow-black/80 space-y-8">
          
          <!-- Encabezado del Embudo -->
          <div class="text-center max-w-3xl mx-auto space-y-3">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest">
              ✨ Sé Parte del Ecosistema · Suscripción & Conexión
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase drop-shadow-xl">
              Sumate a la Comunidad Faro de Luz
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 font-light max-w-2xl mx-auto text-shadow-faro leading-relaxed">
              Te invitamos a conectarte con nuestra visión. Al suscribirte recibirás tu <strong>Credencial Digital de la Comunidad</strong>, noticias exclusivas de nuestros proyectos, reportes de la base de montaña y una línea de contacto directa con el equipo de coordinación y el Director Waly.
            </p>
          </div>

          <!-- BANNER DE BENEFICIOS DEL MIEMBRO / SUSCRIPTOR -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1">
              <div class="text-2xl">🪪</div>
              <div class="font-bold text-white text-xs">Credencial Digital</div>
              <div class="text-[10px] text-slate-400">ID oficial de miembro o amigo</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1">
              <div class="text-2xl">📩</div>
              <div class="font-bold text-amber-300 text-xs">Bitácora & Avances</div>
              <div class="text-[10px] text-slate-400">Noticias de obras y proyectos</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1">
              <div class="text-2xl">💬</div>
              <div class="font-bold text-cyan-300 text-xs">Línea Directa</div>
              <div class="text-[10px] text-slate-400">Canal prioritario por WhatsApp</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1">
              <div class="text-2xl">👑</div>
              <div class="font-bold text-purple-300 text-xs">Fundadores</div>
              <div class="text-[10px] text-slate-400">Postulación a las 6 parejas</div>
            </div>
          </div>

          <!-- FORMULARIO DE CONTACTO Y SUSCRIPCIÓN -->
          <form id="talent-form" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Nombre y Apellido / Matrimonio *</label>
                <input type="text" id="form-nombre" required placeholder="Ej: Waly y Andrea Miranda" class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Modalidad de Interés / Conexión *</label>
                <select id="form-modalidad" required class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all">
                  <option value="Aspirante a Pareja Fundadora">👑 Aspirante a Pareja Fundadora (Base Traslasierra)</option>
                  <option value="Miembro Adherente / Voluntario">🤝 Miembro Adherente / Voluntario Comunitario</option>
                  <option value="Talento Tech ShopDigital">💻 Talento Tecnológico / Desarrollador ShopDigital</option>
                  <option value="Suscriptor Amigo de la Comunidad">📩 Suscriptor Amigo / Noticias y Oración</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">WhatsApp / Teléfono Móvil *</label>
                <input type="tel" id="form-telefono" required placeholder="+54 9 11 ..." class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Correo Electrónico *</label>
                <input type="email" id="form-email" required placeholder="correo@ejemplo.com" class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Ciudad / Provincia *</label>
                <input type="text" id="form-ciudad" required placeholder="Ej: Córdoba / Buenos Aires" class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Área de Afinidad / Talento Principal *</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-white/10 hover:border-cyan-400/40 cursor-pointer transition-all">
                  <input type="radio" name="talento" value="software" checked class="text-cyan-500 focus:ring-cyan-400">
                  <span>💻 <strong>Software & IA:</strong> Desarrollo Cloud en ShopDigital</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-white/10 hover:border-amber-400/40 cursor-pointer transition-all">
                  <input type="radio" name="talento" value="infraestructura" class="text-amber-500 focus:ring-amber-400">
                  <span>🔋 <strong>Infraestructura:</strong> Solar, litio, agua y bioconstrucción</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-white/10 hover:border-emerald-400/40 cursor-pointer transition-all">
                  <input type="radio" name="talento" value="logistica" class="text-emerald-500 focus:ring-emerald-400">
                  <span>🚐 <strong>Logística & Acción Social:</strong> Fundación y comunidad</span>
                </label>
                <label class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-white/10 hover:border-purple-400/40 cursor-pointer transition-all">
                  <input type="radio" name="talento" value="administracion" class="text-purple-500 focus:ring-purple-400">
                  <span>📊 <strong>Administración & Fe:</strong> Gestión legal, culto y convivencia</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Mensaje / Motivación *</label>
              <textarea id="form-mensaje" rows="3" required placeholder="Contanos brevemente qué te motiva a sumarte, tu experiencia previa o cómo te gustaría participar en Faro de Luz..." class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none"></textarea>
            </div>

            <div class="text-center pt-2">
              <button type="submit" class="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto">
                <span>Sumarme a la Comunidad & Recibir Credencial</span>
                <span>🚀</span>
              </button>
            </div>
          </form>

          <!-- TARJETA VISUAL DE CONFIRMACIÓN Y CREDENCIAL DIGITAL -->
          <div id="credential-success-card" class="hidden space-y-6 pt-4 border-t border-white/10 animate-fade-in">
            <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1424] via-[#0E1A2D] to-[#0A0F1A] border-2 border-amber-400/50 shadow-2xl relative overflow-hidden">
              
              <!-- Glow decorativo -->
              <div class="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden border border-amber-400/60 shadow-lg flex items-center justify-center bg-black/60">
                    <img src="/favicon-faro.svg" alt="Faro de Luz" class="w-full h-full object-cover">
                  </div>
                  <div>
                    <div class="font-serif font-bold text-white text-base tracking-wider">COMUNIDAD FARO DE LUZ</div>
                    <div class="text-[10px] text-amber-300 font-mono uppercase tracking-widest">Credencial Digital de Suscripción</div>
                  </div>
                </div>
                <div class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                  ● REGISTRO CONFIRMADO
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 items-center text-xs">
                <div>
                  <span class="text-slate-400 block text-[10px] uppercase font-mono mb-1">Nombre / Titular:</span>
                  <strong id="cred-name" class="text-white text-base font-serif">Titular</strong>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px] uppercase font-mono mb-1">Modalidad:</span>
                  <span id="cred-modalidad" class="text-amber-300 font-bold">Modalidad</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px] uppercase font-mono mb-1">Código de Credencial:</span>
                  <span id="cred-id" class="text-cyan-300 font-mono font-bold text-sm">FL-2027-0000</span>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-200 leading-relaxed space-y-2">
                <p>
                  🎉 <strong>¡Felicitaciones y bienvenido a la Comunidad Faro de Luz!</strong> Tus datos ingresaron de forma segura al Búnker Central de Coordinación.
                </p>
                <p class="text-slate-400 text-[11px]">
                  El Director Waly y el equipo de coordinación se pondrán en contacto con vos vía WhatsApp para enviarte tu credencial formal, sumarte a la bitácora de novedades y coordinar los próximos pasos.
                </p>
              </div>

              <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span class="text-[11px] text-slate-400 font-mono">Búnker Central · Traslasierra, Córdoba</span>
                <a id="btn-whatsapp-direct" href="https://wa.me/5491100000000" target="_blank" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                  <span>Hablar con el Director Waly en WhatsApp</span>
                  <span>💬</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>
`;

function replaceFormSection(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Actualizar botón del Navbar de Postulación a "Sumarme"
  html = html.replace(
    'href="#postulacion" class="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">\n          Postulación\n        </a>',
    'href="#postulacion" class="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">\n          Sumarme / Contacto\n        </a>'
  );

  // Reemplazar la sección
  const oldSectionRegex = /<!-- ESCENA 6: CENTRO DE FORMACIÓN[\s\S]*?<\/section>/;
  if (oldSectionRegex.test(html)) {
    html = html.replace(oldSectionRegex, suscripcionSection.trim());
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Sección de Suscripción y Credenciales inyectada en:', filePath);
  }
}

replaceFormSection('index.html');
replaceFormSection('public/index.html');
