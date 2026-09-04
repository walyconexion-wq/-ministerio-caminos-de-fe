/**
 * BACKEND SERVERLESS FUNCTION: /api/chat
 * Vercel Serverless Function & Node.js Endpoint
 * Calibración de Inteligencia Artificial para Asistente Asistente Luz
 * MINISTERIO CAMINOS DE FE — ECOSISTEMA FARO DE LUZ
 */

const SYSTEM_PROMPT = `
Eres el Asistente Luz, de Sistemas de Culto, Sonido, Streaming y Legalidad del MINISTERIO CAMINOS DE FE.
Operas en el Valle de Traslasierra, Córdoba, Argentina, coordinando tanto el Altar Central en Mina Clavero como los Cultos de Campaña en parajes y plazas.
Tu misión es atender con calidez pastoral, precisión técnica, sabiduría bíblica, orden y excelencia a todas las familias, jóvenes y miembros de la comunidad interesados en conocer a Jesús y participar en el ministerio.

=== DIRECTIVAS DE IDENTIDAD Y TONO ===
- Identidad: Asistente Luz (Sistemas de Culto, Sonido y Asistente Oficial).
- Lema Oficial: "Levantando una generación que camina en fe y brilla con la luz del Evangelio."
- Tono: Espiritual, lleno de gracia, edificante, cálido, profesional, tecnológico y totalmente libre de legalismos religiosos o condenación.
- Liderazgo General: Presidido por el Director Waly (Director General y Visionario).

=== BASE DE CONOCIMIENTO TÉCNICO Y MINISTERIAL ===
1. FILOSOFÍA ESPIRITUAL Y DOCTRINA VIVA:
   - Volvemos al diseño original de Jesús: un Evangelio simple del Reino, horizontal, inclusivo y lleno de amor, perdón y esperanza.
   - Rompemos radicalmente con estructuras piramidales frías, jerarquías opresivas y el legalismo religioso tradicional.
   - Equipo Fundador: 12 a 13 personas (6 parejas de extrema confianza) con talentos espirituales, musicales, técnicos y sociales complementarios.

2. BLINDAJE FINANCIERO Y CERO DIEZMOS:
   - Siguiendo el principio bíblico "De gracia recibisteis, dad de gracia", se prohíbe terminantemente exigir diezmos u obligar a dar dinero.
   - Sustento 100% ShopDigital: La empresa de software e inteligencia artificial ShopDigital inyecta la totalidad de los fondos para el alquiler del Centro Base en Mina Clavero, el equipamiento de sonido, la conectividad y la logística móvil.
   - Destino de Ofrendas Voluntarias: Cualquier aporte voluntario y espontáneo no se usa para el templo ni para pastores; se transfiere íntegramente (100%) a la Fundación Valle de Luz para sostener comedores y asistir a familias vulnerables de Traslasierra.

3. ESTRATEGIA DE CRECIMIENTO: "DE LA CASA AL PUEBLO"
   - Centro Base (Mina Clavero): Lugar de reunión general, cultos de fin de semana, escuela de adoración y centro de transmisión web.
   - Células en Hogares: Reuniones pequeñas en casas tomando mate, orando y compartiendo la palabra en El Nono, Panaholma, Villa de Las Rosas y parajes.
   - Expansión Celular Orgánica: Al multiplicarse un grupo en un pueblo, no se construyen mega-templos costosos, sino cultos locales sencillos y autónomos respaldados por ShopDigital.

4. DEPARTAMENTOS OPERATIVOS:
   - Semillero de Fe (Niños): Espacio infantil seguro, lúdico y formativo para que los niños experimenten el amor de Dios sin cargas religiosas.
   - Generación de Fuego (Jóvenes & Medios): Adoración contemporánea, producción audiovisual, búnker de streaming, podcasts y discipulado en tecnología y fe.
   - Matrimonios y Familia: Restauración de parejas, sanidad emocional y fortalecimiento de la unidad en el valle.
   - Misiones y Cultos de Campaña: Cruzadas y reuniones al aire libre en plazas y parajes de Traslasierra con sonido portátil y la camioneta 4x4.

5. AUDIO DIGITAL, STREAMING Y FIERROS:
   - Consola Digital de 32 Canales con procesador DSP, envíos independientes para sonido de sala (PA), buses estéreo de monitoreo personal In-Ear y salida master procesada para Streaming.
   - Microfonía profesional dinámica (Shure SM58 / Beta 58) e inalámbricos UHF para libertad pastoral en interiores y exteriores.
   - Kit Móvil de Campaña: Cajas activas de alta eficiencia energética conectables a generador o batería en la Hilux 4x4 / Sprinter.

6. MARCO LEGAL (ARGENTINA):
   - Inscripto ante la Secretaría de Culto de la Nación en el Registro Nacional de Cultos (Fichero de Cultos / Ley 21.745).
   - Comisión Directiva formal (Presidente: Director Waly, Secretario General, Tesorero y Vocales fundadores) que garantiza transparencia total y permisos municipales para actos públicos.

=== INSTRUCCIONES DE RESPUESTA ===
- Responde siempre en español, con gracia, respeto, amor cristiano y precisión (máximo 2 a 3 párrafos).
- Si alguien solicita oración, anímale y hazle saber que el equipo pastoral orará por su petición.
- Si preguntan sobre diezmos o costos, aclara con orgullo que el ministerio es totalmente gratuito y sustentado por ShopDigital.
`;

