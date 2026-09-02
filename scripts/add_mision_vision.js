const fs = require('fs');

const misionVisionSection = `
      <!-- ESCENA NUEVA: VISIÓN Y MISIÓN DE LA COMUNIDAD (120vh - 250vh) -->
      <section id="mision-vision" class="min-h-[140vh] flex flex-col items-center justify-center px-4 py-16">
        <div class="max-w-5xl w-full space-y-6">
          
          <!-- Encabezado de Sección -->
          <div class="text-center max-w-2xl mx-auto mb-2">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase mb-3">
              🧭 Propósito Fundacional · Ecosistema 2027
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase drop-shadow-xl mb-2">
              Nuestra Visión & Misión
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 font-light max-w-xl mx-auto text-shadow-faro">
              El fundamento que guía la convivencia, el trabajo y el desarrollo ecotecnológico en la montaña.
            </p>
          </div>

          <!-- Grid de Visión y Misión -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Tarjeta 1: Visión -->
            <div class="glass-card-faro rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-amber-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div class="inline-block px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase tracking-widest mb-3">
                  Horizonte Estratégico 2027
                </div>
                <h3 class="font-serif text-2xl font-bold text-white mb-3">Nuestra Visión</h3>
                <p class="text-sm text-slate-100 leading-relaxed text-shadow-faro mb-4">
                  Consolidarnos como un <strong>modelo pionero de comunidad de montaña autosustentable</strong> en Traslasierra, que demuestra que es posible alcanzar soberanía energética, hídrica y tecnológica viviendo en armonía comunitaria y propósito espiritual, sin depender de economías de subsistencia.
                </p>
              </div>
              <ul class="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-4">
                <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Faro de inspiración ecotecnológica para Córdoba y la región.</li>
                <li class="flex items-center gap-2"><span class="text-amber-400 font-bold">✓</span> Blindaje legal colectivo bajo Fideicomiso Co-Housing ante IPJ.</li>
              </ul>
            </div>

            <!-- Tarjeta 2: Misión -->
            <div class="glass-card-faro rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-cyan-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  🧭
                </div>
                <div class="inline-block px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase tracking-widest mb-3">
                  Vocación & Operación Diaria
                </div>
                <h3 class="font-serif text-2xl font-bold text-white mb-3">Nuestra Misión</h3>
                <p class="text-sm text-slate-100 leading-relaxed text-shadow-faro mb-4">
                  Construir y preservar un hábitat ecotecnológico donde <strong>6 familias fundadoras</strong> desarrollan su máximo potencial técnico y espiritual, sustentadas por el trabajo remoto de alta productividad en <strong>ShopDigital</strong> (Regla 70/20/10), sirviendo a la comunidad con excelencia, fe y amor fraterno.
                </p>
              </div>
              <ul class="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-4">
                <li class="flex items-center gap-2"><span class="text-cyan-400 font-bold">✓</span> 100% de sustento económico garantizado por servicios cloud e IA.</li>
                <li class="flex items-center gap-2"><span class="text-cyan-400 font-bold">✓</span> Acción comunitaria activa a través de la Fundación y el Ministerio.</li>
              </ul>
            </div>

          </div>

          <!-- Banner Inferior de los 4 Pilares -->
          <div class="glass-card-faro rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 hover:border-amber-500/20 transition-all">
                <div class="text-2xl mb-1.5">✝️</div>
                <div class="font-bold text-white text-xs mb-0.5">Fe & Convivencia</div>
                <div class="text-[10px] text-slate-400">Valores cristianos y fraternidad</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 hover:border-amber-500/20 transition-all">
                <div class="text-2xl mb-1.5">⚡</div>
                <div class="font-bold text-amber-300 text-xs mb-0.5">Ecotecnología</div>
                <div class="text-[10px] text-slate-400">Solar 18.4kW, Litio & Agua</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 hover:border-cyan-500/20 transition-all">
                <div class="text-2xl mb-1.5">💻</div>
                <div class="font-bold text-cyan-300 text-xs mb-0.5">ShopDigital</div>
                <div class="text-[10px] text-slate-400">Motor de financiamiento 100%</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 hover:border-purple-500/20 transition-all">
                <div class="text-2xl mb-1.5">🤝</div>
                <div class="font-bold text-purple-300 text-xs mb-0.5">Acción Social</div>
                <div class="text-[10px] text-slate-400">Fundación & Ministerio</div>
              </div>
            </div>
          </div>

        </div>
      </section>
`;

function injectMisionVision(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Actualizar Navbar para incluir Visión & Misión
  if (!html.includes('href="#mision-vision"')) {
    html = html.replace(
      '<a href="#ecotecnologia"',
      '<a href="#mision-vision" class="hover:text-amber-300 transition-colors">Visión & Misión</a>\n        <a href="#ecotecnologia"'
    );
  }

  // Insertar la sección después de </section> de hero y antes de <section id="ecotecnologia">
  if (!html.includes('id="mision-vision"')) {
    html = html.replace(
      '<!-- ESCENA 2: ECOTECNOLOGÍA',
      misionVisionSection.trim() + '\n\n      <!-- ESCENA 2: ECOTECNOLOGÍA'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Visión y Misión agregada a:', filePath);
}

injectMisionVision('index.html');
injectMisionVision('public/index.html');
