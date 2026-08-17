import { Link } from 'react-router-dom'
import { Wallet, ArrowLeftRight, PiggyBank, BarChart3, ArrowUpRight } from 'lucide-react'

const items = [
  { icon: Wallet, title: 'Accounts', desc: 'Open a personal account in under five minutes.' },
  { icon: ArrowLeftRight, title: 'Transfers', desc: 'Send money instantly, locally or internationally.' },
  { icon: PiggyBank, title: 'Savings', desc: 'Set goals and watch your money grow automatically.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Understand your spending with clear, honest insights.' },
]

export default function PersonalBanking() {
  return (
    <section id="personal" className="py-24 md:py-30">
      <div className="container-content grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-semibold tracking-wide text-electric-600 uppercase">
            Personal Banking
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-navy-700 tracking-tight">
            Stay financially organized, effortlessly.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed max-w-md">
            Built for the everyday professional who wants their money to work
            quietly in the background — not demand constant attention.
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Icon size={18} className="text-navy-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-700 text-sm">{title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="mt-9 inline-flex items-center gap-2 text-navy-600 font-semibold text-sm hover:gap-3 transition-all"
          >
            Open a personal account <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="rounded-card bg-navy-600 p-8 shadow-elevated">
          <p className="text-navy-100/70 text-xs font-medium tracking-wide">SAVINGS GOAL</p>
          <h4 className="text-white font-display text-xl font-semibold mt-2">
            New Apartment Fund
          </h4>

          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span className="num text-white font-semibold">$8,240</span>
              <span className="num text-navy-100/60">of $12,000</span>
            </div>
            <div className="mt-2.5 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[68%] rounded-full bg-electric-500" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: 'This Month', value: '+$1,240' },
              { label: 'Est. Completion', value: 'Mar 2027' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/5 p-4">
                <p className="text-navy-100/60 text-[11px]">{s.label}</p>
                <p className="num text-white font-semibold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
