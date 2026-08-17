import { useEffect, useState } from 'react'
import { Snowflake, Eye, EyeOff, SlidersHorizontal, Plus, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { getCards, issueCard, toggleCardFreeze, updateCardLimit, getAccounts } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

const variantStyles = {
  physical: 'from-navy-600 to-navy-700',
  virtual: 'from-slate-500 to-slate-700',
  business: 'from-electric-500 to-navy-600',
}

export default function Cards() {
  const [cards, setCards] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [limitCard, setLimitCard] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [c, acc] = await Promise.all([getCards(), getAccounts()])
    setCards(c)
    setAccounts(acc)
    setLoading(false)
  }

  async function toggleFreeze(card) {
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, frozen: !c.frozen } : c)))
    try {
      await toggleCardFreeze({ cardId: card.id, frozen: !card.frozen })
    } catch {
      load() // revert to real state on failure
    }
  }

  return (
    <DashboardLayout title="Cards" subtitle="Manage every VAULTA card in one place">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-navy-700">Your Cards</h2>
        <button
          onClick={() => setRequestOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors"
        >
          <Plus size={16} /> Request Card
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      ) : cards.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No cards yet — request one to get started.</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {cards.map((card) => {
            const limitPct = card.spendingLimit > 0 ? Math.min((card.balance / card.spendingLimit) * 100, 100) : 0
            return (
              <div key={card.id} className="rounded-card bg-white border border-silver p-5">
                <div
                  className={`aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${variantStyles[card.variant] ?? variantStyles.physical} p-5 flex flex-col justify-between relative ${
                    card.frozen ? 'opacity-50' : ''
                  }`}
                >
                  {card.frozen && (
                    <span className="absolute top-4 right-4 rounded-full bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 flex items-center gap-1">
                      <Snowflake size={11} /> Frozen
                    </span>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-white/70 text-[11px] font-semibold tracking-wide">VAULTA</span>
                    {!card.frozen && (
                      <span className="rounded-full bg-white/15 text-white text-[10px] font-semibold px-2.5 py-1">
                        {card.currency}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="num text-white text-base tracking-[0.2em]">
                      {revealed === card.id ? `•••• •••• •••• ${card.last4}` : `•••• •••• •••• ${card.last4}`}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-white/60 text-[10px]">{card.holder}</p>
                      <p className="text-white/60 text-[10px]">{card.expiry}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-navy-700 text-sm">{card.type}</h3>
                    <span className="num text-sm font-semibold text-navy-700">
                      {formatCurrency(card.balance, card.currency)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Reflects the linked account's live balance</p>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Spending limit</span>
                      <span className="num">{formatCurrency(card.spendingLimit, card.currency)}</span>
                    </div>
                    <ProgressBar pct={limitPct} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleFreeze(card)}
                      className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium transition-colors ${
                        card.frozen ? 'bg-navy-600 text-white' : 'bg-slate-50 text-navy-700 hover:bg-slate-100'
                      }`}
                    >
                      <Snowflake size={15} />
                      {card.frozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                    <button
                      onClick={() => setLimitCard(card)}
                      className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 text-navy-700 py-2.5 text-[11px] font-medium hover:bg-slate-100 transition-colors"
                    >
                      <SlidersHorizontal size={15} />
                      Limits
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {requestOpen && (
        <RequestCardModal accounts={accounts} onClose={() => setRequestOpen(false)} onIssued={load} />
      )}

      {limitCard && (
        <LimitModal card={limitCard} onClose={() => setLimitCard(null)} onSaved={load} />
      )}
    </DashboardLayout>
  )
}

function RequestCardModal({ accounts, onClose, onIssued }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id)
  const [variant, setVariant] = useState('virtual')
  const [limit, setLimit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await issueCard({
        accountId,
        type: variant === 'virtual' ? 'Virtual Card' : 'Personal Card',
        variant,
        spendingLimit: Number(limit) || 0,
      })
      await onIssued()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Could not issue card')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Request a Card</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">LINKED ACCOUNT</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} ({a.currency})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">CARD TYPE</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
            >
              <option value="virtual">Virtual Card</option>
              <option value="physical">Physical Card</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">SPENDING LIMIT</label>
            <input
              type="number"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0.00"
              className="num mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Issuing…' : 'Issue Card'}
          </button>
        </form>
      </div>
    </div>
  )
}

function LimitModal({ card, onClose, onSaved }) {
  const [limit, setLimit] = useState(card.spendingLimit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await updateCardLimit({ cardId: card.id, spendingLimit: Number(limit) })
      await onSaved()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Could not update limit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Spending Limit</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">{card.type} ({card.currency})</label>
            <input
              type="number"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="num mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-lg font-semibold text-navy-700 focus:outline-none focus:border-electric-500"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Save Limit'}
          </button>
        </form>
      </div>
    </div>
  )
}
