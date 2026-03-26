import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Enviar email de bienvenida de forma asíncrona para no retrasar el redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        // Importación dinámica para evitar problemas en el entorno de Edge si se usara
        const { sendEmail } = await import('@/lib/email')
        sendEmail({
          to: user.email,
          subject: '🏍️ ¡Bienvenido a la Élite de BikeVzla 888!',
          welcomeText: 'Registro Completado',
          h1: `¡Hola, ${user.user_metadata.nombre || 'Motero'}!`,
          body: 'Gracias por confirmar tu cuenta. Ahora tienes acceso completo a la plataforma más potente para gestionar tu moto en Venezuela. ¿Listo para rodar?',
          buttonText: 'Ir a mi Dashboard →',
          buttonUrl: `${origin}/dashboard`,
        }).catch(err => console.error('Error enviando bienvenida:', err))
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`)
}
