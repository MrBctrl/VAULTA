import { TrendingUp } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import LineChart from '../components/LineChart.jsx'
import DonutChart from '../components/DonutChart.jsx'
import { overview, portfolioHistory, investmentAllocation } from '../../data/mockData.js'
import { formatCurrency } from '../../lib/currency.js'

const periods = ['1W', '1M', '3M', '1Y', 'All']

export default function Investments() {
  return (
    <DashboardLayout title="Investments" subtitle="Build wealth without the complexity">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-card bg-navy-600 text-white p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-navy-100/60 text-xs">PORTFOLIO VALUE</p>
              <p className="num text-3xl font-semibold mt-2">
                {formatCurrency(overview.investmentsNGN, 'NGN')}
              </p>
              <span className="inline-flex items-center gap-1 text-success text-sm font-semibold mt-1.5">
                <TrendingUp size={14} /> +{overview.investmentsChangePct}% all time
              </span>
            </div>
            <div className="flex gap-1.5">
              {periods.map((p, i) => (
                <button
                  key={p}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    i === 3 ? 'bg-white text-navy-700' : 'bg-white/10 text-navy-100/70 hover:bg-white/15'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <LineChart data={portfolioHistory} height={180} color="#2F6FED" />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">Asset Allocation</h3>
          <div className="flex justify-center mt-4">
            <DonutChart data={investmentAllocation} />
          </div>
          <div className="mt-5 space-y-2.5">
            {investmentAllocation.map((a) => (
              <div key={a.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-navy-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  {a.label}
                </span>
                <span className="num font-semibold text-navy-700">{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-card bg-white border border-silver p-6">
        <h3 className="font-display font-semibold text-navy-700">Holdings</h3>
        <div className="mt-4 divide-y divide-silver">
          {[
            { name: 'Global Equity ETF', category: 'ETFs', value: 42400000, change: '+8.2%' },
            { name: 'VAULTA Bond Fund', category: 'Bonds', value: 28200000, change: '+3.1%' },
            { name: 'Nigerian Growth Fund', category: 'Funds', value: 14100000, change: '+15.6%' },
            { name: 'US Tech Basket', category: 'Equities', value: 48700000, change: '+11.4%' },
          ].map((h) => (
            <div key={h.name} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-semibold text-navy-700">{h.name}</p>
                <p className="text-xs text-slate-500">{h.category}</p>
              </div>
              <div className="text-right">
                <p className="num text-sm font-semibold text-navy-700">
                  {formatCurrency(h.value, 'NGN', { compact: true })}
                </p>
                <p className="text-xs text-success font-medium">{h.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
