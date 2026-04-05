'use client'

import { useState } from 'react'
import { ComponenteSalud } from '../salud'
import { SaludModal } from './SaludModal'
import { TFTGaugeCircular } from './TFTGaugeCircular'

interface Props {
  motoId: string
  componentes: ComponenteSalud[]
  vencidos: number
  proximos: number
}

export function SaludGridClient({ motoId, componentes }: Props) {
  const [selectedComp, setSelectedComp] = useState<ComponenteSalud | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Grid 2 columnas x 4 filas — as requested */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 justify-items-center">
        {componentes.slice(0, 8).map((comp) => (
          <TFTGaugeCircular
            key={comp.id}
            comp={comp}
            onClick={() => setSelectedComp(comp)}
          />
        ))}
      </div>

      {selectedComp && (
        <SaludModal
          motoId={motoId}
          comp={selectedComp}
          onClose={() => setSelectedComp(null)}
        />
      )}
    </div>
  )
}
