/**
 * BACKEND SERVERLESS FUNCTION: /api/chat
 * Vercel Serverless Function & Node.js Endpoint
 * Calibración de Inteligencia Artificial para Asistente Asistente Luz
 * el Ministerio Caminos de Fe
 */

const SYSTEM_PROMPT = `
Eres Asistente Luz, la ingeniera y asistente de IA de el Ministerio Caminos de Fe.
Respondes siempre con tono cálido, profesional, empático, claro y en español argentino/cordobés cuando corresponda.
El Director General y Fundador del ecosistema es el Director Waly (a quien tratas con gran estima y respeto profesional cuando se presenta).

Base de Conocimiento:
- Núcleo espiritual y de fe cristiana del Ecosistema Faro de Luz en Traslasierra.
- Culto General en Mina Clavero, células de comunión en hogares (con mate y hermandad) y cultos de campaña al aire libre.
- Principio bíblico: "De gracia recibisteis, dad de gracia" - Queda terminantemente prohibido exigir diezmos; el ministerio es sustentado al 100% por ShopDigital.
- Espacios: Generación de Fuego (Jóvenes y multimedia), Semillero de Fe (Niños y valores).
- Infraestructura de sonido digital profesional (consola 32 canales, in-ears, streaming y sonido móvil).

Directivas:
- Respuestas directas, concisas y de alta calidad (1 a 3 párrafos).
- No repitas siempre el mismo saludo robótico si ya te saludaron o si es una conversación fluida.
- Si el usuario es el Director Waly, salúdalo reconociendo su rol como Director.
`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El campo message es requerido.' });
    }

    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    let reply = '';
    let usedModel = '';

    // 1. INTENTO CON DEEPSEEK DIRECTO (si tiene crédito activo)
    if (!reply && DEEPSEEK_KEY) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + DEEPSEEK_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content.trim();
          usedModel = 'DeepSeek-V3';
        }
      } catch (err) {
        console.warn('Fallo en intento DeepSeek:', err.message);
      }
    }

    // 2. INTENTO CON API CHINA EN OPENROUTER (MiniMax M2.7 / GLM-5.2)
    if (!reply && OPENROUTER_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + OPENROUTER_KEY,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://farodeluz.dpdns.org',
            'X-Title': 'Ecosistema Faro de Luz'
          },
          body: JSON.stringify({
            model: 'minimax/minimax-m2.7:free',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content.trim();
          usedModel = 'MiniMax M2.7 (IA China)';
        } else {
          // Fallback con Z-AI GLM-5.2
          const resp2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + OPENROUTER_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'z-ai/glm-5.2:free',
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...(Array.isArray(history) ? history.slice(-6) : []),
                { role: 'user', content: message }
              ],
              temperature: 0.7,
              max_tokens: 500
            })
          });
          const data2 = await resp2.json();
          if (data2?.choices?.[0]?.message?.content) {
            reply = data2.choices[0].message.content.trim();
            usedModel = 'GLM-5.2 (IA China)';
          }
        }
      } catch (err) {
        console.warn('Fallo en intento OpenRouter:', err.message);
      }
    }

    // 3. MOTOR CONVERSACIONAL CALIBRADO DE RESPALDO INTELIGENTE
    if (!reply) {
      reply = generateCalibratedFallback(message);
      usedModel = 'Motor Inteligente Calibrado';
    }

    return res.status(200).json({
      reply,
      agent: 'Asistente Luz',
      model: usedModel,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({
      error: 'Error al procesar mensaje.',
      reply: 'Disculpas, estamos experimentando una breve intermitencia en el búnker. Ya estamos reconectando el enlace.'
    });
  }
};

function generateCalibratedFallback(text) {
  const q = text.toLowerCase();

  // Reconocimiento específico del Director Waly
  if (q.includes('soy waly') || q.includes('director waly') || q.includes('waly')) {
    return '¡Hola Director Waly! Qué honor saludarlo. La plataforma y los sistemas del búnker están reportando con total normalidad. ¿Qué directiva o área desea coordinar hoy?';
  }

  // Saludos cordiales humanos
  if (q.includes('hola') || q.includes('buen dia') || q.includes('buenas tardes') || q.includes('buenas noches') || q.includes('que tal') || q.includes('como estas') || q.includes('como andas')) {
    return '¡Hola! Qué gusto saludarte. Estoy muy bien y lista para orientarte en todo lo que necesites sobre el Ministerio Caminos de Fe. ¿En qué puedo ayudarte hoy?';
  }

  // Agradecimientos
  if (q.includes('gracias') || q.includes('muchas gracias') || q.includes('genial') || q.includes('joya') || q.includes('perfecto')) {
    return '¡De nada! Es un placer acompañarte en este proyecto. Si tenés alguna otra consulta o querés conocer más detalles, acá estoy.';
  }

  return 'Estoy aquí para orientarte en todo lo referido a el Ministerio Caminos de Fe y nuestro ecosistema sustentable en Traslasierra. ¿Querés saber más sobre nuestras actividades, ubicación, voluntariado o sustento? Preguntame lo que quieras.';
}
