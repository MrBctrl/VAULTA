import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import BarChart from '../components/BarChart.jsx'
import DonutChart from '../components/DonutChart.jsx'
import { getTransactions } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

const CATEGORY_COLORS = {
  Transfer: '#2F6FED',
  Deposit: '#10B981',
  Savings: '#0B2545',
  Income: '#10B981',
}
const FALLBACK_COLORS = ['#64748B', '#F59E0B', '#DC2626', '#94A3B8']

export default function Analytics() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTransactions().then(setTransactions).finally(() => setLoading(false))
  }, [])

  // Only outflows (debits) count as "spending" — deposits/incoming transfers aren't spend.
  const debits = useMemo(() => transactions.filter((t) => t.type === 'debit'), [transactions])

  const byCategory = useMemo(() => {
    const map = {}
    debits.forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + Math.abs(t.amount)
    })
    return Object.entries(map).map(([label, amount], i) => ({
      label,
      amount,
      color: CATEGORY_COLORS[label] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }))
  }, [debits])

  const totalSpend = byCategory.reduce((sum, c) => sum + c.amount, 0)

  const byMonth = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }) })
    }
    const totals = Object.fromEntries(months.map((m) => [m.key, 0]))
    debits.forEach((t) => {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key in totals) totals[key] += Math.abs(t.amount)
    })
    return months.map((m) => ({ label: m.label, value: totals[m.key] }))
  }, [debits])

  const thisMonth = byMonth[byMonth.length - 1]?.value ?? 0
  const lastMonth = byMonth[byMonth.length - 2]?.value ?? 0
  const changePct = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null

  return (
    <DashboardLayout title="Analytics" subtitle="Understand your spending, clearly">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-card bg-white border border-silver p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500">This Month's Spending</p>
              <p className="num text-2xl font-semibold text-navy-700 mt-1">
                {loading ? '…' : formatCurrency(thisMonth, 'NGN')}
              </p>
            </div>
            {changePct !== null && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${
                  changePct < 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}
              >
                {changePct < 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                {Math.abs(changePct)}% vs last month
              </span>
            )}
          </div>

          <div className="mt-7">
            <BarChart data={byMonth} height={160} />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">Spending by Category</h3>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No spending recorded yet.</p>
          ) : (
            <>
              <div className="flex justify-center mt-4">
                <DonutChart data={byCategory.map((c) => ({ ...c, pct: (c.amount / totalSpend) * 100 }))} />
              </div>
              <div className="mt-5 space-y-2.5">
                {byCategory.map((c) => (
                  <div key={c.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-navy-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </span>
                    <span className="num font-semibold text-navy-700">
                      {formatCurrency(c.amount, 'NGN', { compact: true })}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
