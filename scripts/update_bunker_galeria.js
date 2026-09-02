const fs = require('fs');

// 1. ACTUALIZAR bunker.html Y public/bunker.html
function updateBunkerHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Agregar botón al sidebar si no existe
  const sidebarBtn = `
          <button data-tab="tab-galeria" class="bunker-tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-all text-left flex justify-between">
            <div class="flex items-center gap-3">
              <span class="text-base">📸</span>
              <span>6. Galería & Multimedia</span>
            </div>
            <span id="badge-galeria-count" class="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">0</span>
          </button>
  `;

  if (!html.includes('data-tab="tab-galeria"')) {
    html = html.replace(
      'data-tab="tab-secops"',
      sidebarBtn.trim() + '\n\n          <button data-tab="tab-secops"'
    );
  }

  // Vista de Galería en el Búnker
  const galeriaView = `
        <!-- TAB 6: GESTIÓN DE GALERÍA Y MULTIMEDIA -->
        <div id="tab-galeria" class="bunker-view space-y-6 hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <span>📸</span> Gestor de Galería Multimedia (Supabase Live)
              </h3>
              <p class="text-xs text-slate-400">Publicá, administrá y actualizá las fotos y videos de la base de montaña en tiempo real.</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              ● Storage & DB: Sincronizado
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- FORMULARIO DE CARGA DE NUEVO MEDIO -->
            <div class="bg-[#0B111A] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div class="flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="text-lg">➕</span>
                <h4 class="font-bold text-white text-sm">Cargar Nuevo Medio</h4>
              </div>

              <form id="form-add-media" class="space-y-4 text-xs">
                <div>
                  <label class="block text-slate-300 font-semibold mb-1">Título / Avance *</label>
                  <input type="text" id="media-titulo" required placeholder="Ej: Montaje de módulos 40ft en Traslasierra" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400">
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">Tipo *</label>
                    <select id="media-tipo" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400">
                      <option value="foto">📷 Fotografía</option>
                      <option value="video">🎬 Video (YouTube/MP4)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">Categoría *</label>
                    <select id="media-categoria" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400">
                      <option value="Montaña & Predio">Montaña & Predio</option>
                      <option value="Domo & Obra">Domo & Obra</option>
                      <option value="Ecotecnología">Ecotecnología</option>
                      <option value="Comunidad">Comunidad</option>
                      <option value="Dron 4K">Dron 4K</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-slate-300 font-semibold mb-1">URL del Archivo / Enlace *</label>
                  <input type="url" id="media-url" required placeholder="https://... o https://youtube.com/watch?v=..." class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400">
                  <p class="text-[10px] text-slate-500 mt-1">Podés pegar enlaces directos de imágenes, videos MP4 o enlaces de YouTube.</p>
                </div>

                <div>
                  <label class="block text-slate-300 font-semibold mb-1">Descripción / Bitácora</label>
                  <textarea id="media-descripcion" rows="2" placeholder="Detalles técnicos, avances de construcción o fecha..." class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"></textarea>
                </div>

                <div class="flex items-center gap-2">
                  <input type="checkbox" id="media-destacado" class="rounded text-cyan-500 focus:ring-cyan-400">
                  <label for="media-destacado" class="text-slate-300">Marcar como Destacado ⭐</label>
                </div>

                <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all">
                  Guardar y Publicar en la Web 🚀
                </button>
              </form>
            </div>

            <!-- GRILLA DE MEDIOS EN VIVO -->
            <div class="lg:col-span-2 bg-[#0B111A] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 class="font-bold text-white text-sm flex items-center gap-2">
                  <span>🖼️</span> Medios Publicados en la Web Oficial
                </h4>
                <button id="btn-refresh-galeria" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] transition-all">
                  ↻ Refrescar
                </button>
              </div>

              <div id="bunker-galeria-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                <!-- Inyectado dinámicamente por bunker.js -->
              </div>
            </div>

          </div>
        </div>
  `;

  if (!html.includes('id="tab-galeria"')) {
    html = html.replace(
      '<!-- TAB 5: SECOPS',
      galeriaView.trim() + '\n\n        <!-- TAB 5: SECOPS'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Búnker HTML actualizado en:', filePath);
}

updateBunkerHtml('bunker.html');
updateBunkerHtml('public/bunker.html');
