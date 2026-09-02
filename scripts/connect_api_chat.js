const fs = require('fs');

// 1. Actualizar scrollytelling.js
function updateScrollytelling(path) {
  let code = fs.readFileSync(path, 'utf8');

  const oldHandle = /function handleLuzUserMessage\(userText\) \{[\s\S]*?appendLuzMessage\('Luz-02', reply, 'assistant'\);\s*\}, 750\);\s*\}/;
  
  const newHandle = `let luzChatHistory = [];

  async function handleLuzUserMessage(userText) {
    appendLuzMessage('Tú', userText, 'user');
    luzChatHistory.push({ role: 'user', content: userText });

    // Indicador de "Escribiendo..."
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'flex gap-2 items-center text-[10px] text-amber-300 font-mono italic p-2';
    typingIndicator.innerHTML = '<span class="animate-spin text-xs">⚡</span> Luz-02 está procesando tu respuesta...';
    luzChatBody.appendChild(typingIndicator);
    luzChatBody.scrollTop = luzChatBody.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: luzChatHistory })
      });

      const data = await response.json();
      typingIndicator.remove();

      const reply = data.reply || generateLuzResponse(userText);
      luzChatHistory.push({ role: 'assistant', content: reply });
      appendLuzMessage('Luz-02', reply, 'assistant');
    } catch (err) {
      console.warn('Fallback por red:', err);
      typingIndicator.remove();
      const reply = generateLuzResponse(userText);
      luzChatHistory.push({ role: 'assistant', content: reply });
      appendLuzMessage('Luz-02', reply, 'assistant');
    }
  }`;

  code = code.replace(oldHandle, newHandle);
  fs.writeFileSync(path, code, 'utf8');
  console.log('Actualizado:', path);
}

updateScrollytelling('src/scrollytelling.js');
updateScrollytelling('public/src/scrollytelling.js');

// 2. Actualizar bunker.js
function updateBunkerJs(path) {
  let code = fs.readFileSync(path, 'utf8');

  const oldBunkerChat = /chatForm\.addEventListener\('submit', \(e\) => \{[\s\S]*?appendMessage\('Luz-02', reply, 'text-cyan-400'\);\s*\}, 700\);\s*\}\);/;

  const newBunkerChat = `let bunkerChatHistory = [];

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage('Director Waly', text, 'text-amber-300');
    bunkerChatHistory.push({ role: 'user', content: text });
    chatInput.value = '';

    // Indicador temporal
    const tempId = 'msg-' + Date.now();
    const tempDiv = document.createElement('div');
    tempDiv.id = tempId;
    tempDiv.className = 'flex gap-3 bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 font-mono text-xs text-cyan-300 italic';
    tempDiv.innerHTML = '<span>⚡ Consultando a Luz-02 AI...</span>';
    chatMessages.appendChild(tempDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: bunkerChatHistory })
      });

      const data = await response.json();
      tempDiv.remove();

      const reply = data.reply || 'Orden registrada en el nodo central.';
      bunkerChatHistory.push({ role: 'assistant', content: reply });
      appendMessage('Luz-02', reply, 'text-cyan-400');
    } catch (err) {
      tempDiv.remove();
      appendMessage('Luz-02', 'Sistemas del búnker operativos. ' + text, 'text-cyan-400');
    }
  });`;

  code = code.replace(oldBunkerChat, newBunkerChat);
  fs.writeFileSync(path, code, 'utf8');
  console.log('Actualizado:', path);
}

updateBunkerJs('src/bunker.js');
updateBunkerJs('public/src/bunker.js');
