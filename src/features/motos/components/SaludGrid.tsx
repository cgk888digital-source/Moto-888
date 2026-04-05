import { createClient } from '@/lib/supabase/server'
import { calcularSalud } from '../salud'
import { SaludGridClient } from './SaludGridClient'
import { unstable_noStore as noStore } from 'next/cache'

interface Props {
  motoId: string
  kmActuales: number
  tipoAceite: string
}

export async function SaludGrid({ motoId, kmActuales, tipoAceite }: Props) {
  noStore() // Asegurar datos frescos
  const supabase = await createClient()

  const { data: mantenimientos, error } = await supabase
    .from('mantenimientos')
    .select('tipo_servicio, km_al_servicio, proximo_km, fecha')
    .eq('moto_id', motoId)
    .order('km_al_servicio', { ascending: false })

  if (error) {
    console.error('Error cargando salud:', error)
  }

  const componentes = calcularSalud(mantenimientos ?? [], kmActuales, tipoAceite)

  const vencidos = componentes.filter((c) => c.estado === 'vencido').length
  const proximos = componentes.filter((c) => c.estado === 'proximo').length

  return (
    <div className="py-4">
      <SaludGridClient 
        motoId={motoId} 
        componentes={componentes} 
        vencidos={vencidos} 
        proximos={proximos} 
      />
    </div>
  )
}
