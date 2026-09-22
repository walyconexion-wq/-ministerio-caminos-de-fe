/**
 * SERVERLESS ENDPOINT: /api/broadcast
 * Sincronización global en la nube de la Señal de Streaming en Vivo
 * Conecta el Búnker con todos los navegadores, celulares y televidentes del mundo.
 */

// Memoria volátil en Edge/Node instance + Fallback Supabase si está disponible
let globalBroadcastState = {
  isLive: false,
  streamType: 'webrtc',
  roomName: 'caminosdefe-live-altar',
  youtubeId: '',
  streamTitle: 'Culto Dominical & Ministración de Gracia',
  preacher: 'Equipo Pastoral MCF & Misioneros',
  location: 'Altar Central Mina Clavero / Parajes Traslasierra',
  viewersCount: 42,
  updatedAt: new Date().toISOString()
};

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://osdduwjsicoaeojfhokm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_eVJfo1_bTqFQ0hmcXVA47A_kEdvMM0K';

module.exports = async (req, res) => {
  // CORS Headers para permitir llamadas desde cualquier dispositivo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Consultar estado actual del streaming
  if (req.method === 'GET') {
    try {
      // Intentar leer de Supabase (tabla broadcast_state)
      const fetchResponse = await fetch(`${SUPABASE_URL}/rest/v1/broadcast_state?select=*&limit=1`, {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      });

      if (fetchResponse.ok) {
        const rows = await fetchResponse.json();
        if (rows && rows.length > 0) {
          globalBroadcastState = { ...globalBroadcastState, ...rows[0] };
        }
      }
    } catch (e) {
      // Fallback a memoria en caso de no tener tabla en Supabase
    }

    return res.status(200).json(globalBroadcastState);
  }

  // POST: Actualizar estado desde el Búnker
  if (req.method === 'POST') {
    try {
      const updates = req.body || {};
      globalBroadcastState = {
        ...globalBroadcastState,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Intentar persistir en Supabase
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/broadcast_state`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ id: 1, ...globalBroadcastState })
        });
      } catch (err) {
        // Ignorar si Supabase no tiene la tabla aún
      }

      return res.status(200).json({ success: true, state: globalBroadcastState });
    } catch (error) {
      return res.status(500).json({ error: 'Error actualizando estado de broadcast' });
    }
  }

  return res.status(405).json({ error: 'Método no soportado' });
};
