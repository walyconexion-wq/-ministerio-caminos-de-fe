const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://osdduwjsicoaeojfhokm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eVJfo1_bTqFQ0hmcXVA47A_kEdvMM0K';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  console.log('Probando conexion a Supabase en:', SUPABASE_URL);
  
  try {
    // 1. Insertar una postulacion de prueba
    const { data: insertData, error: insertError } = await supabase
      .from('postulaciones_fundadores')
      .insert([
        {
          nombre_completo: 'Test Fundador Waly',
          modalidad: 'matrimonio',
          telefono_whatsapp: '+54 9 11 0000-0000',
          email: 'walyconexion@gmail.com',
          talento_principal: 'software',
          experiencia_motivacion: 'Conexion y activacion inicial del búnker',
          estado_evaluacion: 'pendiente'
        }
      ])
      .select();

    if (insertError) {
      console.error('Error al insertar:', insertError);
    } else {
      console.log('¡INSERCIÓN EXITOSA EN SUPABASE! Registro ID:', insertData[0]?.id);
    }

    // 2. Leer registros
    const { data: readData, error: readError } = await supabase
      .from('postulaciones_fundadores')
      .select('*');

    if (readError) {
      console.error('Error al leer:', readError);
    } else {
      console.log('Lectura exitosa. Total registros en tabla:', readData.length);
      console.log('Registros:', readData);
    }

  } catch (err) {
    console.error('Excepcion al conectar:', err);
  }
}

testConnection();
