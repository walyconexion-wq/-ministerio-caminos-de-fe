async function test() {
  try {
    const resJs = await fetch('https://farodeluz.dpdns.org/src/scrollytelling.js?v=' + Date.now());
    const jsText = await resJs.text();
    console.log('Status JS:', resJs.status);
    console.log('JS contiene initLiveClock:', jsText.includes('initLiveClock'));
    console.log('JS contiene initGaleriaPublic:', jsText.includes('initGaleriaPublic'));
    console.log('JS contiene initCommunityForm:', jsText.includes('initCommunityForm'));
    console.log('JS contiene getFramePath /frames/:', jsText.includes('/frames/frame_'));

    const resWeb = await fetch('https://farodeluz.dpdns.org/?v=' + Date.now());
    console.log('Status Web:', resWeb.status);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
