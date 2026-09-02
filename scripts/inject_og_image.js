const fs = require('fs');

const ogBlock = `
  <!-- Favicon Pestaña -->
  <link rel="icon" type="image/svg+xml" href="/favicon-faro.svg" />
  <link rel="apple-touch-icon" href="/og-faro.jpg" />

  <!-- Google Brand Card & WhatsApp / Facebook Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://farodeluz.dpdns.org/" />
  <meta property="og:title" content="Comunidad Faro de Luz — Base Montaña Traslasierra" />
  <meta property="og:description" content="2027 — Unión de fe, ecotecnología y comunidad en el corazón de Traslasierra, Córdoba." />
  <meta property="og:image" content="https://farodeluz.dpdns.org/og-faro.jpg" />
  <meta property="og:image:secure_url" content="https://farodeluz.dpdns.org/og-faro.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="1024" />
  <meta property="og:image:alt" content="Comunidad Faro de Luz" />
  <meta property="og:site_name" content="Comunidad Faro de Luz" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Comunidad Faro de Luz — Base Montaña Traslasierra" />
  <meta name="twitter:description" content="2027 — Unión de fe, ecotecnología y comunidad en el corazón de Traslasierra, Córdoba." />
  <meta name="twitter:image" content="https://farodeluz.dpdns.org/og-faro.jpg" />
`;

function injectOg(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Limpiar metatags anteriores de OG si existen
  html = html.replace(/<!-- Favicon Pestaña -->[\s\S]*?<title>/, ogBlock.trim() + '\n  <title>');
  if (!html.includes('og-faro.jpg')) {
    html = html.replace('<title>', ogBlock.trim() + '\n  <title>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Open Graph inyectado con éxito en:', filePath);
}

injectOg('index.html');
injectOg('public/index.html');
injectOg('bunker.html');
injectOg('public/bunker.html');
