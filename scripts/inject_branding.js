const fs = require('fs');

function updateIndex(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Inyectar favicon y Open Graph en head
  const headMeta = `
  <!-- Favicon Pestaña -->
  <link rel="icon" type="image/svg+xml" href="/favicon-faro.svg" />
  <link rel="apple-touch-icon" href="/favicon-faro.svg" />
  <!-- Google Brand Card & WhatsApp Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://farodeluz.dpdns.org/" />
  <meta property="og:title" content="Comunidad Faro de Luz — Base Montaña Traslasierra" />
  <meta property="og:description" content="2027 — Unión de fe, ecotecnología y comunidad en el corazón de Traslasierra, Córdoba." />
  <meta property="og:image" content="https://farodeluz.dpdns.org/favicon-faro.svg" />
  <meta property="og:site_name" content="Comunidad Faro de Luz" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Comunidad Faro de Luz — Base Montaña Traslasierra" />
  <meta name="twitter:description" content="2027 — Unión de fe, ecotecnología y comunidad en el corazón de Traslasierra, Córdoba." />
  <meta name="twitter:image" content="https://farodeluz.dpdns.org/favicon-faro.svg" />
`;

  if (!html.includes('favicon-faro.svg')) {
    html = html.replace('<title>', headMeta + '  <title>');
  }

  // Actualizar Logo en Navbar
  html = html.replace(
    /<div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500\/20 group-hover:scale-105 transition-transform">[\s\S]*?<\/div>/,
    `<div class="w-10 h-10 rounded-full overflow-hidden border border-amber-400/40 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center bg-black/50">
          <img src="/favicon-faro.svg" alt="Faro de Luz" class="w-full h-full object-cover">
        </div>`
  );

  // Actualizar Logo en Footer
  html = html.replace(
    /<div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold font-serif">FL<\/div>/,
    `<div class="w-9 h-9 rounded-full overflow-hidden border border-amber-400/40 flex items-center justify-center bg-black/50 shadow-md">
          <img src="/favicon-faro.svg" alt="Faro de Luz" class="w-full h-full object-cover">
        </div>`
  );

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Actualizado:', filePath);
}

function updateBunker(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const headMeta = `
  <!-- Favicon Pestaña -->
  <link rel="icon" type="image/svg+xml" href="/favicon-faro.svg" />
  <link rel="apple-touch-icon" href="/favicon-faro.svg" />
`;

  if (!html.includes('favicon-faro.svg')) {
    html = html.replace('<title>', headMeta + '  <title>');
  }

  // Logo en Header del Bunker
  html = html.replace(
    /<div class="w-8 h-8 rounded-lg bg-cyan-500\/20 border border-cyan-500\/40 flex items-center justify-center text-cyan-400 font-bold font-serif text-xs">[\s\S]*?<\/div>/,
    `<div class="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/40 flex items-center justify-center bg-black/50 shadow-md">
            <img src="/favicon-faro.svg" alt="Faro de Luz" class="w-full h-full object-cover">
          </div>`
  );

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Actualizado:', filePath);
}

updateIndex('index.html');
updateIndex('public/index.html');
updateBunker('bunker.html');
updateBunker('public/bunker.html');
