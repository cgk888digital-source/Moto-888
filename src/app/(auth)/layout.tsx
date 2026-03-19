export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <span className="font-display text-3xl font-bold tracking-widest text-accent uppercase">
          Moto<span className="text-text-base">Safe</span>
        </span>
        <p className="text-text-muted text-xs mt-1 tracking-wider uppercase font-body">
          Tu moto, protegida
        </p>
      </div>

      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
