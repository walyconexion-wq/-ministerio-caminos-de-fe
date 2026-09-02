const fs = require('fs');

const ecosistemaSection = `
      <!-- ESCENA NUEVA: ECOSISTEMA INTEGRADO (4 PILARES & ENLACES DE NAVEGACIÓN) -->
      <section id="ecosistema" class="min-h-[140vh] flex flex-col items-center justify-center px-4 py-16">
        <div class="max-w-6xl w-full space-y-8">
          
          <!-- Encabezado de Sección -->
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-3">
              🌐 Arquitectura de 4 Pilares Independientes
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase drop-shadow-xl mb-3">
              Nuestro Ecosistema Integrado
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 font-light max-w-2xl mx-auto text-shadow-faro leading-relaxed">
              Un modelo armónico donde la tecnología de alto rendimiento, la vida en la montaña, la acción social y la fe se potencian mutuamente. Conocé cada una de nuestras cuatro plataformas oficiales:
            </p>
          </div>

          <!-- GRID DE LAS 4 PLATAFORMAS DEL ECOSISTEMA -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <!-- 1. ShopDigital -->
            <div class="glass-card-faro rounded-3xl p-6 shadow-2xl hover:border-cyan-400/50 transition-all group flex flex-col justify-between transform hover:scale-[1.02]">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    💻
                  </div>
                  <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono uppercase tracking-widest">
                    Motor Económico
                  </span>
                </div>
                <h3 class="font-serif text-xl font-bold text-white mb-2">ShopDigital</h3>
                <p class="text-xs text-slate-300 leading-relaxed text-shadow-faro mb-4">
                  Empresa madre de software, desarrollo cloud, automatización e IA. Genera el 100% del sustento financiero de la comunidad (Regla 70/20/10).
                </p>
                <div class="text-[11px] font-mono text-cyan-300 space-y-1 mb-6 border-t border-white/10 pt-3">
                  <div>⚡ Software & Cloud</div>
                  <div>⚡ Sustento 100% Comunal</div>
                </div>
              </div>
              <a href="https://shopdigital.ar" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/30 text-cyan-300 hover:text-slate-950 font-semibold text-xs font-mono text-center transition-all flex items-center justify-center gap-2 shadow-md">
                <span>Explorar ShopDigital</span>
                <span>↗</span>
              </a>
            </div>

            <!-- 2. Comunidad Faro de Luz -->
            <div class="glass-card-faro rounded-3xl p-6 shadow-2xl border-amber-500/40 hover:border-amber-400/60 transition-all group flex flex-col justify-between transform hover:scale-[1.02]">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🏔️
                  </div>
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono uppercase tracking-widest">
                    Base Central
                  </span>
                </div>
                <h3 class="font-serif text-xl font-bold text-white mb-2">Faro de Luz</h3>
                <p class="text-xs text-slate-300 leading-relaxed text-shadow-faro mb-4">
                  Hábitat modular de montaña en Traslasierra, Córdoba. 6 viviendas en contenedores 40ft, Domo central, microrred solar y Co-Housing.
                </p>
                <div class="text-[11px] font-mono text-amber-300 space-y-1 mb-6 border-t border-white/10 pt-3">
                  <div>🏡 6 Familias Fundadoras</div>
                  <div>🔋 Ecotecnología & Litio</div>
                </div>
              </div>
              <a href="#hero" class="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-slate-950 font-semibold text-xs font-mono text-center transition-all flex items-center justify-center gap-2 shadow-md">
                <span>Estás Aquí (Base)</span>
                <span>✓</span>
              </a>
            </div>

            <!-- 3. Fundación Valle de Luz -->
            <div class="glass-card-faro rounded-3xl p-6 shadow-2xl hover:border-emerald-400/50 transition-all group flex flex-col justify-between transform hover:scale-[1.02]">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🤝
                  </div>
                  <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono uppercase tracking-widest">
                    Acción Social
                  </span>
                </div>
                <h3 class="font-serif text-xl font-bold text-white mb-2">Valle de Luz</h3>
                <p class="text-xs text-slate-300 leading-relaxed text-shadow-faro mb-4">
                  Brazo filantrópico y social. Asistencia a parajes rurales de Traslasierra, comedores y logística con flota Hilux 4x4 y Sprinter.
                </p>
                <div class="text-[11px] font-mono text-emerald-300 space-y-1 mb-6 border-t border-white/10 pt-3">
                  <div>🚐 Logística Comunitaria</div>
                  <div>🍲 Comedores y Apoyo Social</div>
                </div>
              </div>
              <button onclick="alert('Fundación Valle de Luz: Próximamente plataforma oficial en vivo por la Agente Luz-03.')" class="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-300 hover:text-slate-950 font-semibold text-xs font-mono text-center transition-all flex items-center justify-center gap-2 shadow-md">
                <span>Conocer Fundación</span>
                <span>↗</span>
              </button>
            </div>

            <!-- 4. Ministerio Caminos de Fe -->
            <div class="glass-card-faro rounded-3xl p-6 shadow-2xl hover:border-purple-400/50 transition-all group flex flex-col justify-between transform hover:scale-[1.02]">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    ✝️
                  </div>
                  <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono uppercase tracking-widest">
                    Culto & Fe
                  </span>
                </div>
                <h3 class="font-serif text-xl font-bold text-white mb-2">Caminos de Fe</h3>
                <p class="text-xs text-slate-300 leading-relaxed text-shadow-faro mb-4">
                  Centro de culto cristiano, discipulado de jóvenes, campañas espirituales, alabanza y formación pastoral en la montaña y parajes.
                </p>
                <div class="text-[11px] font-mono text-purple-300 space-y-1 mb-6 border-t border-white/10 pt-3">
                  <div>📖 Cultos & Formación</div>
                  <div>🎵 Sonido & Streaming Rider</div>
                </div>
              </div>
              <button onclick="alert('Ministerio Caminos de Fe: Próximamente plataforma oficial en vivo por la Agente Luz-04.')" class="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500 border border-purple-500/30 text-purple-300 hover:text-slate-950 font-semibold text-xs font-mono text-center transition-all flex items-center justify-center gap-2 shadow-md">
                <span>Conocer Ministerio</span>
                <span>↗</span>
              </button>
            </div>

          </div>

          <!-- Pie del Ecosistema -->
          <div class="text-center pt-2 text-xs text-slate-400 font-mono">
            <span>Soberanía Productiva + Vida Comunitaria + Solidaridad + Fe Cristiana</span>
          </div>

        </div>
      </section>
`;

function injectEcosistema(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Actualizar Navbar para incluir Ecosistema
  if (!html.includes('href="#ecosistema"')) {
    html = html.replace(
      '<a href="#ecotecnologia"',
      '<a href="#ecosistema" class="hover:text-cyan-300 transition-colors">Ecosistema</a>\n        <a href="#ecotecnologia"'
    );
  }

  // Insertar la sección después de </section> de mision-vision y antes de <section id="ecotecnologia">
  if (!html.includes('id="ecosistema"')) {
    html = html.replace(
      '<!-- ESCENA 2: ECOTECNOLOGÍA',
      ecosistemaSection.trim() + '\n\n      <!-- ESCENA 2: ECOTECNOLOGÍA'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Sección Ecosistema agregada a:', filePath);
}

injectEcosistema('index.html');
injectEcosistema('public/index.html');
