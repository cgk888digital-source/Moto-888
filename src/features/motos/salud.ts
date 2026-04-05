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
  intervalo: number
  tipos: string[]
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
    tipos: ['Revisión de frenos', 'Cambio de pastillas de freno'],
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
    tipos: ['Revisión general'],
    intervalKm: 10000,
  },
  {
    id: 'rodamientos',
    nombre: 'Rodamientos',
    icono: '⚙️',
    tipos: ['Revisión de rodamientos', 'Engrase de ejes'],
    intervalKm: 10000,
  },
  {
    id: 'suspensiones',
    nombre: 'Suspensiones',
    icono: '🦵',
    tipos: ['Revisión de suspensiones', 'Cambio de aceite de horquilla'],
    intervalKm: 15000,
  },
  {
    id: 'embrague',
    nombre: 'Embrague',
    icono: '⛓️‍💥',
    tipos: ['Revisión de embrague', 'Ajuste de embrague'],
    intervalKm: 15000,
  },
  {
    id: 'valvulas',
    nombre: 'Válvulas',
    icono: '🔩',
    tipos: ['Ajuste de válvulas', 'Ajuste de balancines'],
    intervalKm: 10000,
  },
  {
    id: 'kit-arrastre',
    nombre: 'Kit arrastre',
    icono: '⛓',
    tipos: ['Cambio de kit de arrastre', 'Cambio de piñones'],
    intervalKm: 20000,
  },
  {
    id: 'guayas',
    nombre: 'Cables/Guayas',
    icono: '🧶',
    tipos: ['Lubricación de guayas', 'Revisión de cables'],
    intervalKm: 5000,
  },
  {
    id: 'bateria',
    nombre: 'Batería',
    icono: '🔋',
    tipos: ['Revisión de batería', 'Carga de batería'],
    intervalKm: 6000,
  },
  {
    id: 'luces',
    nombre: 'Luces',
    icono: '💡',
    tipos: ['Revisión de luces y fusibles'],
    intervalKm: 6000,
  },
  {
    id: 'sistema-carga',
    nombre: 'Sistema carga',
    icono: '⚡',
    tipos: ['Revisión de sistema de carga', 'Revisión de estator'],
    intervalKm: 10000,
  },
  {
    id: 'inyectores',
    nombre: 'Inyectores/Carb',
    icono: '🧪',
    tipos: ['Limpieza de inyectores', 'Limpieza de carburador'],
    intervalKm: 12000,
  },
  {
    id: 'liquido-frenos',
    nombre: 'Líq. frenos',
    icono: '🧴',
    tipos: ['Cambio de líquido de frenos'],
    intervalKm: 15000,
  },
] as const

const ALERTA_KM = 1500 // margen para estado "próximo" (incrementado para mejor visibilidad)

export function calcularSalud(
  mantenimientos: Pick<Tables<'mantenimientos'>, 'tipo_servicio' | 'km_al_servicio' | 'proximo_km' | 'fecha'>[],
  kmActuales: number,
  tipoAceite: string
): ComponenteSalud[] {
  return COMPONENTES_CONFIG.map((comp) => {
    // Buscar el último mantenimiento que coincida con alguno de los tipos del componente
    const ultimos = mantenimientos
      .filter((m) => {
        const servicio = m.tipo_servicio.trim()
        return comp.tipos.some((t) => t.trim() === servicio)
      })
      .sort((a, b) => b.km_al_servicio - a.km_al_servicio)

    const ultimo = ultimos[0]

    if (!ultimo) {
      const intervalo = comp.id === 'aceite'
        ? (KM_ACEITE[tipoAceite] ?? 3200)
        : comp.intervalKm

      return {
        id: comp.id,
        nombre: comp.nombre,
        icono: comp.icono,
        estado: 'sin-datos',
        kmActuales,
        intervalo,
        tipos: [...comp.tipos],
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
      intervalo,
      tipos: [...comp.tipos],
    }
  })
}
