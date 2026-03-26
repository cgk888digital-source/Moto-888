'use client'

import { memo } from 'react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export const Breadcrumbs = memo(function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="text-text-muted hover:text-text-base transition-colors"
      >
        Inicio
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          <span className="text-text-muted">/</span>
          {item.href ? (
            <Link
              href={item.href}
              className="text-text-muted hover:text-text-base transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-base font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
})

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  let currentPath = ''

  for (const part of parts) {
    currentPath += `/${part}`
    const label = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    breadcrumbs.push({ label, href: currentPath })
  }

  const last = breadcrumbs[breadcrumbs.length - 1]
  if (last) last.href = undefined

  return breadcrumbs
}