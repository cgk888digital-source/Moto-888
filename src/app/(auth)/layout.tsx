import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <Image src="/logo.png" alt="Bikevzla 888" width={280} height={204} className="h-28 w-auto object-contain mx-auto" priority />
      </div>

      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
