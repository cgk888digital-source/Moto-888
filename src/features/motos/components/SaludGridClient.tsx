'use client'

import { useState } from 'react'
import { ComponenteSalud } from '../salud'
import { SaludModal } from './SaludModal'
import { TFTGaugeCircular } from './TFTGaugeCircular'
import { MaintenanceAlertBanner } from './MaintenanceAlertBanner'
import { MaintenancePopup } from './MaintenancePopup'

interface Props {
  motoId: string
  componentes: ComponenteSalud[]
  vencidos: number
  proximos: number
}

export function SaludGridClient({ motoId, componentes }: Props) {
  const [selectedComp, setSelectedComp] = useState<ComponenteSalud | null>(null)

  return (
    <div className="flex flex-col gap-1">
      {/* Smart Alerts & Maintenance Popups */}
      <MaintenanceAlertBanner componentes={componentes} />
      <MaintenancePopup 
        componentes={componentes} 
        onResolver={(comp) => setSelectedComp(comp)} 
      />

      {/* Grid 2 columnas x 4 filas — as requested */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 justify-items-center">
        {componentes.slice(0, 8).map((comp, index) => (
          <TFTGaugeCircular
            key={comp.id}
            comp={comp}
            index={index}
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
