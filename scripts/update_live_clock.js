const fs = require('fs');

// 1. Actualizar index.html y public/index.html
function updateHeaderClock(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const oldBrand = `<span class="font-serif text-sm tracking-wider font-bold text-white block">FARO DE LUZ</span>
          <span class="text-[10px] text-amber-300 tracking-widest block uppercase font-mono">Base Montaña · 2027</span>`;

  const newBrand = `<span class="font-serif text-sm tracking-wider font-bold text-white block">FARO DE LUZ</span>
          <span id="header-live-clock" class="text-[10px] text-amber-300 tracking-wider block font-mono flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span id="clock-display">--/--/---- --:--:--</span>
          </span>`;

  if (html.includes('Base Montaña · 2027')) {
    html = html.replace(oldBrand, newBrand);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Reloj en vivo inyectado en:', filePath);
  }
}

updateHeaderClock('index.html');
updateHeaderClock('public/index.html');

// 2. Inyectar función de reloj en scrollytelling.js y public/src/scrollytelling.js
const clockJs = `
  // ==========================================
  // RELOJ DIGITAL EN VIVO (HEADER FARO DE LUZ)
  // ==========================================
  function initLiveHeaderClock() {
    const clockEl = document.getElementById('clock-display');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = now.getFullYear();
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());

      clockEl.textContent = \`\${day}/\${month}/\${year} · \${hours}:\${minutes}:\${seconds}\`;
    }

    update();
    setInterval(update, 1000);
  }

  initLiveHeaderClock();
`;

function injectClockJs(path) {
  let code = fs.readFileSync(path, 'utf8');

  if (!code.includes('initLiveHeaderClock()')) {
    code = code.replace(
      'window.addEventListener(\'DOMContentLoaded\', initScrollytelling);',
      clockJs.trim() + '\n\nwindow.addEventListener(\'DOMContentLoaded\', initScrollytelling);'
    );
    if (!code.includes('initLiveHeaderClock()')) {
      code += '\n' + clockJs;
    }
  }

  fs.writeFileSync(path, code, 'utf8');
  console.log('scrollytelling.js actualizado con reloj en:', path);
}

injectClockJs('src/scrollytelling.js');
injectClockJs('public/src/scrollytelling.js');
