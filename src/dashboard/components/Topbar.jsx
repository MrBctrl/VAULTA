import { Bell, Search, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext.jsx'

export default function Topbar({ title, subtitle }) {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '…'

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-silver">
      <div className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-18">
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-navy-700 text-base sm:text-lg truncate">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button className="hidden sm:flex h-10 w-10 rounded-full border border-silver items-center justify-center text-slate-500 hover:text-navy-600 hover:border-electric-100 transition-colors">
            <Search size={17} />
          </button>
          <button className="relative h-10 w-10 rounded-full border border-silver flex items-center justify-center text-slate-500 hover:text-navy-600 hover:border-electric-100 transition-colors">
            <Bell size={17} />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-error" />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-10 w-10 rounded-full bg-navy-600 text-white flex items-center justify-center font-display font-semibold text-sm"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-silver shadow-elevated py-1.5 z-40">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-error transition-colors"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
