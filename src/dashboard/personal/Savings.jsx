import { useEffect, useState } from 'react'
import { Plus, Target, Wallet, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import {
  getSavingsGoals,
  createSavingsGoal,
  contributeToSavings,
  getAccounts,
} from '../../lib/api.js'
import { formatCurrency, CURRENCIES } from '../../lib/currency.js'

export default function Savings() {
  const [goals, setGoals] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGoalOpen, setNewGoalOpen] = useState(false)
  const [addMoneyGoal, setAddMoneyGoal] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [g, acc] = await Promise.all([getSavingsGoals(), getAccounts()])
    setGoals(g)
    setAccounts(acc)
    setLoading(false)
  }

  return (
    <DashboardLayout title="Savings" subtitle="Goals you're building toward">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-navy-700">Your Goals</h2>
        <button
          onClick={() => setNewGoalOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors"
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      ) : goals.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">
          No savings goals yet. Create one to get started.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {goals.map((goal) => {
            const pct = Math.min((goal.saved / goal.target) * 100, 100)
            return (
              <div key={goal.id} className="rounded-card bg-white border border-silver p-6">
                <div className="h-11 w-11 rounded-xl bg-electric-50 flex items-center justify-center">
                  <Target size={19} className="text-electric-600" />
                </div>
                <h3 className="font-display font-semibold text-navy-700 mt-4">{goal.name}</h3>

                <div className="mt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="num text-lg font-semibold text-navy-700">
                      {formatCurrency(goal.saved, goal.currency, { compact: true })}
                    </span>
                    <span className="num text-xs text-slate-500">
                      of {formatCurrency(goal.target, goal.currency, { compact: true })}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={pct} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{pct.toFixed(1)}% complete</p>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => setAddMoneyGoal(goal)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-navy-600 text-white py-2.5 text-xs font-semibold hover:bg-navy-700 transition-colors"
                  >
                    <Wallet size={14} /> Add Money
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {newGoalOpen && (
        <NewGoalModal onClose={() => setNewGoalOpen(false)} onCreated={load} />
      )}

      {addMoneyGoal && (
        <ContributeModal
          goal={addMoneyGoal}
          accounts={accounts}
          onClose={() => setAddMoneyGoal(null)}
          onDone={load}
        />
      )}
    </DashboardLayout>
  )
}

function NewGoalModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await createSavingsGoal({ name, target: Number(target), currency })
      await onCreated()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Could not create goal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">New Savings Goal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">GOAL NAME</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund"
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">TARGET AMOUNT</label>
            <input
              type="number"
              required
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="num mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">CURRENCY</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ContributeModal({ goal, accounts, onClose, onDone }) {
  const eligible = accounts.filter((a) => a.currency === goal.currency)
  const [accountId, setAccountId] = useState(eligible[0]?.id)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await contributeToSavings({ goalId: goal.id, accountId, amount: Number(amount) })
      await onDone()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Contribution failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Add to {goal.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        {eligible.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">
            You need a {goal.currency} account to contribute to this goal.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">FROM ACCOUNT</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
              >
                {eligible.map((a) => (
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
              {submitting ? 'Adding…' : 'Add to Goal'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
