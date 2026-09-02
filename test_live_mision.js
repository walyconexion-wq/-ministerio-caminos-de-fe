async function test() {
  try {
    const res = await fetch('https://farodeluz.dpdns.org/?v=' + Date.now());
    console.log('Status Live:', res.status);
    const text = await res.text();
    console.log('Contiene mision-vision:', text.includes('mision-vision'));
    console.log('Contiene link Navbar:', text.includes('Visión & Misión'));
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
