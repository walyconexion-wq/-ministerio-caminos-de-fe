const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const videoPath = path.resolve('C:/Users/walya/Downloads/aca_tenemos_las_imagenes_de_co.mp4');
const outputDir = path.resolve(__dirname, 'public/frames');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Iniciando extraccion de frames...');
console.log('Video de origen:', videoPath);
console.log('Directorio de destino:', outputDir);

const cmd = `"${ffmpegPath}" -y -i "${videoPath}" -vf "fps=24,scale=1920:-1" -q:v 2 "${path.join(outputDir, 'frame_%04d.jpg')}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
  console.log(`¡Exito! Se extrajeron ${files.length} frames.`);
} catch (err) {
  console.error('Error durante la extraccion:', err);
}
