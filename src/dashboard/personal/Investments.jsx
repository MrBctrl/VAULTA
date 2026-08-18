import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Info, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import DonutChart from '../components/DonutChart.jsx'
import { getInstruments, getHoldings, buyInstrument, sellInstrument, getAccounts } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

const ALLOC_COLORS = ['#2F6FED', '#0B2545', '#10B981', '#F59E0B', '#64748B']

export default function Investments() {
  const [instruments, setInstruments] = useState([])
  const [holdings, setHoldings] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tradeInstrument, setTradeInstrument] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [inst, hold, acc] = await Promise.all([getInstruments(), getHoldings(), getAccounts()])
    setInstruments(inst)
    setHoldings(hold)
    setAccounts(acc)
    setLoading(false)
  }

  const portfolioValue = holdings.reduce((sum, h) => sum + h.quantity * h.price, 0)
  const costBasis = holdings.reduce((sum, h) => sum + h.quantity * h.avgCost, 0)
  const gainPct = costBasis > 0 ? (((portfolioValue - costBasis) / costBasis) * 100).toFixed(1) : 0

  const allocation = holdings.map((h, i) => ({
    label: h.name,
    pct: portfolioValue > 0 ? Math.round(((h.quantity * h.price) / portfolioValue) * 100) : 0,
    color: ALLOC_COLORS[i % ALLOC_COLORS.length],
  }))

  return (
    <DashboardLayout title="Investments" subtitle="Build wealth without the complexity">
      <div className="rounded-xl bg-electric-50 border border-electric-100 px-4 py-3 flex items-start gap-2.5 text-xs text-navy-700">
        <Info size={15} className="text-electric-600 mt-0.5 shrink-0" />
        <p>
          Instrument prices are static reference data for this portfolio project, not a live market
          feed — real orders still move real money between your account and your holdings.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mt-6">
        <div className="lg:col-span-3 rounded-card bg-navy-600 text-white p-6 sm:p-7">
          <p className="text-navy-100/60 text-xs">PORTFOLIO VALUE</p>
          <p className="num text-3xl font-semibold mt-2">
            {loading ? '…' : formatCurrency(portfolioValue, 'NGN')}
          </p>
          {costBasis > 0 && (
            <span
              className={`inline-flex items-center gap-1 text-sm font-semibold mt-1.5 ${
                gainPct >= 0 ? 'text-success' : 'text-error'
              }`}
            >
              {gainPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {gainPct >= 0 ? '+' : ''}{gainPct}% vs. cost basis
            </span>
          )}

          <div className="mt-7">
            <h3 className="font-display font-semibold text-sm">Available Instruments</h3>
            <div className="mt-3 divide-y divide-white/10">
              {instruments.map((inst) => (
                <div key={inst.symbol} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{inst.name}</p>
                    <p className="text-navy-100/50 text-xs">{inst.symbol} · {inst.currency}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="num text-sm">{formatCurrency(inst.price, inst.currency)}</span>
                    <button
                      onClick={() => setTradeInstrument(inst)}
                      className="rounded-full bg-white text-navy-700 text-xs font-semibold px-3 py-1.5 hover:bg-navy-50 transition-colors"
                    >
                      Trade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">Asset Allocation</h3>
          {holdings.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No holdings yet.</p>
          ) : (
            <>
              <div className="flex justify-center mt-4">
                <DonutChart data={allocation} />
              </div>
              <div className="mt-5 space-y-2.5">
                {allocation.map((a) => (
                  <div key={a.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-navy-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                      {a.label}
                    </span>
                    <span className="num font-semibold text-navy-700">{a.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-card bg-white border border-silver p-6">
        <h3 className="font-display font-semibold text-navy-700">Holdings</h3>
        {loading ? (
          <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
        ) : holdings.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">
            No holdings yet — trade an instrument above to get started.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-silver">
            {holdings.map((h) => {
              const value = h.quantity * h.price
              const cost = h.quantity * h.avgCost
              const changePct = cost > 0 ? (((value - cost) / cost) * 100).toFixed(1) : 0
              return (
                <div key={h.symbol} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-navy-700">{h.name}</p>
                    <p className="text-xs text-slate-500">{h.quantity} units · avg cost {formatCurrency(h.avgCost, h.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="num text-sm font-semibold text-navy-700">
                      {formatCurrency(value, h.currency, { compact: true })}
                    </p>
                    <p className={`text-xs font-medium ${changePct >= 0 ? 'text-success' : 'text-error'}`}>
                      {changePct >= 0 ? '+' : ''}{changePct}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {tradeInstrument && (
        <TradeModal
          instrument={tradeInstrument}
          accounts={accounts}
          holding={holdings.find((h) => h.symbol === tradeInstrument.symbol)}
          onClose={() => setTradeInstrument(null)}
          onDone={load}
        />
      )}
    </DashboardLayout>
  )
}

function TradeModal({ instrument, accounts, holding, onClose, onDone }) {
  const eligible = accounts.filter((a) => a.currency === instrument.currency)
  const [side, setSide] = useState('buy')
  const [accountId, setAccountId] = useState(eligible[0]?.id)
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const cost = (Number(quantity) || 0) * instrument.price

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      if (side === 'buy') {
        await buyInstrument({ accountId, symbol: instrument.symbol, quantity: Number(quantity) })
      } else {
        await sellInstrument({ accountId, symbol: instrument.symbol, quantity: Number(quantity) })
      }
      await onDone()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Trade failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">{instrument.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {formatCurrency(instrument.price, instrument.currency)} per unit
          {holding && ` · you own ${holding.quantity} units`}
        </p>

        {eligible.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">
            You need a {instrument.currency} account to trade this instrument.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                  side === 'buy' ? 'bg-navy-600 text-white' : 'bg-slate-50 text-navy-700'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                disabled={!holding}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
                  side === 'sell' ? 'bg-navy-600 text-white' : 'bg-slate-50 text-navy-700'
                }`}
              >
                Sell
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">ACCOUNT</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
              >
                {eligible.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} — {formatCurrency(a.balance, a.currency)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">QUANTITY</label>
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="num mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-lg font-semibold text-navy-700 focus:outline-none focus:border-electric-500"
              />
              {quantity && (
                <p className="text-xs text-slate-500 mt-1.5">
                  ≈ {formatCurrency(cost, instrument.currency)}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing…' : side === 'buy' ? 'Buy' : 'Sell'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
