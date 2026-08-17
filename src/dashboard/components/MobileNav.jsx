import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MoreHorizontal, X } from 'lucide-react'

/**
 * Mobile bottom tab bar (< 768px). Shows the 4 most important destinations
 * plus a "More" trigger that opens a bottom-sheet drawer with the rest —
 * this is the dedicated mobile pattern called for in the brief, not a
 * squeezed version of the desktop sidebar.
 */
export default function MobileNav({ items, homeHref = '/' }) {
  const [open, setOpen] = useState(false)
  const primary = items.slice(0, 4)
  const overflow = items.slice(4)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-700 border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {primary.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium min-h-[56px] ${
                  isActive ? 'text-white' : 'text-navy-100/50'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium min-h-[56px] text-navy-100/50"
          >
            <MoreHorizontal size={20} />
            More
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] shadow-modal max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-navy-700">More</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500" aria-label="Close">
                <X size={22} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {overflow.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-silver py-4 text-xs font-medium text-navy-700"
                >
                  <Icon size={20} className="text-electric-600" />
                  {label}
                </NavLink>
              ))}
              <a
                href={homeHref === '/dashboard' ? '/business' : '/dashboard'}
                className="flex flex-col items-center gap-2 rounded-2xl border border-silver py-4 text-xs font-medium text-navy-700"
              >
                <MoreHorizontal size={20} className="text-electric-600" />
                {homeHref === '/dashboard' ? 'Business' : 'Personal'}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
