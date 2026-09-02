async function test() {
  try {
    const res = await fetch('https://farodeluz.dpdns.org/?v=' + Date.now());
    console.log('Status Live:', res.status);
    const text = await res.text();
    console.log('Contiene header-live-clock:', text.includes('header-live-clock'));
    console.log('Contiene clock-display:', text.includes('clock-display'));
    console.log('Ya NO contiene Base Montaña 2027 en header:', !text.includes('Base Montaña · 2027'));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
