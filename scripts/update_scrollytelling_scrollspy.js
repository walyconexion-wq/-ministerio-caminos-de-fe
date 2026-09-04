const fs = require('fs');
const vm = require('vm');

function updateScrolly(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Reemplazos de Asistente Luz en chat
  code = code.replace(/Luz-04 está procesando respuesta\.\.\./g, 'Asistente Luz está procesando respuesta...');
  code = code.replace(/appendChatMessage\(['"]Luz-04['"]/g, "appendChatMessage('Asistente Luz'");
  code = code.replace(
    /<div class="w-6 h-6 rounded-lg bg-amber-500\/20 border border-amber-500\/40 text-amber-300 flex items-center justify-center text-\[10px\] font-bold shrink-0 mt-0\.5">L<\/div>/g,
    `<div class="w-7 h-7 rounded-lg overflow-hidden border border-amber-500/40 p-1 bg-black/50 shadow-sm flex items-center justify-center shrink-0 mt-0.5"><img src="/favicon-mcf.svg" alt="Cruz" class="w-full h-full object-contain"></div>`
  );
  code = code.replace(
    /¡Hola! Soy Luz-04, la ingeniera asistente de la Ministerio Caminos de Fe/g,
    '¡Hola! Soy el Asistente Luz, de sistemas de culto y sonido del Ministerio Caminos de Fe'
  );

  // 2. Inyectar initScrollSpy antes de initCommunityForm o en la inicialización
  const scrollSpyFunction = `
  // 7. SCROLLSPY Y EFECTO ACTIVO EN MENÚ DE NAVEGACIÓN
  function initScrollSpy() {
    const navLinks = document.querySelectorAll('#navbar-links .nav-link');
    if (!navLinks || navLinks.length === 0) return;

    const sections = [];
    navLinks.forEach(link => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const sec = document.querySelector(hash);
        if (sec) {
          sections.push({ hash, element: sec, link });
        }
      }
    });

    if (sections.length === 0) return;

    function onScrollSpy() {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      let activeIndex = -1;

      for (let i = 0; i < sections.length; i++) {
        const top = sections[i].element.offsetTop;
        const height = sections[i].element.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          activeIndex = i;
          break;
        }
      }

      if (window.scrollY < window.innerHeight * 0.35) {
        activeIndex = -1;
      } else if (activeIndex === -1) {
        for (let i = sections.length - 1; i >= 0; i--) {
          if (scrollPos >= sections[i].element.offsetTop) {
            activeIndex = i;
            break;
          }
        }
      }

      navLinks.forEach((l, idx) => {
        if (idx === activeIndex) {
          l.classList.add('nav-link-active');
        } else {
          l.classList.remove('nav-link-active');
        }
      });
    }

    window.addEventListener('scroll', onScrollSpy, { passive: true });
    setTimeout(onScrollSpy, 250);
  }
`;

  if (!code.includes('function initScrollSpy()')) {
    code = code.replace(
      /function initAll\(\) \{/,
      scrollSpyFunction + '\n  function initAll() {\n    try { initScrollSpy(); } catch(e) { console.warn("ScrollSpy:", e); }'
    );
  }

  // Validar con VM
  try {
    new vm.Script(code);
    console.log("Validación VM exitosa para:", filePath);
  } catch (err) {
    console.error("Error VM en:", filePath, err);
    process.exit(1);
  }

  fs.writeFileSync(filePath, code, 'utf8');
}

updateScrolly('src/scrollytelling.js');
updateScrolly('public/src/scrollytelling.js');
console.log("Scrollytelling actualizado.");
