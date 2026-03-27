import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import { addDays, format, startOfDay } from 'date-fns'

export async function GET(req: Request) {
  // Solo permitir si hay una auth key o es un entorno de confianza
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = await createClient()

  // Calcular fechas de 7 y 3 días a partir de hoy
  const today = startOfDay(new Date())
  const date7Days = format(addDays(today, 7), 'yyyy-MM-dd')
  const date3Days = format(addDays(today, 3), 'yyyy-MM-dd')

  try {
    // 1. Usuarios con vencimiento en 7 días
    const { data: users7Days } = await supabase
      .from('users')
      .select('email, nombre')
      .filter('subscription_expires_at', 'eq', date7Days) as { data: { email: string; nombre: string | null }[] | null }

    if (users7Days) {
      for (const user of users7Days) {
        await sendEmail({
          to: user.email,
          subject: '🔔 Tu suscripción vence en 7 días - BikeVzla 888',
          welcomeText: '¡Que nada te detenga!',
          h1: 'Tu aventura continúa',
          body: `Hola ${user.nombre ?? 'motero'}, tu suscripción mensual vence en exactamente 7 días. Renueva ahora para mantener activo tu manual de vuelo y todas las funciones de seguridad.`,
          buttonText: 'Renovar ahora →',
          buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        })
      }
    }

    // 2. Usuarios con vencimiento en 3 días
    const { data: users3Days } = await supabase
      .from('users')
      .select('email, nombre')
      .filter('subscription_expires_at', 'eq', date3Days) as { data: { email: string; nombre: string | null }[] | null }

    if (users3Days) {
      for (const user of users3Days) {
        await sendEmail({
          to: user.email,
          subject: '🚨 Último aviso: Tu suscripción vence en 3 días - BikeVzla 888',
          welcomeText: '¡Atención!',
          h1: 'No pierdas el control',
          body: `Hola ${user.nombre ?? 'motero'}, tu suscripción vence en 3 días. No permitas que tus registros de mantenimiento y acceso a la comunidad se bloqueen.`,
          buttonText: 'Renovar ahora →',
          buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        })
      }
    }

    return NextResponse.json({ success: true, processed: { '7days': users7Days?.length ?? 0, '3days': users3Days?.length ?? 0 } })
  } catch (err) {
    console.error('Error in Cron Job:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
