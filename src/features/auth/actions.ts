'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre = formData.get('nombre') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Si el email ya está confirmado (confirmación deshabilitada), redirigir directo
  if (data.session) {
    redirect('/onboarding')
  }

  return { message: 'Revisa tu email para confirmar tu cuenta.' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  // Use service role to generate a recovery link with our callback URL
  const { createServiceClient } = await import('@/lib/supabase/service')
  const admin = createServiceClient()

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
    },
  })

  if (error) return { error: error.message }

  // Send branded Resend email with the recovery link
  const { sendEmail } = await import('@/lib/email')
  await sendEmail({
    to: email,
    subject: '🔐 Recupera tu contraseña — Bikevzla 888',
    welcomeText: 'Seguridad de cuenta',
    h1: 'Restablecer contraseña',
    body: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña. Este enlace expira en 1 hora.',
    buttonText: 'Restablecer mi contraseña →',
    buttonUrl: data.properties.action_link,
  })

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  redirect('/dashboard')
}
