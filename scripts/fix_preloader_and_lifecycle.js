const fs = require('fs');
const path = require('path');

console.log("=== ACTUALIZANDO CICLO DE VIDA Y PRELOADER (FAILSAFE TOTAL) ===");

// 1. REFACTORIZAR SCROLLYTELLING.JS
function refactorScrollytelling(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Mejorar preloadImages y finishLoading
  const newPreloadAndFinish = `  function preloadImages() {
    // Failsafe garantizado: desbloquear la pantalla a los 800ms
    setTimeout(() => {
      finishLoading();
    }, 800);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / FRAME_COUNT) * 100);
        if (preloaderBar) preloaderBar.style.width = \`\${percent}%\`;
        if (preloaderText) preloaderText.textContent = \`Iniciando Altar: \${percent}%\`;

        if (loadedCount === 1) {
          resizeCanvas();
          renderFrame(0);
        }
        if (loadedCount >= 5 && !isReady) {
          finishLoading();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (!isReady) finishLoading();
      };
      images.push(img);
    }
  }

  function finishLoading() {
    if (isReady) return;
    isReady = true;
    resizeCanvas();
    renderFrame(0);
    const p = document.getElementById('preloader');
    if (p) {
      p.style.transition = 'opacity 0.4s ease';
      p.style.opacity = '0';
      setTimeout(() => {
        p.style.display = 'none';
      }, 400);
    }
  }`;

  code = code.replace(/function preloadImages\(\)[\s\S]*?function finishLoading\(\)[\s\S]*?\n  \}/s, newPreloadAndFinish);

  // Mejorar Inicialización Global y Eventos
  const newInitGlobal = `  // 7. INICIALIZACIÓN GLOBAL BLINDADA
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });

  function initAll() {
    try { preloadImages(); } catch(e) { console.warn('Preload:', e); finishLoading(); }
    try { resizeCanvas(); } catch(e) { console.warn('Canvas:', e); }
    try { requestAnimationFrame(animationLoop); } catch(e) { console.warn('Loop:', e); }
    try { initLiveClock(); } catch(e) { console.warn('Clock:', e); }
    try { initLuzAssistant(); } catch(e) { console.warn('Luz:', e); }
    try { initGaleriaPublic(); } catch(e) { console.warn('Galeria:', e); }
    try { initCommunityForm(); } catch(e) { console.warn('Form:', e); }
    // Seguro de desvanecimiento
    setTimeout(finishLoading, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();`;

  code = code.replace(/\/\/ 7\. INICIALIZACIÓN GLOBAL[\s\S]*?\}\)\(\);?\s*$/s, newInitGlobal);

  fs.writeFileSync(filePath, code, 'utf8');
  console.log("Scrollytelling actualizado:", filePath);
}

// 2. ACTUALIZAR INDEX.HTML
function refactorIndexHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Insertar script inline debajo del preloader si no existe
  if (!html.includes('id="preloader-emergency-script"')) {
    const inlineScript = `
  <!-- PRELOADER EMERGENCY SCRIPT -->
  <script id="preloader-emergency-script">
    (function() {
      setTimeout(function() {
        var p = document.getElementById('preloader');
        if (p && p.style.display !== 'none') {
          p.style.transition = 'opacity 0.4s ease';
          p.style.opacity = '0';
          setTimeout(function() { if (p) p.style.display = 'none'; }, 400);
        }
      }, 900);
    })();
  </script>`;

    html = html.replace(/<\/div>\s*<\/div>\s*<!-- NAVBAR FLOTANTE -->/, `</div>\n  </div>\n${inlineScript}\n\n  <!-- NAVBAR FLOTANTE -->`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Index HTML actualizado:", filePath);
}

refactorScrollytelling(path.join(__dirname, '../src/scrollytelling.js'));
refactorScrollytelling(path.join(__dirname, '../public/src/scrollytelling.js'));
refactorIndexHtml(path.join(__dirname, '../index.html'));
refactorIndexHtml(path.join(__dirname, '../public/index.html'));

console.log("=== ACTUALIZACIÓN FINALIZADA CON ÉXITO ===");
