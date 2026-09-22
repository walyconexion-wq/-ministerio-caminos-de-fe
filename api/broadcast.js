/**
 * SERVERLESS ENDPOINT: /api/broadcast
 * Sincronización global en la nube de la Señal de Streaming en Vivo
 * Conecta el Búnker con todos los navegadores, celulares y televidentes del mundo.
 */

// Estado inicial en frío: updatedAt en 1970 marca claramente un estado no inicializado por el usuario
let globalBroadcastState = {
  isLive: false,
  streamType: 'webrtc',
  roomName: 'caminosdefe-live-altar',
  youtubeId: '',
  streamTitle: 'Culto Dominical & Ministración de Gracia',
  preacher: 'Equipo Pastoral MCF & Misioneros',
  location: 'Altar Central Mina Clavero / Parajes Traslasierra',
  viewersCount: 42,
  updatedAt: '1970-01-01T00:00:00.000Z',
  isColdStart: true
};

module.exports = async (req, res) => {
  // CORS Headers universales
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Cache de borde de corta duración para reducir latencia entre espectadores
  res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=5');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Consultar estado actual del streaming
  if (req.method === 'GET') {
    return res.status(200).json(globalBroadcastState);
  }

  // POST: Actualizar estado desde el Búnker
  if (req.method === 'POST') {
    try {
      const updates = req.body || {};
      globalBroadcastState = {
        ...globalBroadcastState,
        ...updates,
        updatedAt: new Date().toISOString(),
        isColdStart: false
      };

      return res.status(200).json({ success: true, state: globalBroadcastState });
    } catch (error) {
      return res.status(500).json({ error: 'Error actualizando estado de broadcast' });
    }
  }

  return res.status(405).json({ error: 'Método no soportado' });
};
