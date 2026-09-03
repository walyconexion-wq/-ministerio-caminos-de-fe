const fs = require('fs');
const path = require('path');

function updateMeta(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const metaSnippet = `  <!-- Favicon Pestaña -->
  <link rel="icon" type="image/svg+xml" href="/favicon-mcf.svg" />
  <link rel="apple-touch-icon" href="/favicon-mcf.svg" />
  <link rel="canonical" href="https://caminosdefe.dpdns.org/" />

  <!-- Google Brand Card & WhatsApp / Facebook Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://caminosdefe.dpdns.org/" />
  <meta property="og:title" content="Ministerio Caminos de Fe — Altar de Montaña y Cultos en Traslasierra" />
  <meta property="og:description" content="Unión de fe, alabanza, cultos de campaña y misiones espirituales en las sierras de Córdoba." />
  <meta property="og:image" content="https://caminosdefe.dpdns.org/og-ministerio-card.png" />
  <meta property="og:image:secure_url" content="https://caminosdefe.dpdns.org/og-ministerio-card.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Ministerio Caminos de Fe" />
  <meta property="og:site_name" content="Ministerio Caminos de Fe" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://caminosdefe.dpdns.org/" />
  <meta name="twitter:title" content="Ministerio Caminos de Fe — Altar de Montaña y Cultos en Traslasierra" />
  <meta name="twitter:description" content="Unión de fe, alabanza, cultos de campaña y misiones espirituales en las sierras de Córdoba." />
  <meta name="twitter:image" content="https://caminosdefe.dpdns.org/og-ministerio-card.png" />
  <title>Ministerio Caminos de Fe — Altar de Montaña y Cultos en Traslasierra</title>`;

  html = html.replace(/<!-- Favicon Pestaña -->[\s\S]*?<title>.*?<\/title>/, metaSnippet);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Metadatos actualizados en:", filePath);
}

updateMeta(path.join(__dirname, '../index.html'));
updateMeta(path.join(__dirname, '../public/index.html'));
