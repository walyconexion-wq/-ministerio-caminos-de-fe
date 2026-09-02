async function test() {
  try {
    const resWeb = await fetch('https://farodeluz.dpdns.org/?v=' + Date.now());
    const webText = await resWeb.text();
    console.log('Status Web:', resWeb.status);
    console.log('Web contiene Sumate a la Comunidad:', webText.includes('Sumate a la Comunidad'));
    console.log('Web contiene credential-success-card:', webText.includes('credential-success-card'));
    console.log('Web contiene Modalidad Interés:', webText.includes('Modalidad de Interés'));

    const resBunker = await fetch('https://farodeluz.dpdns.org/bunker.html?v=' + Date.now());
    const bunkerText = await resBunker.text();
    console.log('Status Búnker:', resBunker.status);
    console.log('Búnker contiene Tab Comunidad & Suscripciones:', bunkerText.includes('Comunidad & Suscripciones'));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
