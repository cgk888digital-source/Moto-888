import { sendEmail } from '../src/lib/email'
import * as dotenv from 'dotenv'
import path from 'path'

// Cargar .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function test() {
  console.log('--- Iniciando prueba de email ---')
  console.log('Usando clave:', process.env.RESEND_API_KEY?.substring(0, 5) + '...')
  
  const res = await sendEmail({
    to: 'cgk888digital@gmail.com', // Email del usuario según conversaciones previas
    subject: '🔥 Prueba de Diseño - BikeVzla 888',
    welcomeText: 'Configuración Exitosa',
    h1: '¡Tu sistema de correos está activo!',
    body: 'Este es un mensaje de prueba para verificar que el logo, los colores naranja BikeVzla y el diseño premium se visualizan correctamente en tu bandeja de entrada.',
    buttonText: 'Explorar mi App →',
    buttonUrl: 'http://localhost:3000',
  })

  if (res.success) {
    console.log('✅ Email enviado con éxito id:', res.data?.id)
  } else {
    console.log('❌ Error al enviar:', res.error)
  }
}

test()
