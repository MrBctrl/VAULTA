import { useEffect, useState } from 'react'
import { Wallet, X } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import AccountCard from '../components/AccountCard.jsx'
import TransactionRow from '../components/TransactionRow.jsx'
import { getBusinessAccounts, getBusinessTransactions, fundBusinessAccount } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

export default function BusinessAccounts() {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addMoneyOpen, setAddMoneyOpen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [acc, tx] = await Promise.all([getBusinessAccounts(), getBusinessTransactions()])
    setAccounts(acc)
    setTransactions(tx)
    setSelected((prev) => prev ?? (acc.length > 0 ? acc[0].id : null))
    setLoading(false)
  }

  const activeAccount = accounts.find((a) => a.id === selected)
  const relatedTx = activeAccount ? transactions.filter((t) => t.currency === activeAccount.currency) : []

  if (loading) {
    return (
      <BusinessLayout title="Accounts" subtitle="Business accounts across every currency">
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout title="Accounts" subtitle="Business accounts across every currency">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-navy-700">Business Accounts</h2>
        <button
          onClick={() => setAddMoneyOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors"
        >
          <Wallet size={16} /> Add Money
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {accounts.map((acc) => (
          <AccountCard key={acc.id} account={acc} selected={acc.id === selected} onClick={() => setSelected(acc.id)} />
        ))}
      </div>

      {activeAccount && (
        <div className="rounded-card bg-white border border-silver p-6 mt-8">
          <h3 className="font-display font-semibold text-navy-700">{activeAccount.label} Activity</h3>
          <div className="mt-2">
            {relatedTx.length > 0 ? (
              relatedTx.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center">No recent activity on this account.</p>
            )}
          </div>
        </div>
      )}

      {addMoneyOpen && (
        <AddMoneyModal accounts={accounts} defaultAccountId={selected} onClose={() => setAddMoneyOpen(false)} onFunded={load} />
      )}
    </BusinessLayout>
  )
}

function AddMoneyModal({ accounts, defaultAccountId, onClose, onFunded }) {
  const [accountId, setAccountId] = useState(defaultAccountId ?? accounts[0]?.id)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await fundBusinessAccount({ accountId, amount: Number(amount), description: 'Deposit' })
      await onFunded()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Deposit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Add Money</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">Simulated top-up. No real payment processor connected yet.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
              className="num mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-lg font-semibold text-navy-700 focus:outline-none focus:border-electric-500"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Money'}
          </button>
        </form>
      </div>
    </div>
  )
}
