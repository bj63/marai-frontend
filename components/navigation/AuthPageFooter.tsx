import Link from 'next/link'

const footerLinks = [
  { label: 'Status', href: '/status' },
  { label: 'Security', href: '/security' },
  { label: 'Docs', href: '/docs' },
  { label: 'Press', href: '/press' },
]

export default function AuthPageFooter() {
  return (
    <footer className="relative z-30 border-t border-white/5 bg-slate-950/80 px-6 py-8 text-sm text-brand-mist/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-brand-mist/60">Mirai Identity Fabric</p>
          <p className="mt-2 max-w-xl text-sm text-brand-mist/80">
            Founders, operators, and collaborators share the same surface here. Keep your credentials aligned while we keep the
            rails secure.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-brand-mist">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="rounded-lg border border-white/5 px-3 py-2 hover:border-white/30">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
