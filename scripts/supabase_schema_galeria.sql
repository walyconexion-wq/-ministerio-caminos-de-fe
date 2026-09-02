-- ============================================================
-- SQL DE TABLA: galeria_multimedia (SUPABASE POSTGRESQL)
-- ============================================================

CREATE TABLE IF NOT EXISTS galeria_multimedia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'foto', -- 'foto' o 'video'
  url TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Montaña',
  descripcion TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  destacado BOOLEAN DEFAULT false
);

-- Habilitar RLS
ALTER TABLE galeria_multimedia ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
DROP POLICY IF EXISTS "Lectura publica de galeria" ON galeria_multimedia;
CREATE POLICY "Lectura publica de galeria" ON galeria_multimedia FOR SELECT USING (true);

-- Política de gestión completa para el Búnker
DROP POLICY IF EXISTS "Gestion de galeria bunker" ON galeria_multimedia;
CREATE POLICY "Gestion de galeria bunker" ON galeria_multimedia FOR ALL USING (true);

-- Datos Semilla
INSERT INTO galeria_multimedia (titulo, tipo, url, categoria, descripcion, destacado) VALUES
('Emblema Oficial Faro de Luz 3D', 'foto', 'https://farodeluz.dpdns.org/og-faro.jpg', 'Comunidad', 'Insignia dorada en relieve 3D sobre metal oscuro con haces de luz.', true),
('Amanecer en el Valle de Traslasierra', 'foto', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 'Montaña & Predio', 'Vista panorámica de las sierras cordobesas donde se ubica el predio de 1 hectárea.', true),
('Domo Geodésico y Búnker de Servidores', 'foto', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80', 'Domo & Obra', 'Estructura geodésica central de frecuencia 4/5 para reuniones y telecomunicaciones.', true),
('Generación Solar y Microrred 18.4kW', 'foto', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80', 'Ecotecnología', 'Baterías de litio 48V e inversores híbridos para autonomía desconectada.', false),
('Viviendas Modulares en Contenedores 40ft', 'foto', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 'Domo & Obra', 'Disposición en herradura con aislamiento térmico de poliuretano y Durlock.', false)
ON CONFLICT DO NOTHING;
