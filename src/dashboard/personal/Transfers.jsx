import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Check, Send, History } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { getAccounts, getTransactions, transferFunds } from '../../lib/api.js'
import { formatCurrency, CURRENCIES } from '../../lib/currency.js'

export default function Transfers() {
  const [accounts, setAccounts] = useState([])
  const [transferHistory, setTransferHistory] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [step, setStep] = useState(1) // 1 = form, 2 = review, 3 = success
  const [fromId, setFromId] = useState(null)
  const [toAccountNumber, setToAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Ref guard: blocks a second submit instantly, synchronously — doesn't
  // wait for a React re-render the way relying on `submitting` state alone
  // would. This is what stops rapid double/triple-clicks from firing the
  // transfer more than once.
  const submitLock = useRef(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoadingData(true)
    const [acc, tx] = await Promise.all([getAccounts(), getTransactions()])
    setAccounts(acc)
    setTransferHistory(tx.filter((t) => t.category === 'Transfer'))
    if (acc.length > 0) setFromId(acc[0].id)
    setLoadingData(false)
  }

  const fromAccount = accounts.find((a) => a.id === fromId)
  const currency = fromAccount ? CURRENCIES[fromAccount.currency] : null

  const canContinue =
    fromAccount &&
    toAccountNumber.trim().length > 0 &&
    amount &&
    Number(amount) > 0 &&
    Number(amount) <= fromAccount.balance

  async function handleConfirm() {
    if (submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    setError('')
    try {
      await transferFunds({
        fromAccountId: fromAccount.id,
        toAccountNumber: toAccountNumber.trim(),
        amount: Number(amount),
        description,
      })
      await loadData()
      setStep(3)
    } catch (err) {
      setError(err.message ?? 'Transfer failed')
      setStep(1)
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  if (loadingData) {
    return (
      <DashboardLayout title="Transfers" subtitle="Send money locally or internationally">
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Transfers" subtitle="Send money to another VAULTA account">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-card bg-white border border-silver p-6 sm:p-8">
          {step === 1 && (
            <>
              <h2 className="font-display text-xl font-semibold text-navy-700">Send Money</h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500">FROM</label>
                  <select
                    value={fromId ?? ''}
                    onChange={(e) => setFromId(e.target.value)}
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
                  <label className="text-xs font-semibold text-slate-500">TO: VAULTA ACCOUNT NUMBER</label>
                  <input
                    value={toAccountNumber}
                    onChange={(e) => setToAccountNumber(e.target.value)}
                    placeholder="e.g. 220155903312"
                    className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm font-medium text-navy-700 focus:outline-none focus:border-electric-500"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    Phase 1 supports transfers between VAULTA accounts only. External bank
                    rails come in a later phase.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">AMOUNT</label>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-700 font-semibold">
                      {currency?.symbol}
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="num w-full rounded-input border border-silver pl-10 pr-4 py-3 text-lg font-semibold text-navy-700 focus:outline-none focus:border-electric-500"
                    />
                  </div>
                  {fromAccount && (
                    <p className="text-xs text-slate-500 mt-1.5">
                      Available: {formatCurrency(fromAccount.balance, fromAccount.currency)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">DESCRIPTION</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this for?"
                    className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
                  />
                </div>

                {error && <p className="text-sm text-error">{error}</p>}

                <button
                  disabled={!canContinue}
                  onClick={() => setStep(2)}
                  className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 flex items-center justify-center gap-2 hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-xl font-semibold text-navy-700">Review Transfer</h2>
              <div className="mt-6 rounded-xl bg-slate-50 p-5 space-y-4">
                <Row label="From" value={fromAccount.label} />
                <Row label="To account" value={toAccountNumber} />
                <Row label="Amount" value={formatCurrency(Number(amount), fromAccount.currency)} strong />
                <Row label="Fee" value={formatCurrency(0, fromAccount.currency)} />
                <Row label="Description" value={description || '—'} />
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="flex-1 rounded-button border border-silver text-navy-700 font-semibold py-3.5 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Confirm & Send'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <Check size={28} className="text-success" />
              </div>
              <h2 className="font-display text-xl font-semibold text-navy-700 mt-5">Transfer Sent</h2>
              <p className="text-slate-600 mt-2">
                {formatCurrency(Number(amount), fromAccount.currency)} sent to account {toAccountNumber}.
              </p>
              <button
                onClick={() => {
                  setStep(1)
                  setAmount('')
                  setDescription('')
                  setToAccountNumber('')
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-button bg-navy-600 text-white font-semibold px-6 py-3 hover:bg-navy-700 transition-colors"
              >
                <Send size={16} /> Send Another
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-card bg-white border border-silver p-6">
          <div className="flex items-center gap-2 text-navy-700">
            <History size={16} />
            <h3 className="font-display font-semibold">Recent Transfers</h3>
          </div>
          <div className="mt-4 space-y-4">
            {transferHistory.length === 0 && (
              <p className="text-sm text-slate-400">No transfers yet.</p>
            )}
            {transferHistory.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b border-silver last:border-0 pb-3.5 last:pb-0">
                <div>
                  <p className="font-medium text-navy-700">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="num font-semibold text-navy-700">
                  {formatCurrency(Math.abs(t.amount), t.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm ${strong ? 'num text-lg font-semibold text-navy-700' : 'font-medium text-navy-700'}`}>
        {value}
      </span>
    </div>
  )
}
