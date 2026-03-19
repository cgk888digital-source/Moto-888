import Link from 'next/link'

const PILARES = [
  {
    icon: '🛢',
    title: 'Mantenimiento AI + NFC',
    desc: 'Calendario automático, alertas antes de que venza el servicio y kit NFC para que el mecánico registre todo sin app.',
  },
  {
    icon: '💬',
    title: 'Chatbot mecánico IA',
    desc: 'Describí el problema en lenguaje natural. El bot conoce tu moto, su historial y te da un diagnóstico con nivel de urgencia.',
  },
  {
    icon: '🏍',
    title: 'Red social de riders',
    desc: 'Feed de rutas, grupos de riders, eventos y rodadas con GPX. Telemetría en vivo con lean angle desde tu celular.',
  },
  {
    icon: '🛒',
    title: 'Marketplace sin comisión',
    desc: 'Comprá y vendé repuestos, accesorios y motos. Cero comisión al vendedor. Pago seguro integrado.',
  },
  {
    icon: '🛡',
    title: 'RoadGuardian',
    desc: 'Si detecta una caída, envía tu ubicación GPS por SMS y WhatsApp a tu contacto de emergencia en 30 segundos.',
  },
]

const PLANES = [
  {
    nombre: 'Free',
    precio: '$0',
    periodo: 'para siempre',
    color: 'border-border',
    badge: null,
    items: [
      '1 moto registrada',
      'Historial de mantenimientos',
      'Dashboard de salud visual',
      'Portal NFC básico',
    ],
    cta: 'Empezar gratis',
    href: '/register',
    primary: false,
  },
  {
    nombre: 'Pro',
    precio: '$10',
    periodo: 'por mes',
    color: 'border-accent',
    badge: 'Más popular',
    items: [
      'Motos ilimitadas',
      'Chatbot IA ilimitado',
      'Red social + eventos',
      'Marketplace completo',
      'NFC Kit activado',
      'RoadGuardian activo',
    ],
    cta: 'Empezar Pro',
    href: '/register?plan=pro',
    primary: true,
  },
  {
    nombre: 'Fleet',
    precio: '$39.99',
    periodo: 'por mes',
    color: 'border-zinc-600',
    badge: null,
    items: [
      'Hasta 15 motos (delivery)',
      'Panel de flota',
      'Reportes de costos',
      'Todo lo del plan Pro',
    ],
    cta: 'Contactar',
    href: 'mailto:cgk888digital@gmail.com',
    primary: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text-base font-body">

      {/* Nav */}
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-display text-xl font-bold tracking-widest uppercase">
            <span className="text-accent">BikerBrain</span>
            <span className="text-text-base"> 888</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-muted hover:text-text-base transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary text-xs px-4 py-2">
              Registrarse gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <p className="text-accent font-display text-sm uppercase tracking-widest mb-4">
          El ecosistema completo del motociclista
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight text-text-base leading-none mb-6">
          Una sola app.<br />
          <span className="text-accent">Cinco razones para quedarse.</span>
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Mantenimiento inteligente, diagnóstico IA, comunidad de riders, marketplace sin comisión y seguridad activa en carretera. Todo en BikerBrain 888.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="btn-primary text-base px-8 py-4">
            Empezar gratis — 2 minutos
          </Link>
          <Link href="/login" className="btn-ghost text-base px-8 py-4">
            Ya tengo cuenta
          </Link>
        </div>

        {/* Social proof mínima */}
        <p className="mt-8 text-xs text-text-muted">
          Para motociclistas de Venezuela y Latinoamérica · 110cc–150cc y más
        </p>
      </section>

      {/* Los 5 Pilares */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-border">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-center text-text-base mb-2">
          Los 5 pilares
        </h2>
        <p className="text-center text-text-muted text-sm mb-12">
          Desde el primer día con tu moto hasta que la vendés.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {PILARES.map((p, i) => (
            <div key={p.title} className={`bg-surface border border-border rounded-2xl p-6 ${i === 4 ? 'md:col-span-3 md:max-w-sm md:mx-auto' : ''}`}>
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-display font-bold text-base uppercase tracking-wide text-text-base mb-2">
                {p.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problema */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-border">
        <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 text-center">
          <p className="text-accent font-display text-sm uppercase tracking-widest mb-4">El problema real</p>
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-text-base mb-4">
            Todo pasa por WhatsApp.<br />Sin garantías. Sin historial.
          </h2>
          <p className="text-text-muted max-w-xl mx-auto leading-relaxed">
            Los motociclistas venezolanos no tienen herramientas digitales serias. Fraude mecánico, sin comunidad organizada y cero registro de lo que se hizo a tu moto.
          </p>
        </div>
      </section>

      {/* Planes */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-border">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-center text-text-base mb-2">
          Planes simples
        </h2>
        <p className="text-center text-text-muted text-sm mb-12">Sin sorpresas. Cancelá cuando quieras.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANES.map(p => (
            <div key={p.nombre} className={`bg-surface border-2 rounded-2xl p-6 flex flex-col ${p.color} relative`}>
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-xs font-display font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                  {p.badge}
                </span>
              )}
              <div className="mb-6">
                <p className="font-display font-bold text-xl uppercase tracking-wide text-text-base">{p.nombre}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-display text-4xl font-bold text-text-base">{p.precio}</span>
                  <span className="text-text-muted text-sm">{p.periodo}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {p.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="text-accent text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={p.primary ? 'btn-primary text-center' : 'btn-ghost text-center'}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center border-t border-border">
        <h2 className="font-display text-4xl font-bold uppercase tracking-wide text-text-base mb-4">
          El mundo completo de tu moto.
        </h2>
        <p className="text-text-muted mb-8 text-lg">Registrate gratis. Sin tarjeta. En 2 minutos.</p>
        <Link href="/register" className="btn-primary text-base px-10 py-4">
          Crear cuenta gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-xs text-text-muted">
          <span className="font-display uppercase tracking-widest">
            <span className="text-accent">BikerBrain</span> 888
          </span>
          <span>© 2026 · Venezuela y Latinoamérica</span>
        </div>
      </footer>

    </div>
  )
}
