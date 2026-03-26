export type TipoAceite = 'mineral' | 'semi-sintetico' | 'sintetico'
export type KitTipo = 'digital' | 'sticker' | 'llavero'

export interface MotoFormData {
  marca: string
  modelo: string
  ano: number
  km_actuales: number
  tipo_aceite: TipoAceite
  es_nueva: boolean
  fecha_compra: string | null
  kit_tipo: KitTipo
  tipo_motor: string | null
  cilindrada: string | null
  placa: string | null
  serial_motor: string | null
}

export const MARCAS_MOTO = [
  'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW',
  'Ducati', 'KTM', 'Harley-Davidson', 'Royal Enfield',
  'Benelli', 'Bajaj', 'TVS', 'Triumph', 'Aprilia',
  'Moto Guzzi', 'Husqvarna', 'Vespa', 'Piaggio',
  'Indian', 'Can-Am', 'Otra',
]
