import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import TransactionRow from '../components/TransactionRow.jsx'
import { getTransactions } from '../../lib/api.js'

const categories = ['All', 'Income', 'Entertainment', 'Business', 'Transfer', 'Shopping', 'Transport', 'Bills']

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    getTransactions().then(setTransactions).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesQuery = tx.name.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'All' || tx.category === category
      return matchesQuery && matchesCategory
    })
  }, [query, category])

  return (
    <DashboardLayout title="Transactions" subtitle="Every transaction, across every account">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            className="w-full rounded-input border border-silver bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <SlidersHorizontal size={15} className="text-slate-400 shrink-0" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                category === c
                  ? 'bg-navy-600 text-white'
                  : 'bg-white border border-silver text-slate-600 hover:border-electric-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-white border border-silver p-6 mt-6">
        {loading ? (
          <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
        ) : filtered.length > 0 ? (
          filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        ) : (
          <p className="text-sm text-slate-500 py-10 text-center">No transactions match your search.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
