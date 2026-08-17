import { useEffect, useState } from 'react'
import { Wallet, PiggyBank, TrendingUp, Landmark, Send, Plus, ArrowUpRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import StatCard from '../components/StatCard.jsx'
import TransactionRow from '../components/TransactionRow.jsx'
import LineChart from '../components/LineChart.jsx'
import { formatCurrency } from '../../lib/currency.js'
import { getAccounts, getTransactions } from '../../lib/api.js'
import { useAuth } from '../../lib/AuthContext.jsx'
// Investments/savings/portfolio history are still mock — those tables
// arrive in a later phase. Accounts + transactions below are real.
import { overview, portfolioHistory } from '../../data/mockData.js'

export default function Overview() {
  const { profile } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAccounts(), getTransactions({ limit: 6 })])
      .then(([acc, tx]) => {
        setAccounts(acc)
        setTransactions(tx)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <DashboardLayout title="Overview" subtitle="Your financial command centre">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-navy-700 tracking-tight">
            {greeting}, {profile?.first_name ?? '…'}.
          </h2>
          <p className="text-slate-600 mt-1">Here's your financial overview.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/dashboard/transfers"
            className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-5 py-3 hover:bg-navy-700 transition-colors"
          >
            <Send size={16} /> Send Money
          </a>
          <a
            href="/dashboard/accounts"
            className="inline-flex items-center gap-2 rounded-button border border-silver text-navy-700 text-sm font-semibold px-5 py-3 hover:bg-white transition-colors"
          >
            <Plus size={16} /> Add Money
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        <StatCard
          label="TOTAL BALANCE"
          value={loading ? '…' : formatCurrency(totalBalance, 'NGN')}
          sub="Across all accounts"
          icon={Wallet}
          dark
        />
        <StatCard
          label="AVAILABLE TO SPEND"
          value={formatCurrency(overview.availableToSpendNGN, 'NGN')}
          sub="After pending transactions"
          icon={Landmark}
        />
        <StatCard
          label="INVESTMENTS"
          value={formatCurrency(overview.investmentsNGN, 'NGN')}
          trend={`+${overview.investmentsChangePct}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="SAVINGS"
          value={formatCurrency(overview.savingsNGN, 'NGN')}
          sub="3 active goals"
          icon={PiggyBank}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mt-8">
        <div className="lg:col-span-3 rounded-card bg-white border border-silver p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Recent Transactions</p>
              <h3 className="font-display font-semibold text-navy-700 mt-0.5">Last 7 days</h3>
            </div>
            <a
              href="/dashboard/transactions"
              className="text-xs font-semibold text-electric-600 inline-flex items-center gap-1"
            >
              View all <ArrowUpRight size={13} />
            </a>
          </div>
          <div className="mt-2">
            {loading && <p className="text-sm text-slate-400 py-4">Loading…</p>}
            {!loading && transactions.length === 0 && (
              <p className="text-sm text-slate-400 py-4">No transactions yet.</p>
            )}
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-card bg-navy-600 text-white p-6">
          <p className="text-navy-100/60 text-xs">PORTFOLIO GROWTH</p>
          <p className="num text-2xl font-semibold mt-1">
            {formatCurrency(overview.investmentsNGN, 'NGN', { compact: true })}
          </p>
          <p className="text-success text-xs font-semibold mt-1">
            +{overview.investmentsChangePct}% this year
          </p>
          <div className="mt-4">
            <LineChart data={portfolioHistory} color="#2F6FED" />
          </div>
          <a
            href="/dashboard/investments"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-electric-500"
          >
            View portfolio <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
