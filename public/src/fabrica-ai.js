/**
 * FABRICA AI - CEREBRO DE GUIONES, PROMPTS Y SÍNTESIS DE VOZ DE ARI
 * Conecta el motor de IA (DeepSeek / MiniMax / GLM) y el motor Edge-TTS
 * para automatizar la creación de los 3 misiles de 10 segundos.
 */

class FabricaAI {
  constructor() {
    this.apiChatUrl = '/api/chat';
    this.apiTtsUrl = '/api/tts';
  }

  /**
   * Genera el guion estratégico de 10 segundos calibrado con el ADN del escenario
   */
  async generateScript({ scenario, missionType, missionTone, details, ctaItem, profile }) {
    const prompt = `[ROL: GUIONISTA EXPERTO DE MISILES VIRALES DE 10 SEGUNDOS]
Campaña: ${scenario?.title || 'ARI'}
ADN del Escenario: ${scenario?.description || ''}
Camuflaje Visual: ${scenario?.camouflage || ''}
Tipo de Misil: ${missionType.toUpperCase()} (Objetivo: ${missionType === 'presentation' ? 'Gancho inicial que frena el scroll' : missionType === 'promotion' ? 'Desarrollo de oferta irresistible con prueba social' : 'Llamado a la acción imperativo y de urgencia'})
Tono Requerido: ${missionTone?.title || 'Persuasivo'} - ${missionTone?.promptFocus || ''}
Detalles Clave: ${details || 'Promoción especial'}
Acción CTA: ${ctaItem?.text || 'Tocá el link en bio'}
Ajuste de Perfil: ${profile?.basePrompt || ''}

Genera:
1. "SCRIPT_VOICE": El texto exacto que dirá la voz de Ari en off/on (máximo 25 palabras para exactamente 8 a 10 segundos de locución hablada en español argentino/neutro natural).
2. "VIDEO_PROMPT_EN": El prompt cinemático en inglés optimizado para Kling / Hailuo / Luma / Pika (cámara 9:16 vertical, iluminación, personaje, movimiento dinámico).
3. "HEADLINE": Un título gancho de 4 palabras para superponer en pantalla.

Responde ÚNICAMENTE en formato JSON con las claves: "script_voice", "video_prompt_en", "headline".`;

    try {
      const res = await fetch(this.apiChatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || '';
        // Intentar extraer JSON de la respuesta
        const jsonMatch = replyText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.warn('Fallback a generador local de guiones:', e);
    }

    // Fallback inteligente precalibrado
    return this.getCalibratedFallback({ scenario, missionType, details, ctaItem });
  }

  getCalibratedFallback({ scenario, missionType, details, ctaItem }) {
    if (missionType === 'presentation') {
      return {
        script_voice: `¡Atención! Si buscás una oportunidad real en ${scenario?.title || 'nuestra comunidad'}, frená acá. Esto cambia todo tu radar.`,
        video_prompt_en: `Vertical 9:16 cinematic video, dynamic camera zoom, charismatic host making eye contact, modern studio background, high production quality, 8k resolution`,
        headline: `¡FRENÁ TU RADAR AHORA!`
      };
    }
    if (missionType === 'promotion') {
      return {
        script_voice: `${details || 'Esta oportunidad exclusiva'} está disponible por tiempo limitado. Calidad garantizada, respaldo directo y cuotas sin interés.`,
        video_prompt_en: `Vertical 9:16 macro product showcase, sleek floating elements, cinematic reflections, neon accents, ultra-sharp details, commercial lighting`,
        headline: `OPORTUNIDAD ÚNICA ⚡`
      };
    }
    return {
      script_voice: `${ctaItem?.text || 'Tocá el link en nuestra biografía'} y no te quedes afuera. Escribinos ahora mismo y asegurá tu lugar.`,
      video_prompt_en: `Vertical 9:16 energetic call-to-action scene, animated finger pointing down at link button, glowing border effects, exciting atmosphere`,
      headline: `¡ENTRÁ AL ENLACE! 📲`
    };
  }

  /**
   * Genera el audio neuronal con Edge-TTS o Web Speech
   */
  async generateVoiceAudio(text, voiceType = 'es-AR') {
    // 1. Probar backend serverless /api/tts si existe
    try {
      const res = await fetch(this.apiTtsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceType })
      });
      if (res.ok) {
        const blob = await res.blob();
        return {
          url: URL.createObjectURL(blob),
          blob
        };
      }
    } catch (e) {
      // Ignorar y usar fallback
    }

    // 2. Fallback con síntesis de voz en navegador
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-AR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      resolve({ url: null, native: true });
    });
  }

  /**
   * Genera un video MP4 animado sintético en el navegador (Canvas -> MediaRecorder)
   * Útil cuando se sube una foto de producto para convertirla en video de 10 segundos al instante.
   */
  async createVideoFromProductImage(imageSrc, durationSeconds = 10, textOverlay = '') {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280; // 9:16 vertical
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const stream = canvas.captureStream(30);
        let recorder;
        try {
          recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        } catch (e) {
          recorder = new MediaRecorder(stream);
        }

        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' });
          resolve(blob);
        };

        recorder.start();
        const startTime = Date.now();
        const totalDuration = durationSeconds * 1000;

        function drawFrame() {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / totalDuration, 1);

          // Fondo degradado oscuro
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, '#0d0b14');
          grad.addColorStop(0.5, '#1e1035');
          grad.addColorStop(1, '#0d0b14');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Efecto de Zoom dinámico (Ken Burns)
          const scale = 1.0 + progress * 0.15;
          const imgW = canvas.width * 0.85 * scale;
          const imgH = (img.height / img.width) * imgW;
          const x = (canvas.width - imgW) / 2;
          const y = (canvas.height - imgH) / 2 - 50;

          // Sombra de producto
          ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
          ctx.shadowBlur = 40;
          ctx.drawImage(img, x, y, imgW, imgH);
          ctx.shadowBlur = 0;

          // Marco visual de Misil
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.lineWidth = 4;
          ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

          // Barra de progreso inferior
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(40, canvas.height - 50, (canvas.width - 80) * progress, 8);

          // Text overlay
          if (textOverlay) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(textOverlay, canvas.width / 2, canvas.height - 120);
          }

          if (progress < 1) {
            requestAnimationFrame(drawFrame);
          } else {
            recorder.stop();
          }
        }

        drawFrame();
      };

      img.onerror = reject;
      img.src = imageSrc;
    });
  }
}

window.fabricaAI = new FabricaAI();
