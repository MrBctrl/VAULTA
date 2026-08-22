import { useEffect, useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import { getBusiness, getInvoices, createInvoice, markInvoicePaid } from '../../lib/api.js'
import { formatCurrency, CURRENCIES } from '../../lib/currency.js'

export default function Invoices() {
  const [business, setBusiness] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [newOpen, setNewOpen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [b, inv] = await Promise.all([getBusiness(), getInvoices()])
    setBusiness(b)
    setInvoices(inv)
    setLoading(false)
  }

  async function handleMarkPaid(id) {
    try {
      await markInvoicePaid({ invoiceId: id })
      await load()
    } catch (err) {
      alert(err.message ?? 'Could not mark invoice paid')
    }
  }

  const totals = {
    paid: invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
    outstanding: invoices.filter((i) => i.status === 'Outstanding').reduce((s, i) => s + i.amount, 0),
  }

  return (
    <BusinessLayout title="Invoices" subtitle="Create, send, and track client invoices">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-slate-500">Paid</p>
            <p className="num text-lg font-semibold text-success">{formatCurrency(totals.paid, 'NGN', { compact: true })}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className="num text-lg font-semibold text-warning">{formatCurrency(totals.outstanding, 'NGN', { compact: true })}</p>
          </div>
        </div>
        <button
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors"
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No invoices yet.</p>
      ) : (
        <>
          <div className="hidden md:block rounded-card bg-white border border-silver mt-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-silver">
                  <th className="font-medium px-6 py-3.5">Client</th>
                  <th className="font-medium px-6 py-3.5">Date</th>
                  <th className="font-medium px-6 py-3.5">Status</th>
                  <th className="font-medium px-6 py-3.5 text-right">Amount</th>
                  <th className="font-medium px-6 py-3.5 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-silver last:border-0 hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-600">{inv.client}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                          inv.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right num font-semibold text-navy-700">
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-electric-600 hover:text-electric-700"
                        >
                          <Check size={13} /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3 mt-6">
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-card bg-white border border-silver p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-700">{inv.client}</span>
                  <span
                    className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                      inv.status === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500">
                    {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="num text-sm font-semibold text-navy-700">{formatCurrency(inv.amount, inv.currency)}</span>
                </div>
                {inv.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkPaid(inv.id)}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-electric-600 border border-silver rounded-lg py-2"
                  >
                    <Check size={13} /> Mark Paid
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {newOpen && business && (
        <NewInvoiceModal businessId={business.id} onClose={() => setNewOpen(false)} onCreated={load} />
      )}
    </BusinessLayout>
  )
}

function NewInvoiceModal({ businessId, onClose, onCreated }) {
  const [client, setClient] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await createInvoice({ businessId, client, amount: Number(amount), currency })
      await onCreated()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Could not create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">New Invoice</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">CLIENT</label>
            <input
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
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
            {submitting ? 'Creating…' : 'Create Invoice'}
          </button>
        </form>
      </div>
    </div>
  )
}
