import { TrendingUp, LineChart, Target } from 'lucide-react'

export default function Investments() {
  return (
    <section id="investments" className="py-24 md:py-30 bg-navy-600 text-white">
      <div className="container-content grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-semibold tracking-wide text-electric-500/80 uppercase">
            Investments
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Build wealth without the complexity.
          </h2>
          <p className="mt-4 text-navy-100/70 leading-relaxed max-w-md">
            Track your portfolio, set long-term goals, and invest with the
            same clarity you get from the rest of VAULTA.
          </p>

          <div className="mt-10 space-y-6">
            {[
              { icon: TrendingUp, title: 'Portfolio Tracking', desc: 'Real-time performance across every holding.' },
              { icon: Target, title: 'Goal-Based Investing', desc: 'Tie your investments to real milestones.' },
              { icon: LineChart, title: 'Clear Analytics', desc: 'Understand risk and return without the jargon.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon size={18} className="text-electric-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-sm text-navy-100/60 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card bg-white/[0.06] backdrop-blur border border-white/10 p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-navy-100/60 text-xs">PORTFOLIO VALUE</p>
              <p className="num text-3xl font-semibold mt-2">$128,450</p>
            </div>
            <span className="text-success text-sm font-semibold flex items-center gap-1">
              <TrendingUp size={14} /> +12.4%
            </span>
          </div>

          <svg viewBox="0 0 300 100" className="w-full h-24 mt-6" preserveAspectRatio="none">
            <polyline
              points="0,80 40,70 80,74 120,52 160,58 200,32 240,38 300,14"
              fill="none"
              stroke="#2F6FED"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mt-4 grid grid-cols-3 gap-4 pt-5 border-t border-white/10">
            {[
              { label: 'ETFs', value: '48%' },
              { label: 'Stocks', value: '34%' },
              { label: 'Bonds', value: '18%' },
            ].map((a) => (
              <div key={a.label}>
                <p className="num text-lg font-semibold">{a.value}</p>
                <p className="text-navy-100/50 text-xs mt-0.5">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
