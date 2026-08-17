import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { getBusiness, createBusiness } from './api.js'

export default function BusinessGate({ children }) {
  const [business, setBusiness] = useState(undefined) // undefined = loading, null = none yet
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getBusiness().then(setBusiness)
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await createBusiness({ name })
      setBusiness(await getBusiness())
    } catch (err) {
      setError(err.message ?? 'Could not create business')
    } finally {
      setSubmitting(false)
    }
  }

  if (business === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">Loading…</div>
  }

  if (business === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-card bg-white border border-silver p-8">
          <div className="h-11 w-11 rounded-xl bg-electric-50 flex items-center justify-center">
            <Building2 size={19} className="text-electric-600" />
          </div>
          <h1 className="font-display text-xl font-semibold text-navy-700 mt-4">Set up your business</h1>
          <p className="text-sm text-slate-500 mt-1">
            One business account per VAULTA user, for now. This creates your business and a starter Naira account.
          </p>

          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">BUSINESS NAME</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create Business'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return children
}
