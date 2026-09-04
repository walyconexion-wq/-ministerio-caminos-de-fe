const fs = require('fs');

// 1. Limpiar index.html y public/index.html
function cleanHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/<strong>Luz-04<\/strong>/g, '<strong>Asistente Luz</strong>');
  html = html.replace(/Luz-04/g, 'Asistente Luz');
  fs.writeFileSync(filePath, html, 'utf8');
  console.log("Limpio HTML:", filePath);
}
cleanHtml('index.html');
cleanHtml('public/index.html');

// 2. Limpiar scrollytelling.js
function cleanScrolly(filePath) {
  let js = fs.readFileSync(filePath, 'utf8');
  js = js.replace(/¡Hola! Soy Luz-04, ingeniera asistente de la Ministerio Caminos de Fe/g, '¡Hola! Soy el Asistente Luz, de sistemas de culto y sonido del Ministerio Caminos de Fe');
  js = js.replace(/Luz-04/g, 'Asistente Luz');
  fs.writeFileSync(filePath, js, 'utf8');
  console.log("Limpio Scrolly:", filePath);
}
cleanScrolly('src/scrollytelling.js');
cleanScrolly('public/src/scrollytelling.js');

// 3. Calibrar api/chat.js
let chatJs = fs.readFileSync('api/chat.js', 'utf8');
chatJs = chatJs.replace(/Eres Luz-04, la Ingeniera Oficial de Sistemas de Culto, Sonido, Streaming y Legalidad/g, 'Eres el Asistente Luz, de Sistemas de Culto, Sonido, Streaming y Legalidad');
chatJs = chatJs.replace(/- Identidad: Luz-04 \(Ingeniera de Sistemas de Culto, Sonido y Asistente Oficial\)\./g, '- Identidad: Asistente Luz (Sistemas de Culto, Sonido y Asistente Oficial).');
chatJs = chatJs.replace(/agent: 'Luz-04'/g, "agent: 'Asistente Luz'");
chatJs = chatJs.replace(/Motor Calibrado Luz-04/g, 'Motor Calibrado Asistente Luz');
chatJs = chatJs.replace(/Como Luz-04 coordino la infraestructura/g, 'Como Asistente Luz coordino la infraestructura');
chatJs = chatJs.replace(/¡Bendiciones! Soy Luz-04,/g, '¡Bendiciones! Soy el Asistente Luz,');
chatJs = chatJs.replace(/Luz-04/g, 'Asistente Luz');
fs.writeFileSync('api/chat.js', chatJs, 'utf8');
console.log("api/chat.js actualizado.");
