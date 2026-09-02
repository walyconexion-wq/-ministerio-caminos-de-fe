async function test() {
  try {
    const resWeb = await fetch('https://farodeluz.dpdns.org/?v=' + Date.now());
    const webText = await resWeb.text();
    console.log('Status Web:', resWeb.status);
    console.log('Web contiene id="galeria":', webText.includes('id="galeria"'));
    console.log('Web contiene link Navbar Galería:', webText.includes('href="#galeria"'));
    console.log('Web contiene Lightbox Modal:', webText.includes('galeria-lightbox'));

    const resBunker = await fetch('https://farodeluz.dpdns.org/bunker.html?v=' + Date.now());
    const bunkerText = await resBunker.text();
    console.log('Status Búnker:', resBunker.status);
    console.log('Búnker contiene Tab Galería:', bunkerText.includes('tab-galeria'));
    console.log('Búnker contiene Form Carga Medio:', bunkerText.includes('form-add-media'));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
