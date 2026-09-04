const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const scrollyJs = fs.readFileSync('src/scrollytelling.js', 'utf8');
const styleCss = fs.readFileSync('styles/style.css', 'utf8');

const tests = [
  { name: 'Portada: Dice Ministerio Caminos de Fe', pass: indexHtml.includes('Ministerio<br><span class="bg-gradient-to-r from-purple-300 via-amber-300 to-amber-100 bg-clip-text text-transparent">Caminos de Fe</span>') },
  { name: 'Asistente: Sin 04 (Asistente Luz)', pass: indexHtml.includes('Asistente Luz') && !indexHtml.includes('Asistente Luz-04') },
  { name: 'Asistente: Logotipo Cruz en Boton', pass: indexHtml.includes('alt="Cruz Ministerio"') },
  { name: 'Menu: Clases nav-link aplicadas', pass: indexHtml.includes('class="nav-link') },
  { name: 'Menu: Estilos nav-link-active con escala y color', pass: styleCss.includes('.nav-link-active') && styleCss.includes('scale(1.15)') && styleCss.includes('#FBBF24') },
  { name: 'Scrollspy: Motor de deteccion en scrollytelling', pass: scrollyJs.includes('initScrollSpy') && scrollyJs.includes('nav-link-active') }
];

let allPassed = true;
tests.forEach(t => {
  console.log((t.pass ? '✓' : '✗') + ' ' + t.name);
  if (!t.pass) allPassed = false;
});

if (allPassed) {
  console.log('\n🎉 TODOS LOS REQUERIMIENTOS DE FRONTEND ESTAN 100% CUMPLIDOS.');
} else {
  console.log('\n⚠️ HAY FALLOS EN LOS TESTS.');
  process.exit(1);
}
