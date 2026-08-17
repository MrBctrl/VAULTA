import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, Wallet, ArrowLeftRight, Send, CreditCard,
  PiggyBank, TrendingUp, BarChart3, ShieldCheck, Settings, Building2,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'

const personalNav = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/accounts', label: 'Accounts', icon: Wallet },
  { to: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/dashboard/transfers', label: 'Transfers', icon: Send },
  { to: '/dashboard/cards', label: 'Cards', icon: CreditCard },
  { to: '/dashboard/savings', label: 'Savings', icon: PiggyBank },
  { to: '/dashboard/investments', label: 'Investments', icon: TrendingUp },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/security', label: 'Security', icon: ShieldCheck },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <>
      {/* Tablet: icon-only rail (768–1023px) — its own considered layout,
          not a squeezed desktop sidebar */}
      <aside className="hidden md:flex lg:hidden flex-col items-center w-20 shrink-0 h-screen sticky top-0 bg-navy-700 px-3 py-6">
        <a href="/" className="mb-8">
          <Logo className="h-7 w-7" variant="white" />
        </a>
        <nav className="flex-1 flex flex-col items-center gap-2">
          {personalNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                `flex items-center justify-center h-11 w-11 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-navy-100/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={19} />
            </NavLink>
          ))}
        </nav>
        <a
          href="/business"
          title="Switch to Business"
          className="flex items-center justify-center h-11 w-11 rounded-xl text-navy-100/60 hover:bg-white/5 hover:text-white transition-colors border-t border-white/10 mt-2 pt-2"
        >
          <Building2 size={19} />
        </a>
      </aside>

      {/* Desktop: full sidebar with labels (1024px+) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-navy-700 text-navy-100/70 px-4 py-6">
        <a href="/" className="flex items-center gap-2.5 px-2">
          <Logo className="h-7 w-7" variant="white" />
          <span className="font-display font-semibold text-white tracking-tight">VAULTA</span>
        </a>

        <nav className="mt-10 flex-1 space-y-1">
          {personalNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-navy-100/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <a
          href="/business"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-100/60 hover:bg-white/5 hover:text-white transition-colors border-t border-white/10 mt-2 pt-4"
        >
          <Building2 size={18} />
          Switch to Business
        </a>
      </aside>
    </>
  )
}

export { personalNav }
