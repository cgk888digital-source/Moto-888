'use client'

import { memo } from 'react'

function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-2 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="bg-surface rounded-lg p-4 space-y-3">
      <SkeletonBase className="h-40 w-full" />
      <SkeletonBase className="h-4 w-3/4" />
      <SkeletonBase className="h-4 w-1/2" />
      <div className="flex gap-2">
        <SkeletonBase className="h-8 w-16" />
        <SkeletonBase className="h-8 w-16" />
      </div>
    </div>
  )
})

export const SkeletonList = memo(function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 bg-surface rounded-lg">
          <SkeletonBase className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-1/3" />
            <SkeletonBase className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
})

export const SkeletonTable = memo(function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 p-3 bg-surface-2 rounded">
        <SkeletonBase className="h-4 flex-1" />
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 bg-surface rounded">
          <SkeletonBase className="h-4 flex-1" />
          <SkeletonBase className="h-4 w-20" />
          <SkeletonBase className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
})

export const SkeletonText = memo(function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
})

export const SkeletonButton = memo(function SkeletonButton() {
  return <SkeletonBase className="h-10 w-24 rounded-lg" />
})

export const SkeletonAvatar = memo(function SkeletonAvatar({ size = 12 }: { size?: number }) {
  return <SkeletonBase className={`h-${size} w-${size} rounded-full`} />
})

export const LoadingOverlay = memo(function LoadingOverlay() {
  return (
    <div
      className="absolute inset-0 bg-bg/80 flex items-center justify-center"
      role="status"
      aria-label="Cargando"
    >
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
})

export const PageLoader = memo(function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Cargando...</p>
      </div>
    </div>
  )
})