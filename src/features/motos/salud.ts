import { Tables } from '@/types/database.types'

export type EstadoSalud = 'ok' | 'proximo' | 'vencido' | 'sin-datos'

export interface ComponenteSalud {
  id: string
  nombre: string
  icono: string
  estado: EstadoSalud
  kmProximo?: number
  kmActuales: number
  ultimaFecha?: string
  kmRestantes?: number
}

// Intervalos de aceite según tipo (Bikevzla 888)
const KM_ACEITE: Record<string, number> = {
  mineral: 3200,
  'semi-sintetico': 8000,
  sintetico: 10000,
}

// Definición de componentes a monitorear
const COMPONENTES_CONFIG = [
  {
    id: 'aceite',
    nombre: 'Aceite',
    icono: '🛢',
    tipos: ['Cambio de aceite'],
    intervalKm: 0, // se calcula por tipo_aceite
  },
  {
    id: 'cadena',
    nombre: 'Cadena',
    icono: '⛓',
    tipos: ['Cambio de cadena y piñones'],
    intervalKm: 5000,
  },
  {
    id: 'frenos',
    nombre: 'Frenos',
    icono: '🛑',
    tipos: ['Revisión de frenos', 'Cambio de pastillas de freno', 'Cambio de líquido de frenos'],
    intervalKm: 10000,
  },
  {
    id: 'filtro-aire',
    nombre: 'Filtro aire',
    icono: '💨',
    tipos: ['Cambio de filtro de aire'],
    intervalKm: 10000,
  },
  {
    id: 'bujias',
    nombre: 'Bujías',
    icono: '⚡',
    tipos: ['Revisión de bujías'],
    intervalKm: 8000,
  },
  {
    id: 'general',
    nombre: 'Revisión',
    icono: '🔧',
    tipos: ['Revisión general', 'Ajuste de válvulas'],
    intervalKm: 10000,
  },
] as const

const ALERTA_KM = 200 // margen para estado "próximo"

export function calcularSalud(
  mantenimientos: Pick<Tables<'mantenimientos'>, 'tipo_servicio' | 'km_al_servicio' | 'proximo_km' | 'fecha'>[],
  kmActuales: number,
  tipoAceite: string
): ComponenteSalud[] {
  return COMPONENTES_CONFIG.map((comp) => {
    // Buscar el último mantenimiento que coincida con alguno de los tipos del componente
    const ultimos = mantenimientos
      .filter((m) => comp.tipos.some((t) => t === m.tipo_servicio))
      .sort((a, b) => b.km_al_servicio - a.km_al_servicio)

    const ultimo = ultimos[0]

    if (!ultimo) {
      return {
        id: comp.id,
        nombre: comp.nombre,
        icono: comp.icono,
        estado: 'sin-datos',
        kmActuales,
      }
    }

    // Calcular próximo km
    const intervalo = comp.id === 'aceite'
      ? (KM_ACEITE[tipoAceite] ?? 3200)
      : comp.intervalKm

    const kmProximo = ultimo.proximo_km ?? (ultimo.km_al_servicio + intervalo)
    const kmRestantes = kmProximo - kmActuales

    let estado: EstadoSalud
    if (kmRestantes <= 0) {
      estado = 'vencido'
    } else if (kmRestantes <= ALERTA_KM) {
      estado = 'proximo'
    } else {
      estado = 'ok'
    }

    return {
      id: comp.id,
      nombre: comp.nombre,
      icono: comp.icono,
      estado,
      kmProximo,
      kmActuales,
      ultimaFecha: ultimo.fecha,
      kmRestantes: Math.max(0, kmRestantes),
    }
  })
}
