import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import DonutChart from '../components/DonutChart.jsx'
import { getBusiness, getBusinessAccounts, getExpenses, logExpense } from '../../lib/api.js'
import { formatCurrency, CURRENCIES } from '../../lib/currency.js'

const CATEGORY_COLORS = { Payroll: '#0B2545', Software: '#2F6FED', Contractors: '#64748B', Office: '#10B981', Marketing: '#F59E0B' }
const FALLBACK_COLORS = ['#94A3B8', '#DC2626']

export default function Expenses() {
  const [business, setBusiness] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [logOpen, setLogOpen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [b, acc, exp] = await Promise.all([getBusiness(), getBusinessAccounts(), getExpenses()])
    setBusiness(b)
    setAccounts(acc)
    setExpenses(exp)
    setLoading(false)
  }

  const now = new Date()
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const total = thisMonth.reduce((s, e) => s + e.amount, 0)

  const byCategory = useMemo(() => {
    const map = {}
    thisMonth.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount
    })
    return Object.entries(map).map(([label, amount], i) => ({
      label,
      amount,
      color: CATEGORY_COLORS[label] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }))
  }, [thisMonth])

  return (
    <BusinessLayout title="Expenses" subtitle="Where the business is spending">
      <div className="flex justify-end">
        <button
          onClick={() => setLogOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors"
        >
          <Plus size={16} /> Log Expense
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mt-4">
        <div className="lg:col-span-2 rounded-card bg-navy-600 text-white p-6 sm:p-7">
          <p className="text-navy-100/60 text-xs">TOTAL EXPENSES (MTD)</p>
          <p className="num text-2xl font-semibold mt-2">{loading ? '…' : formatCurrency(total, 'NGN')}</p>
          {byCategory.length > 0 && (
            <div className="flex justify-center mt-6">
              <DonutChart data={byCategory.map((c) => ({ ...c, pct: (c.amount / total) * 100 }))} />
            </div>
          )}
        </div>

        <div className="lg:col-span-3 rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">By Category</h3>
          {byCategory.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No expenses logged this month.</p>
          ) : (
            <div className="mt-4 divide-y divide-silver">
              {byCategory.map((c) => (
                <div key={c.label} className="flex items-center justify-between py-3.5">
                  <span className="flex items-center gap-2.5 text-sm text-navy-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </span>
                  <div className="text-right">
                    <span className="num text-sm font-semibold text-navy-700">
                      {formatCurrency(c.amount, 'NGN', { compact: true })}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">{((c.amount / total) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="rounded-card bg-white border border-silver p-6 mt-6">
          <h3 className="font-display font-semibold text-navy-700">Recent Expenses</h3>
          <div className="mt-3 divide-y divide-silver">
            {expenses.slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy-700">{e.vendor}</p>
                  <p className="text-xs text-slate-500">
                    {e.category} · {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="num text-sm font-semibold text-navy-700">
                  {formatCurrency(e.amount, e.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {logOpen && business && (
        <LogExpenseModal
          businessId={business.id}
          accounts={accounts}
          onClose={() => setLogOpen(false)}
          onLogged={load}
        />
      )}
    </BusinessLayout>
  )
}

function LogExpenseModal({ businessId, accounts, onClose, onLogged }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id)
  const [vendor, setVendor] = useState('')
  const [category, setCategory] = useState('Software')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await logExpense({ businessId, accountId, vendor, category, amount: Number(amount) })
      await onLogged()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Could not log expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Log Expense</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">This debits the selected business account for real.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">VENDOR</label>
            <input
              required
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
            >
              {['Software', 'Contractors', 'Office', 'Marketing', 'Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">ACCOUNT</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} · {formatCurrency(a.balance, a.currency)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">AMOUNT</label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="num mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Logging…' : 'Log Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
