import { Link } from 'react-router-dom'
import { Users, FileText, CreditCard, Receipt, ArrowUpRight } from 'lucide-react'

const items = [
  { icon: Users, title: 'Payroll', desc: 'Pay your team on time, every time, in a few clicks.' },
  { icon: FileText, title: 'Invoices', desc: 'Create, send, and track invoices from one place.' },
  { icon: CreditCard, title: 'Team Cards', desc: 'Issue cards with spend limits for every team member.' },
  { icon: Receipt, title: 'Expense Management', desc: 'Automatic categorization, zero spreadsheet chasing.' },
]

export default function BusinessBanking() {
  return (
    <section id="business" className="py-24 md:py-30 bg-slate-50">
      <div className="container-content grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 rounded-card bg-white p-8 shadow-elevated">
          <p className="text-xs font-medium tracking-wide text-slate-500">TEAM SPENDING</p>
          <h4 className="font-display text-xl font-semibold text-navy-700 mt-2">
            October Overview
          </h4>

          <div className="mt-6 num text-3xl font-semibold text-navy-700">
            $42,180<span className="text-slate-400 text-xl">.00</span>
          </div>
          <p className="text-sm text-success font-medium mt-1">On track. 12% under budget</p>

          <div className="mt-7 space-y-3">
            {[
              { name: 'Engineering', pct: 62, color: 'bg-electric-500' },
              { name: 'Marketing', pct: 41, color: 'bg-navy-400' },
              { name: 'Operations', pct: 27, color: 'bg-slate-400' },
            ].map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-navy-700 font-medium">{d.name}</span>
                  <span className="num text-slate-500">{d.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="text-xs font-semibold tracking-wide text-electric-600 uppercase">
            Business Banking
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-navy-700 tracking-tight">
            Grow your business with confidence.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed max-w-md">
            From payroll to expense tracking, VAULTA gives founders and
            finance teams one dashboard for the entire company.
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-electric-50 flex items-center justify-center">
                  <Icon size={18} className="text-electric-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-700 text-sm">{title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/business"
            className="mt-9 inline-flex items-center gap-2 text-navy-600 font-semibold text-sm hover:gap-3 transition-all"
          >
            Open a business account <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