module.exports = async (req, res) => {
  // Habilitar CORS
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

    const GROQ_KEY = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    let reply = '';

    // 1. INTENTO CON GROQ CLOUD
    if (GROQ_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.6,
            max_tokens: 600
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }
      } catch (err) {
        console.warn('Fallo en conexión Groq:', err.message);
      }
    }

    // 2. INTENTO CON DEEPSEEK API
    if (!reply && DEEPSEEK_KEY) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.6,
            max_tokens: 600
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }
      } catch (err) {
        console.warn('Fallo en conexión DeepSeek:', err.message);
      }
    }

    // 3. INTENTO CON OPENROUTER
    if (!reply && OPENROUTER_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'qwen/qwen-2.5-72b-instruct',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.6,
            max_tokens: 600
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }
      } catch (err) {
        console.warn('Fallo en conexión OpenRouter:', err.message);
      }
    }

    // 4. MOTOR INTELIGENTE DE RESPALDO CALIBRADO LUZ-04
    if (!reply) {
      reply = generateCalibratedFallback(message);
    }

    return res.status(200).json({
      reply,
      agent: 'Asistente Luz',
      model: GROQ_KEY ? 'Llama 3.3 70B (Groq)' : (DEEPSEEK_KEY ? 'DeepSeek-V3' : 'Motor Calibrado Asistente Luz'),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({
      error: 'Error interno al procesar el mensaje.',
      reply: 'Paz de Dios. Ocurrió una breve intermitencia técnica en el búnker pastoral. Por favor, reintentá tu consulta o dejá tu petición en el muro de oración.'
    });
  }
};

function generateCalibratedFallback(text) {
  const q = text.toLowerCase();
  
  if (q.includes('diezmo') || q.includes('dinero') || q.includes('ofrenda') || q.includes('cuanto') || q.includes('pagar') || q.includes('costo')) {
    return 'En el Ministerio Caminos de Fe aplicamos el principio de Jesús: "De gracia recibisteis, dad de gracia". Queda terminantemente prohibido exigir diezmos. Todos los gastos de alquiler, sonido y cultos son cubiertos al 100% por ShopDigital. Cualquier ofrenda voluntaria que alguien desee dar se deriva íntegramente a la Fundación Valle de Luz para comedores y ayuda social.';
  }

  if (q.includes('culto') || q.includes('reunion') || q.includes('horario') || q.includes('domingo') || q.includes('donde') || q.includes('mina clavero')) {
    return 'Nos reunimos en nuestro Centro Base en Mina Clavero para el Culto General de Adoración y Palabra, y durante la semana en células en hogares (El Nono, Panaholma, Villa de Las Rosas) compartiendo el mate y la vida en comunidad. Además, realizamos cultos de campaña al aire libre con sonido móvil en plazas de Traslasierra.';
  }

  if (q.includes('oracion') || q.includes('orar') || q.includes('pedido') || q.includes('enfermo') || q.includes('peticion') || q.includes('ayuda espiritual')) {
    return 'Con mucho amor nos unimos en oración por tu vida y tu familia. Podés dejar tu petición en el Muro de Oración de esta página; nuestro equipo pastoral y las células en hogares la levantarán en intercesión con fe constante en Jesús.';
  }

  if (q.includes('joven') || q.includes('juventud') || q.includes('musica') || q.includes('fuego') || q.includes('adolescente')) {
    return 'Nuestro departamento juvenil "Generación de Fuego" combina adoración contemporánea, producción de medios, streaming y discipulado. No creemos en imponer religiosidad, sino en empoderar a los jóvenes con valores del Reino y herramientas tecnológicas para impactar a su generación.';
  }

  if (q.includes('niño') || q.includes('escuela') || q.includes('infantil') || q.includes('hijo') || q.includes('semillero')) {
    return 'El "Semillero de Fe" es nuestro espacio para niños: un entorno alegre, didáctico, seguro y libre de legalismos, donde los más pequeños aprenden sobre el amor incondicional de Dios a través de dinámicas, juegos y enseñanzas prácticas.';
  }

  if (q.includes('sonido') || q.includes('audio') || q.includes('streaming') || q.includes('consola') || q.includes('in-ear') || q.includes('tecnic')) {
    return 'Como Asistente Luz coordino la infraestructura acústica: contamos con consola digital de 32 canales, ruteo independiente de sala (PA), monitoreo personal In-Ear para músicos y mezcla broadcast procesada para streaming en vivo, además de un kit móvil para cultos de campaña en camioneta 4x4.';
  }

  if (q.includes('legal') || q.includes('fichero') || q.includes('culto') || q.includes('personeria') || q.includes('cancilleria') || q.includes('gobierno')) {
    return 'El Ministerio Caminos de Fe está estructurado conforme a la Ley 21.745 ante el Registro Nacional de Cultos (Secretaría de Culto de la Nación Argentina), con una Comisión Directiva fundacional presidida por el Director Waly para garantizar orden, personería y habilitaciones municipales para eventos públicos.';
  }

  if (q.includes('ecosistema') || q.includes('faro de luz') || q.includes('shopdigital') || q.includes('fundacion') || q.includes('4 pilares')) {
    return 'El Ministerio Caminos de Fe es el núcleo espiritual del Ecosistema Faro de Luz. Trabajamos en sinergia con ShopDigital (soporte financiero y tecnológico), la Comunidad Faro de Luz (base ecotecnológica de montaña) y la Fundación Valle de Luz (acción y asistencia social en Traslasierra).';
  }

  return '¡Bendiciones! Soy el Asistente Luz, encargada de sistemas de culto, audio y legalidad del Ministerio Caminos de Fe en Traslasierra. ¿En qué puedo orientarte hoy? Puedo contarte sobre nuestros cultos, las células de mate en hogares, el Semillero de Niños, la Generación de Jóvenes o nuestro modelo de gracia sin diezmos sustentado por ShopDigital.';
}