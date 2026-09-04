const fs = require('fs');

function updateHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const ogSnippet = `  <!-- Favicon Pestaña -->
  <link rel="icon" type="image/svg+xml" href="/favicon-mcf.svg" />
  <link rel="apple-touch-icon" href="/favicon-mcf.svg" />
  <link rel="canonical" href="https://ministerio-caminos-de-fe.vercel.app/" />

  <!-- Google Brand Card & WhatsApp / Facebook Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ministerio-caminos-de-fe.vercel.app/" />
  <meta property="og:title" content="Ministerio Caminos de Fe — Altar de Montaña y Cultos en Traslasierra" />
  <meta property="og:description" content="Levantando una generación que camina en fe y brilla con la luz del Evangelio. Valle de Traslasierra, Córdoba." />
  <meta property="og:image" content="https://ministerio-caminos-de-fe.vercel.app/og-ministerio-card.jpg" />
  <meta property="og:image:secure_url" content="https://ministerio-caminos-de-fe.vercel.app/og-ministerio-card.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="1024" />
  <meta property="og:image:alt" content="Emblema Oficial Ministerio Caminos de Fe" />
  <meta property="og:site_name" content="Ministerio Caminos de Fe" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://ministerio-caminos-de-fe.vercel.app/" />
  <meta name="twitter:title" content="Ministerio Caminos de Fe — Altar de Montaña y Cultos en Traslasierra" />
  <meta name="twitter:description" content="Levantando una generación que camina en fe y brilla con la luz del Evangelio. Valle de Traslasierra, Córdoba." />
  <meta name="twitter:image" content="https://ministerio-caminos-de-fe.vercel.app/og-ministerio-card.jpg" />
  <title>Ministerio Caminos de Fe — Altar de Montaña y Cultos en Traslasierra</title>`;

  html = html.replace(/<!-- Favicon Pestaña -->[\s\S]*?<title>.*?<\/title>/, ogSnippet);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Actualizado:", filePath);
}

updateHtml('index.html');
updateHtml('public/index.html');
