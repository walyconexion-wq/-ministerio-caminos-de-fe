const fs = require('fs');

const ubicacionSection = `
      <!-- ESCENA NUEVA: UBICACIÓN GEOGRÁFICA Y MAPA (#ubicacion) -->
      <section id="ubicacion" class="min-h-[140vh] flex flex-col items-center justify-center px-4 py-16">
        <div class="max-w-6xl w-full space-y-8">
          
          <!-- Encabezado de Ubicación -->
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase mb-3">
              📍 Enclave Territorial · Valle de Traslasierra
            </div>
            <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase drop-shadow-xl mb-3">
              Ubicación & Acceso a la Base
            </h2>
            <p class="text-xs sm:text-sm text-slate-200 font-light max-w-2xl mx-auto text-shadow-faro leading-relaxed">
              Emplazados estratégicamente en un predio de <strong>1 hectárea con agua propia</strong> entre <strong>Panaholma y Villa Cura Brochero</strong>, combinando privacidad serrana, sustentabilidad y rápida conexión a centros urbanos.
            </p>
          </div>

          <!-- GRID DE INFORMACIÓN Y MAPA -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            <!-- TARJETA 1: FICHA TERRITORIAL Y ACCESOS (5 Columnas) -->
            <div class="lg:col-span-5 glass-card-faro rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
                    🏔️
                  </div>
                  <div>
                    <h3 class="font-serif text-xl font-bold text-white">Traslasierra, Córdoba</h3>
                    <span class="text-xs text-amber-300 font-mono">Dpto. San Alberto · Zona Serrana</span>
                  </div>
                </div>

                <div class="space-y-3.5 text-xs text-slate-200 leading-relaxed text-shadow-faro">
                  <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1">
                    <div class="font-bold text-amber-300 flex items-center gap-2">
                      <span>💧</span> 1 Hectárea con Provisión de Agua
                    </div>
                    <p class="text-slate-300 text-[11px]">Agua garantizada en el predio con almacenamiento en torre de 22.000 L para distribución por gravedad.</p>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1">
                    <div class="font-bold text-cyan-300 flex items-center gap-2">
                      <span>🛣️</span> Corredor Panaholma — Cura Brochero
                    </div>
                    <p class="text-slate-300 text-[11px]">Acceso consolidado transitable todo el año para vehículos particulares y flota comunal Hilux 4x4 / Sprinter.</p>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1">
                    <div class="font-bold text-emerald-300 flex items-center gap-2">
                      <span>⏱️</span> Tiempos de Conexión Clave
                    </div>
                    <ul class="text-[11px] text-slate-300 space-y-1 pt-1">
                      <li>• <strong>A Panaholma:</strong> 8-10 min (Río de aguas templadas y naturaleza).</li>
                      <li>• <strong>A Villa Cura Brochero / Mina Clavero:</strong> 15 min (Hospital regional, comercios y servicios).</li>
                      <li>• <strong>A Córdoba Capital:</strong> 2.5 hs (Por el Camino de las Altas Cumbres).</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Coordenadas: Traslasierra</span>
                <span class="text-emerald-400">● Zona Segura Co-Housing</span>
              </div>
            </div>

            <!-- TARJETA 2: MAPA INTERACTIVO GLASSMORPHIC (7 Columnas) -->
            <div class="lg:col-span-7 glass-card-faro rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[420px]">
              
              <!-- Badge Flotante de Ubicación -->
              <div class="absolute top-6 left-6 z-20 px-3.5 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-white font-mono text-xs shadow-2xl flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>📍 <strong>Comunidad Faro de Luz</strong> (Traslasierra)</span>
              </div>

              <!-- Iframe de Google Maps -->
              <div class="w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-white/10 relative">
                <iframe 
                  src="https://maps.google.com/maps?q=Panaholma,+Cordoba,+Argentina&t=k&z=12&ie=UTF8&iwloc=&output=embed" 
                  class="w-full h-full min-h-[360px] border-0 filter contrast-125 opacity-90 hover:opacity-100 transition-opacity" 
                  allowfullscreen="" 
                  loading="lazy" 
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>

              <!-- Barra Inferior de Navegación Externa -->
              <div class="pt-3 px-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span class="text-slate-400 text-[11px] font-mono">Vista Satelital / Topográfica de Traslasierra</span>
                <a 
                  href="https://maps.google.com/?q=Panaholma,+Cordoba,+Argentina" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-slate-950 font-mono font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md">
                  <span>Abrir en Google Maps</span>
                  <span>↗</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>
`;

function injectUbicacion(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Agregar a Navbar
  if (!html.includes('href="#ubicacion"')) {
    html = html.replace(
      '<a href="#galeria"',
      '<a href="#ubicacion" class="hover:text-amber-300 transition-colors">Ubicación</a>\n        <a href="#galeria"'
    );
  }

  // Insertar sección antes de Escena: Galeria Multimedia
  if (!html.includes('id="ubicacion"')) {
    html = html.replace(
      '<!-- ESCENA NUEVA: GALERÍA MULTIMEDIA',
      ubicacionSection.trim() + '\n\n      <!-- ESCENA NUEVA: GALERÍA MULTIMEDIA'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Ubicación agregada a:', filePath);
}

injectUbicacion('index.html');
injectUbicacion('public/index.html');
