async function test() {
  try {
    const res = await fetch('https://farodeluz.dpdns.org/?v=' + Date.now());
    console.log('Status Live:', res.status);
    const text = await res.text();
    console.log('Contiene id="ecosistema":', text.includes('id="ecosistema"'));
    console.log('Contiene link Navbar Ecosistema:', text.includes('href="#ecosistema"'));
    console.log('Contiene ShopDigital card:', text.includes('Explorar ShopDigital'));
    console.log('Contiene Valle de Luz card:', text.includes('Valle de Luz'));
    console.log('Contiene Caminos de Fe card:', text.includes('Caminos de Fe'));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
