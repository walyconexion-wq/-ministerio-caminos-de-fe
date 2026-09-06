const { EdgeTTS } = require('@andresaya/edge-tts');

// ENDPOINT SERVERLESS DE VOZ HUMANA NEURAL ARGENTINA (MICROSOFT EDGE NEURAL)
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end();
    res.writeHead(200);
    return res.end();
  }

  let text = '';
  let voice = 'es-AR-ElenaNeural';

  if (req.query && req.query.text) {
    text = req.query.text;
    voice = req.query.voice || voice;
  } else if (req.body && req.body.text) {
    text = req.body.text;
    voice = req.body.voice || voice;
  } else if (req.url && req.url.includes('?')) {
    const urlObj = new URL('http://localhost' + req.url);
    text = urlObj.searchParams.get('text') || '';
    voice = urlObj.searchParams.get('voice') || voice;
  }

  if (!text) {
    if (typeof res.status === 'function') return res.status(400).json({ error: 'Texto requerido' });
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Texto requerido' }));
  }

  // Limpiar texto para síntesis óptima (sin emojis, sin markdown, sin links)
  const cleanText = text
    .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_#`~<>\[\]\(\)]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .substring(0, 320)
    .trim();

  // Función de fallback secundario a Google TTS
  const fallbackGoogleTTS = async (phrase) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=es-AR&client=tw-ob&q=${encodeURIComponent(phrase)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) throw new Error('Google TTS upstream error: ' + response.status);
    return Buffer.from(await response.arrayBuffer());
  };

  let audioBuffer = null;

  // 1. INTENTO PRINCIPAL: Microsoft Edge Neural TTS (es-AR-ElenaNeural)
  try {
    const tts = new EdgeTTS();
    await tts.synthesize(cleanText, voice, {
      rate: 0,
      pitch: 0,
      volume: 0
    });
    audioBuffer = tts.toBuffer();
  } catch (edgeErr) {
    console.warn('Fallo en EdgeTTS neural, activando fallback:', edgeErr.message);
    try {
      audioBuffer = await fallbackGoogleTTS(cleanText);
    } catch (fallbackErr) {
      console.error('Error total en síntesis:', fallbackErr);
    }
  }

  if (!audioBuffer) {
    if (typeof res.status === 'function') return res.status(500).json({ error: 'Error al sintetizar voz' });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Error al sintetizar voz' }));
  }

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }

  if (typeof res.send === 'function') {
    return res.send(audioBuffer);
  } else {
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'Content-Length': audioBuffer.length
    });
    return res.end(audioBuffer);
  }
};
