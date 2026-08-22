import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo.jsx'

const links = [
  { label: 'Personal', href: '#personal' },
  { label: 'Business', href: '#business' },
  { label: 'Cards', href: '#cards' },
  { label: 'Investments', href: '#investments' },
  { label: 'Security', href: '#security' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-surface' : 'bg-transparent'
      }`}
    >
      <nav className="container-content flex items-center justify-between h-18">
        <a href="#top" className="flex items-center gap-0">
          <Logo className="h-16 w-15" />
          <span className="font-display font-semibold text-lg tracking-tight text-navy-600">
            VAULTA
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-navy-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#support"
            className="text-sm font-medium text-slate-600 hover:text-navy-600 transition-colors"
          >
            Support
          </a>
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-navy-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/open-account"
            className="rounded-button bg-navy-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-navy-700 transition-colors"
          >
            Open Account
          </Link>
        </div>

        <button
          className="lg:hidden text-navy-600"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-white border-t border-silver px-6 py-4 flex flex-col gap-4 shadow-elevated">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-600"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-slate-600"
          >
            Sign In
          </Link>
          <Link
            to="/open-account"
            onClick={() => setOpen(false)}
            className="rounded-button bg-navy-600 text-white text-sm font-semibold px-5 py-3 text-center"
          >
            Open Account
          </Link>
        </div>
      )}
    </header>
  )
}
