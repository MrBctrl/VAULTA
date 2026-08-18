import { useEffect, useState } from 'react'
import { Snowflake, Plus, X, Receipt } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import {
  getBusiness,
  getBusinessAccounts,
  getTeamMembers,
  getBusinessCards,
  issueBusinessCard,
  toggleBusinessCardFreeze,
  logCardCharge,
} from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

export default function BusinessCards() {
  const [business, setBusiness] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [team, setTeam] = useState([])
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [issueOpen, setIssueOpen] = useState(false)
  const [chargeCard, setChargeCard] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [b, acc, t, c] = await Promise.all([getBusiness(), getBusinessAccounts(), getTeamMembers(), getBusinessCards()])
    setBusiness(b)
    setAccounts(acc)
    setTeam(t)
    setCards(c)
    setLoading(false)
  }

  async function toggleFreeze(card) {
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, frozen: !c.frozen } : c)))
    try {
      await toggleBusinessCardFreeze({ cardId: card.id, frozen: !card.frozen })
    } catch {
      load()
    }
  }

  return (
    <BusinessLayout title="Cards" subtitle="Corporate and team cards">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-navy-700">Business Cards</h2>
        <button
          onClick={() => setIssueOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors"
        >
          <Plus size={16} /> Issue Card
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      ) : cards.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No business cards yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {cards.map((card) => {
            const limitPct = card.spendingLimit > 0 ? Math.min((card.balance / card.spendingLimit) * 100, 100) : 0
            return (
              <div key={card.id} className="rounded-card bg-white border border-silver p-5">
                <div
                  className={`aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-electric-500 to-navy-600 p-5 flex flex-col justify-between relative ${
                    card.frozen ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-white/70 text-[11px] font-semibold tracking-wide">VAULTA BUSINESS</span>
                    {card.frozen && (
                      <span className="rounded-full bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 flex items-center gap-1">
                        <Snowflake size={11} /> Frozen
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="num text-white text-base tracking-[0.2em]">•••• •••• •••• {card.last4}</p>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-white/60 text-[10px]">{card.holder}</p>
                      {card.teamMemberName && <p className="text-white/60 text-[10px]">{card.teamMemberName}</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-navy-700 text-sm">Business Card</h3>
                    <span className="num text-sm font-semibold text-navy-700">{formatCurrency(card.balance, card.currency)}</span>
                  </div>
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
                      className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                        card.frozen ? 'bg-navy-600 text-white' : 'bg-slate-50 text-navy-700 hover:bg-slate-100'
                      }`}
                    >
                      <Snowflake size={14} /> {card.frozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                    <button
                      onClick={() => setChargeCard(card)}
                      disabled={card.frozen}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 text-navy-700 py-2.5 text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                      <Receipt size={14} /> Log Charge
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {issueOpen && business && (
        <IssueCardModal
          businessId={business.id}
          accounts={accounts}
          team={team}
          onClose={() => setIssueOpen(false)}
          onIssued={load}
        />
      )}

      {chargeCard && (
        <ChargeModal card={chargeCard} onClose={() => setChargeCard(null)} onLogged={load} />
      )}
    </BusinessLayout>
  )
}

function IssueCardModal({ businessId, accounts, team, onClose, onIssued }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id)
  const [teamMemberId, setTeamMemberId] = useState('')
  const [holder, setHolder] = useState('')
  const [limit, setLimit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleMemberChange(id) {
    setTeamMemberId(id)
    const m = team.find((t) => t.id === id)
    if (m) setHolder(m.name)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await issueBusinessCard({
        businessId,
        accountId,
        teamMemberId: teamMemberId || null,
        holder,
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
          <h3 className="font-display text-lg font-semibold text-navy-700">Issue Business Card</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">ASSIGN TO</label>
            <select
              value={teamMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
            >
              <option value="">Company card (unassigned)</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">CARDHOLDER NAME</label>
            <input
              required
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">LINKED ACCOUNT</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.label} ({a.currency})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">SPENDING LIMIT</label>
            <input
              type="number"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
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

function ChargeModal({ card, onClose, onLogged }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await logCardCharge({ cardId: card.id, amount: Number(amount), description })
      await onLogged()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Could not log charge')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Log a Charge</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          For reconciling a receipt — this debits the linked account and attributes the spend to this card.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">DESCRIPTION</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Uber, AWS, client lunch"
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
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
            {submitting ? 'Logging…' : 'Log Charge'}
          </button>
        </form>
      </div>
    </div>
  )
}
