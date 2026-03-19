'use client'

import { useEffect, useState } from 'react'
import { getFotoUrl } from '../upload'

export function FotoViewer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    getFotoUrl(path).then(setUrl)
  }, [path])

  if (!url) return (
    <div className="w-full h-16 rounded-lg bg-surface border border-border animate-pulse" />
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-2 text-xs text-accent font-body hover:underline flex items-center gap-1"
      >
        📷 Ver foto del servicio
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Foto del servicio"
            className="max-w-full max-h-full rounded-xl object-contain"
          />
        </div>
      )}
    </>
  )
}
