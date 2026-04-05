'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',            label: 'Mi Moto',  icon: '🏍️' },
  { href: '/feed',                 label: 'Feed',     icon: '📡' },
  { href: '/marketplace',          label: 'Market',   icon: '🛒' },
  { href: '/marketplace/mensajes', label: 'Chats',    icon: '💬' },
  { href: '/grupos',               label: 'Grupos',   icon: '👥' },
  { href: '/eventos',              label: 'Eventos',  icon: '📅' },
  { href: '/rutas',                label: 'Rutas',    icon: '🗺️' },
  { href: '/roadguardian',         label: 'Guard',    icon: '🛡️' },
]

export function DashboardNavigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop tab nav — hidden on mobile */}
      <div className="hidden md:flex max-w-5xl mx-auto px-4 gap-1 overflow-x-auto scrollbar-none">
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                isActive 
                  ? 'text-accent border-accent brightness-110 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                  : 'text-accent border-transparent brightness-[0.6] hover:brightness-100 hover:border-white/20'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>

      {/* Mobile bottom nav — hidden on md+ */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-white/5 md:hidden safe-area-inset-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-stretch h-16">
          {NAV.map(({ href, label, icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all min-w-0 py-1 ${
                  isActive ? 'text-accent' : 'text-accent brightness-[0.7]'
                }`}
              >
                <span className={`text-xl leading-none transition-all ${isActive ? 'scale-115 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : ''}`}>{icon}</span>
                <span className={`text-[8px] font-display font-black uppercase tracking-tighter truncate w-full text-center px-0.5 leading-none`}>
                  {label}
                </span>
                {isActive && <div className="absolute top-0 w-8 h-[2px] bg-accent shadow-[0_0_12px_rgba(245,158,11,1)]" />}
                {isActive && <div className="w-1 h-1 bg-accent rounded-full mt-0.5 shadow-[0_0_8px_rgba(245,158,11,1)]" />}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
