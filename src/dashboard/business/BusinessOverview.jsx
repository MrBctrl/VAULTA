import { useEffect, useState } from 'react'
import { Landmark, TrendingUp, TrendingDown, FileText, ArrowUpRight, Send } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import StatCard from '../components/StatCard.jsx'
import TransactionRow from '../components/TransactionRow.jsx'
import { getBusiness, getBusinessAccounts, getBusinessTransactions, getInvoices } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'
import { useAuth } from '../../lib/AuthContext.jsx'

export default function BusinessOverview() {
  const { profile } = useAuth()
  const [business, setBusiness] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getBusiness(), getBusinessAccounts(), getBusinessTransactions({ limit: 5 }), getInvoices()])
      .then(([b, acc, tx, inv]) => {
        setBusiness(b)
        setAccounts(acc)
        setTransactions(tx)
        setInvoices(inv)
      })
      .finally(() => setLoading(false))
  }, [])

  const cashPosition = accounts.reduce((sum, a) => sum + a.balance, 0)
  const outstanding = invoices.filter((i) => i.status === 'Outstanding')
  const outstandingTotal = outstanding.reduce((sum, i) => sum + i.amount, 0)

  return (
    <BusinessLayout title="Overview" subtitle={business?.name ?? '…'}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-navy-700 tracking-tight">
            {profile?.first_name ? `Welcome back, ${profile.first_name}.` : 'Welcome back.'}
          </h2>
          <p className="text-slate-600 mt-1">Here's how {business?.name ?? 'your business'} is doing.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/business/invoices"
            className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-5 py-3 hover:bg-navy-700 transition-colors"
          >
            <FileText size={16} /> New Invoice
          </a>
          <a
            href="/business/transactions"
            className="inline-flex items-center gap-2 rounded-button border border-silver text-navy-700 text-sm font-semibold px-5 py-3 hover:bg-white transition-colors"
          >
            <Send size={16} /> View Activity
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        <StatCard label="CASH POSITION" value={loading ? '…' : formatCurrency(cashPosition, 'NGN')} icon={Landmark} dark />
        <StatCard label="REVENUE" value={loading ? '…' : formatCurrency(0, 'NGN')} sub="No paid invoices yet" icon={TrendingUp} />
        <StatCard label="EXPENSES" value={loading ? '…' : formatCurrency(0, 'NGN')} sub="Not tracked yet" icon={TrendingDown} />
        <StatCard
          label="OUTSTANDING INVOICES"
          value={loading ? '…' : formatCurrency(outstandingTotal, 'NGN')}
          sub={`${outstanding.length} unpaid`}
          icon={FileText}
        />
      </div>

      <div className="rounded-card bg-white border border-silver p-6 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-navy-700">Recent Activity</h3>
          <a href="/business/transactions" className="text-xs font-semibold text-electric-600 inline-flex items-center gap-1">
            View all <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="mt-2">
          {loading && <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>}
          {!loading && transactions.length === 0 && (
            <p className="text-sm text-slate-400 py-6 text-center">No activity yet.</p>
          )}
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </div>

      <div className="rounded-card bg-white border border-silver p-6 mt-6">
        <h3 className="font-display font-semibold text-navy-700">Outstanding Invoices</h3>
        <div className="mt-3 divide-y divide-silver">
          {outstanding.length === 0 && !loading && (
            <p className="text-sm text-slate-400 py-6 text-center">No outstanding invoices.</p>
          )}
          {outstanding.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-semibold text-navy-700">{inv.client}</p>
                <p className="text-xs text-slate-500">
                  Due {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <span className="num text-sm font-semibold text-warning">{formatCurrency(inv.amount, inv.currency)}</span>
            </div>
          ))}
        </div>
      </div>
    </BusinessLayout>
  )
}
