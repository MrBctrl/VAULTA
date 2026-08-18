import { useEffect, useState } from 'react'
import { Banknote, Calendar, Send, X } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import { getBusiness, getBusinessAccounts, getTeamMembers, updateTeamMemberSalary, runPayroll, getPayrollRuns } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

export default function Payroll() {
  const [business, setBusiness] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [team, setTeam] = useState([])
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [runOpen, setRunOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [b, acc, t, r] = await Promise.all([getBusiness(), getBusinessAccounts(), getTeamMembers(), getPayrollRuns()])
    setBusiness(b)
    setAccounts(acc)
    setTeam(t)
    setRuns(r)
    setLoading(false)
  }

  const onPayroll = team.filter((m) => m.salary > 0)
  const totalPayroll = onPayroll.reduce((s, m) => s + m.salary, 0)

  async function saveSalary(memberId) {
    await updateTeamMemberSalary({ memberId, salary: Number(editValue) || 0 })
    setEditingId(null)
    await load()
  }

  return (
    <BusinessLayout title="Payroll" subtitle="Pay your team on time, every time">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="rounded-card bg-navy-600 text-white p-6">
          <div className="flex items-center gap-2 text-navy-100/70 text-xs">
            <Banknote size={14} /> NEXT PAYROLL RUN
          </div>
          <p className="num text-2xl font-semibold mt-2">{loading ? '…' : formatCurrency(totalPayroll, 'NGN')}</p>
          <button
            onClick={() => setRunOpen(true)}
            disabled={totalPayroll === 0}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white text-navy-700 text-xs font-semibold px-3.5 py-2 hover:bg-navy-50 transition-colors disabled:opacity-40"
          >
            <Send size={13} /> Run Payroll Now
          </button>
        </div>
        <div className="rounded-card bg-white border border-silver p-6 flex flex-col justify-center">
          <p className="text-xs text-slate-500">Team members on payroll</p>
          <p className="num text-2xl font-semibold text-navy-700 mt-1">{onPayroll.length}</p>
        </div>
      </div>

      <div className="rounded-card bg-white border border-silver p-6 mt-6">
        <h3 className="font-display font-semibold text-navy-700">Payroll Breakdown</h3>
        {loading ? (
          <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
        ) : team.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">No team members yet — add some on the Team page.</p>
        ) : (
          <>
            <div className="mt-4 divide-y divide-silver">
              {team.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-navy-600 text-white flex items-center justify-center text-xs font-display font-semibold">
                      {m.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-700">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.role}</p>
                    </div>
                  </div>
                  {editingId === m.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="num w-28 rounded-input border border-silver px-2 py-1.5 text-sm text-right focus:outline-none focus:border-electric-500"
                      />
                      <button onClick={() => saveSalary(m.id)} className="text-electric-600 text-xs font-semibold">
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(m.id)
                        setEditValue(m.salary || '')
                      }}
                      className="num text-sm font-semibold text-navy-700 hover:text-electric-600 transition-colors"
                    >
                      {formatCurrency(m.salary, 'NGN')}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-silver">
              <span className="text-sm font-semibold text-navy-700">Total</span>
              <span className="num text-base font-semibold text-navy-700">{formatCurrency(totalPayroll, 'NGN')}</span>
            </div>
          </>
        )}
      </div>

      {runs.length > 0 && (
        <div className="rounded-card bg-white border border-silver p-6 mt-6">
          <h3 className="font-display font-semibold text-navy-700">Past Runs</h3>
          <div className="mt-3 divide-y divide-silver">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-600 flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(r.runDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="num text-sm font-semibold text-navy-700">{formatCurrency(r.totalAmount, r.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {runOpen && business && (
        <RunPayrollModal
          business={business}
          accounts={accounts}
          totalPayroll={totalPayroll}
          onClose={() => setRunOpen(false)}
          onRun={load}
        />
      )}
    </BusinessLayout>
  )
}

function RunPayrollModal({ business, accounts, totalPayroll, onClose, onRun }) {
  const eligible = accounts.filter((a) => a.currency === 'NGN')
  const [accountId, setAccountId] = useState(eligible[0]?.id)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await runPayroll({ businessId: business.id, accountId })
      await onRun()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Payroll run failed')
    } finally {
      setSubmitting(false)
    }
  }

  const account = accounts.find((a) => a.id === accountId)

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Run Payroll</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">PAY FROM</label>
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

          <div className="rounded-xl bg-slate-50 p-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">Total to pay</span>
            <span className="num text-lg font-semibold text-navy-700">{formatCurrency(totalPayroll, 'NGN')}</span>
          </div>

          {account && account.balance < totalPayroll && (
            <p className="text-sm text-error">This account doesn't have enough balance for the full run.</p>
          )}
          {error && <p className="text-sm text-error">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={submitting || !accountId}
            className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Processing…' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  )
}
