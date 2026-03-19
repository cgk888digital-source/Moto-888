import { redirect } from 'next/navigation'
import { MotoRegistrationWizard } from '@/features/motos/components/MotoRegistrationWizard'
import { getMisMotos, getProfile } from '@/features/motos/queries'

export default async function OnboardingPage() {
  const [motos, profile] = await Promise.all([getMisMotos(), getProfile()])

  if (!profile) redirect('/login')
  if (motos.length > 0) redirect('/dashboard')

  return <MotoRegistrationWizard initialNombre={profile.nombre} />
}
