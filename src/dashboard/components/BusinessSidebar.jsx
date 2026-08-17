import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, Wallet, ArrowLeftRight, FileText, Receipt,
  Users, CreditCard, Banknote, BarChart3, Settings, UserCircle,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'

const businessNav = [
  { to: '/business', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/business/accounts', label: 'Accounts', icon: Wallet },
  { to: '/business/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/business/invoices', label: 'Invoices', icon: FileText },
  { to: '/business/expenses', label: 'Expenses', icon: Receipt },
  { to: '/business/team', label: 'Team', icon: Users },
  { to: '/business/cards', label: 'Cards', icon: CreditCard },
  { to: '/business/payroll', label: 'Payroll', icon: Banknote },
  { to: '/business/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/business/settings', label: 'Settings', icon: Settings },
]

export default function BusinessSidebar() {
  return (
    <>
      {/* Tablet: icon-only rail */}
      <aside className="hidden md:flex lg:hidden flex-col items-center w-20 shrink-0 h-screen sticky top-0 bg-navy-700 px-3 py-6">
        <a href="/" className="mb-8">
          <Logo className="h-7 w-7" variant="white" />
        </a>
        <nav className="flex-1 flex flex-col items-center gap-2">
          {businessNav.map(({ to, label, icon: Icon, end }) => (
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
          href="/dashboard"
          title="Switch to Personal"
          className="flex items-center justify-center h-11 w-11 rounded-xl text-navy-100/60 hover:bg-white/5 hover:text-white transition-colors border-t border-white/10 mt-2 pt-2"
        >
          <UserCircle size={19} />
        </a>
      </aside>

      {/* Desktop: full sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-navy-700 text-navy-100/70 px-4 py-6">
        <a href="/" className="flex items-center gap-2.5 px-2">
          <Logo className="h-7 w-7" variant="white" />
          <div className="leading-tight">
            <span className="font-display font-semibold text-white tracking-tight block">VAULTA</span>
            <span className="text-[10px] text-electric-500 font-semibold tracking-wide">BUSINESS</span>
          </div>
        </a>

        <nav className="mt-10 flex-1 space-y-1">
          {businessNav.map(({ to, label, icon: Icon, end }) => (
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
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-navy-100/60 hover:bg-white/5 hover:text-white transition-colors border-t border-white/10 mt-2 pt-4"
        >
          <UserCircle size={18} />
          Switch to Personal
        </a>
      </aside>
    </>
  )
}

export { businessNav }
