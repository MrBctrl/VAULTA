import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import BarChart from '../components/BarChart.jsx'
import LineChart from '../components/LineChart.jsx'
import { getBusinessTransactions, getBusinessAccounts } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

export default function BusinessAnalytics() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getBusinessTransactions(), getBusinessAccounts()])
      .then(([tx, acc]) => {
        setTransactions(tx)
        setAccounts(acc)
      })
      .finally(() => setLoading(false))
  }, [])

  const cashPosition = accounts.reduce((sum, a) => sum + a.balance, 0)

  const months = useMemo(() => {
    const now = new Date()
    const arr = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      arr.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }) })
    }
    return arr
  }, [])

  // Running cumulative net (credits - debits) per month, ending at today's real cash position.
  const cashFlowHistory = useMemo(() => {
    const netByMonth = Object.fromEntries(months.map((m) => [m.key, 0]))
    transactions.forEach((t) => {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key in netByMonth) netByMonth[key] += t.amount
    })
    // walk backwards from current cash position to build a cumulative series
    let running = cashPosition
    const reversed = [...months].reverse().map((m) => {
      const point = running
      running -= netByMonth[m.key]
      return point
    })
    return reversed.reverse().map((v) => v / 1_000_000) // in millions for the chart
  }, [transactions, months, cashPosition])

  const revenue = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <BusinessLayout title="Analytics" subtitle="Financial health, at a glance">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-card bg-white border border-silver p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-navy-700">Cash Flow Trend</h3>
            {revenue >= expenses ? (
              <span className="inline-flex items-center gap-1 text-success text-xs font-semibold">
                <TrendingUp size={13} /> Net positive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-error text-xs font-semibold">
                <TrendingDown size={13} /> Net negative
              </span>
            )}
          </div>
          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
            ) : (
              <LineChart data={cashFlowHistory} height={160} color="#2F6FED" />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
            {months.filter((_, i) => i % 2 === 0).map((m) => (
              <span key={m.key}>{m.label}</span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-card bg-navy-600 text-white p-6 sm:p-7">
          <h3 className="font-display font-semibold">Revenue vs. Expenses</h3>
          <p className="text-navy-100/60 text-xs mt-1">All-time, this account's history</p>
          <div className="mt-6">
            <BarChart
              data={[
                { label: 'Revenue', value: revenue / 1_000_000, color: '#2F6FED' },
                { label: 'Expenses', value: expenses / 1_000_000, color: '#64748B' },
              ]}
              height={140}
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white border border-silver p-6 mt-6">
        <h3 className="font-display font-semibold text-navy-700">Key Metrics</h3>
        <div className="grid sm:grid-cols-3 gap-6 mt-5">
          <div>
            <p className="text-xs text-slate-500">Net Cash Flow</p>
            <p className="num text-xl font-semibold text-navy-700 mt-1">
              {loading ? '…' : formatCurrency(revenue - expenses, 'NGN', { compact: true })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Revenue</p>
            <p className="num text-xl font-semibold text-navy-700 mt-1">
              {loading ? '…' : formatCurrency(revenue, 'NGN', { compact: true })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Current Cash Position</p>
            <p className="num text-xl font-semibold text-navy-700 mt-1">
              {loading ? '…' : formatCurrency(cashPosition, 'NGN', { compact: true })}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Gross margin, burn rate, and runway need expense categorization (payroll vs. operating
          costs) to be meaningful. Coming with the Payroll/Expenses build-out.
        </p>
      </div>
    </BusinessLayout>
  )
}
