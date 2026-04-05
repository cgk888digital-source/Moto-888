import React from 'react'

export const TFTIcons = {
  aceite: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 7h-6l3-7z" />
      <path d="M6 10v10a2 2 0 002 2h8a2 2 0 002-2V10" />
      <path d="M12 14v4" />
      <path d="M15 14v2" />
      <path d="M9 14v2" />
    </svg>
  ),
  cadena: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="4" height="4" rx="1" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <rect x="17" y="10" width="4" height="4" rx="1" />
      <path d="M7 12h3" />
      <path d="M14 12h3" />
    </svg>
  ),
  frenos: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
    </svg>
  ),
  'filtro-aire': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 4v16" />
      <path d="M12 4v16" />
      <path d="M16 4v16" />
      <path d="M4 8h16" />
      <path d="M4 12h16" />
      <path d="M4 16h16" />
    </svg>
  ),
  bujias: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M10 6h4v2h-4z" />
      <path d="M8 8h8v6l-2 2h-4l-2-2z" />
      <path d="M12 16v6" />
      <path d="M10 22h4" />
    </svg>
  ),
  general: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z" />
    </svg>
  ),
  suspensiones: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="2" width="4" height="20" rx="2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  ),
  guayas: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4c16 0 0 16 16 16" />
      <path d="M4 8c12 0 0 12 12 12" />
      <path d="M8 4c0 12 12 0 12 12" />
    </svg>
  ),
}

export type TFTIconType = keyof typeof TFTIcons
