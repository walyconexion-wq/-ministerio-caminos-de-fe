async function test() {
  try {
    const res = await fetch('https://farodeluz.dpdns.org/?v=' + Date.now());
    console.log('Status Live:', res.status);
    const text = await res.text();
    console.log('Contiene id="ubicacion":', text.includes('id="ubicacion"'));
    console.log('Contiene link Navbar Ubicación:', text.includes('href="#ubicacion"'));
    console.log('Contiene Panaholma:', text.includes('Panaholma'));
    console.log('Contiene Cura Brochero:', text.includes('Cura Brochero'));
    console.log('Contiene Google Maps Embed:', text.includes('maps.google.com'));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
