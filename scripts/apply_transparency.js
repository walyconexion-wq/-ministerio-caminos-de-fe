const fs = require('fs');

// 1. Actualizar CSS
const customCss = `
@layer utilities {
  .drop-shadow-glow {
    filter: drop-shadow(0 0 20px rgba(229, 192, 123, 0.35));
  }
}

/* Glassmorphism Ultra Traslúcido de Alto Impacto */
.glass-card-faro {
  background: rgba(6, 10, 18, 0.40) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45) !important;
}

.glass-card-faro:hover {
  background: rgba(6, 10, 18, 0.48) !important;
}

@media (max-width: 768px) {
  .glass-card-faro {
    background: rgba(5, 8, 14, 0.32) !important;
    backdrop-filter: blur(4px) !important;
    -webkit-backdrop-filter: blur(4px) !important;
    padding: 1.25rem !important;
  }
}

/* Sombra de texto para maxima legibilidad sobre video/frames */
.text-shadow-faro {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.95);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #070A0F;
}
::-webkit-scrollbar-thumb {
  background: #2A3342;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #E5C07B;
}

/* Canvas Smooth Rendering */
#scrolly-canvas {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  transform: translateZ(0);
  will-change: transform;
}

/* Transición suave para secciones */
section {
  will-change: opacity, transform;
}
`;

fs.writeFileSync('styles/style.css', customCss.trim(), 'utf8');
fs.writeFileSync('public/styles/style.css', customCss.trim(), 'utf8');
console.log('styles/style.css y public/styles/style.css actualizados.');

// 2. Actualizar index.html y public/index.html
function makeTransparent(path) {
  let html = fs.readFileSync(path, 'utf8');

  // Aclarar viñeta del canvas para ver mucho mas el fondo
  html = html.replace(
    '<div class="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-[#070A0F]/70 pointer-events-none"></div>',
    '<div class="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-[#070A0F]/35 pointer-events-none"></div>'
  );
  html = html.replace(
    '<div class="absolute inset-0 bg-black/25 pointer-events-none"></div>',
    '<div class="absolute inset-0 bg-black/10 pointer-events-none"></div>'
  );

  // Hero Card
  html = html.replace(
    'max-w-4xl backdrop-blur-md bg-black/35 border border-white/10 rounded-3xl p-8 md:p-12',
    'max-w-4xl glass-card-faro rounded-3xl p-6 sm:p-10 md:p-12'
  );

  // Escena 2: Ecotecnologia Tarjetas
  html = html.replace(
    'backdrop-blur-xl bg-slate-950/80 border border-white/10 rounded-3xl p-7 shadow-2xl hover:border-amber-500/40',
    'glass-card-faro rounded-3xl p-6 sm:p-7 shadow-2xl hover:border-amber-500/50'
  );
  html = html.replace(
    'backdrop-blur-xl bg-slate-950/80 border border-white/10 rounded-3xl p-7 shadow-2xl hover:border-cyan-500/40',
    'glass-card-faro rounded-3xl p-6 sm:p-7 shadow-2xl hover:border-cyan-500/50'
  );

  // Escena 3: Organigrama
  html = html.replace(
    'max-w-5xl w-full backdrop-blur-xl bg-slate-950/85 border border-white/10 rounded-3xl p-8 md:p-12',
    'max-w-5xl w-full glass-card-faro rounded-3xl p-6 sm:p-8 md:p-10'
  );

  // Escena 4: Regla 70/20/10 y Legalidad
  html = html.replace(
    'backdrop-blur-xl bg-slate-950/85 border border-amber-500/30 rounded-3xl p-7 shadow-2xl flex flex-col',
    'glass-card-faro border-amber-500/35 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col'
  );
  html = html.replace(
    '<div id="legalidad" class="backdrop-blur-xl bg-slate-950/85 border border-white/10 rounded-3xl p-7 shadow-2xl flex flex-col',
    '<div id="legalidad" class="glass-card-faro rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col'
  );

  // Escena 5: Tablero Maestro de Búnkeres
  html = html.replace(
    'max-w-6xl w-full backdrop-blur-2xl bg-slate-950/90 border border-cyan-500/30 rounded-3xl p-8 md:p-12',
    'max-w-6xl w-full glass-card-faro border-cyan-500/35 rounded-3xl p-6 sm:p-8 md:p-10'
  );
  html = html.replace(
    /p-6 rounded-2xl bg-\[#0B111A\] border border-cyan-500\/20/g,
    'p-5 sm:p-6 rounded-2xl bg-black/25 border border-cyan-500/25 hover:bg-black/35'
  );
  html = html.replace(
    /p-6 rounded-2xl bg-\[#0B111A\] border border-amber-500\/20/g,
    'p-5 sm:p-6 rounded-2xl bg-black/25 border border-amber-500/25 hover:bg-black/35'
  );
  html = html.replace(
    /p-6 rounded-2xl bg-\[#0B111A\] border border-emerald-500\/20/g,
    'p-5 sm:p-6 rounded-2xl bg-black/25 border border-emerald-500/25 hover:bg-black/35'
  );
  html = html.replace(
    /p-6 rounded-2xl bg-\[#0B111A\] border border-purple-500\/20/g,
    'p-5 sm:p-6 rounded-2xl bg-black/25 border border-purple-500/25 hover:bg-black/35'
  );
  html = html.replace(
    /p-6 rounded-2xl bg-\[#0B111A\] border border-red-500\/20/g,
    'p-5 sm:p-6 rounded-2xl bg-black/25 border border-red-500/25 hover:bg-black/35'
  );

  // Escena 6: Formacion y Postulacion
  html = html.replace(
    'max-w-4xl w-full backdrop-blur-2xl bg-slate-950/90 border border-amber-500/30 rounded-3xl p-8 md:p-12',
    'max-w-4xl w-full glass-card-faro border-amber-500/35 rounded-3xl p-6 sm:p-8 md:p-10'
  );

  // Agregar clases text-shadow-faro a párrafos principales
  html = html.replace(
    'class="text-sm text-slate-300 leading-relaxed mb-4"',
    'class="text-sm text-slate-100 font-normal leading-relaxed mb-4 text-shadow-faro"'
  );

  fs.writeFileSync(path, html, 'utf8');
  console.log('Transparencias aplicadas a:', path);
}

makeTransparent('index.html');
makeTransparent('public/index.html');
