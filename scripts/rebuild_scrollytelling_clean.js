const fs = require('fs');
const vm = require('vm');
const path = require('path');

let code = fs.readFileSync('C:/Users/walya/Documents/antigravity/quick-maxwell/src/scrollytelling.js', 'utf8');

// Reemplazos de texto y nombres
code = code.replace(/faro_galeria_live_v1/g, 'mcf_galeria_live_v1');
code = code.replace(/faro_galeria_items/g, 'mcf_galeria_live_v1');
code = code.replace(/Comunidad Faro de Luz/g, 'Ministerio Caminos de Fe');
code = code.replace(/Faro de Luz/g, 'Caminos de Fe');
code = code.replace(/Luz-02/g, 'Luz-04');
code = code.replace(/FL-2027-/g, 'MCF-2027-');

// Inyectar failsafe inmediato para finishLoading y DOM ready
code = code.replace(
  /window\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*?\}\);\s*\}\)\(\);/s,
  `function initAll() {
    try { preloadImages(); } catch(e) { console.warn('Preload:', e); finishLoading(); }
    try { resizeCanvas(); } catch(e) { console.warn('Canvas:', e); }
    try { requestAnimationFrame(animationLoop); } catch(e) { console.warn('Loop:', e); }
    try { initLiveClock(); } catch(e) { console.warn('Clock:', e); }
    try { initLuzAssistant(); } catch(e) { console.warn('Luz:', e); }
    try { initGaleriaPublic(); } catch(e) { console.warn('Galeria:', e); }
    try { initCommunityForm(); } catch(e) { console.warn('Form:', e); }
    setTimeout(finishLoading, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();`
);

// 6 Elementos del Ministerio
const mcfDefaultMedia = `const defaultMedia = [
      {
        id: 'mcf-item-1',
        titulo: 'Altar de Adoración en la Montaña',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Cultos & Alabanza',
        descripcion: 'Encuentro de adoración, intercesión y comunión en el Domo Central de Traslasierra.',
        destacado: true
      },
      {
        id: 'mcf-item-2',
        titulo: 'Culto de Campaña al Aire Libre',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Campañas en la Montaña',
        descripcion: 'Despliegue móvil de sonido en plazas públicas y parajes del valle con la Hilux 4x4.',
        destacado: true
      },
      {
        id: 'mcf-item-3',
        titulo: 'Generación de Fuego — Discipulado Joven',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Discipulado de Jóvenes',
        descripcion: 'Jóvenes consagrados aprendiendo producción de medios, streaming y música contemporánea.',
        destacado: false
      },
      {
        id: 'mcf-item-4',
        titulo: 'Bautismos y Testimonio en el Río',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Testimonios de Fe',
        descripcion: 'Testimonios vivos de transformación y renovación espiritual en el río Panaholma.',
        destacado: false
      },
      {
        id: 'mcf-item-5',
        titulo: 'Consola Digital 32 CH & Búnker Acústico',
        tipo: 'foto',
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
        categoria: 'Música & Sonido',
        descripcion: 'Procesamiento DSP, monitoreo personal In-Ear y mezcla estéreo para streaming web.',
        destacado: false
      },
      {
        id: 'mcf-item-6',
        titulo: 'Transmisión de Culto en Vivo — Altar Central',
        tipo: 'video',
        url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
        categoria: 'Cultos & Alabanza',
        descripcion: 'Registro audiovisual de cultos dominicales y mensajes del Reino transmitidos al valle.',
        destacado: true
      }
    ];`;

code = code.replace(/const defaultMedia = \[[\s\S]*?\];/, mcfDefaultMedia);

// Test VM
try {
  new vm.Script(code);
  console.log("¡CÓDIGO SCROLLYTELLING 100% VÁLIDO EN VM!");
} catch (e) {
  console.error("Error al validar:", e);
  process.exit(1);
}

fs.writeFileSync('src/scrollytelling.js', code, 'utf8');
fs.writeFileSync('public/src/scrollytelling.js', code, 'utf8');
console.log("src/scrollytelling.js y public/src/scrollytelling.js guardados.");
