import { useEffect, useState } from 'react'
import { UserPlus, CreditCard, X } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import { getBusiness, getTeamMembers, addTeamMember, toggleTeamMemberCard, getTeamSpendThisMonth } from '../../lib/api.js'
import { formatCurrency } from '../../lib/currency.js'

export default function Team() {
  const [business, setBusiness] = useState(null)
  const [team, setTeam] = useState([])
  const [spend, setSpend] = useState({})
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [b, t, s] = await Promise.all([getBusiness(), getTeamMembers(), getTeamSpendThisMonth()])
    setBusiness(b)
    setTeam(t)
    setSpend(s)
    setLoading(false)
  }

  async function handleToggleCard(member) {
    setTeam((prev) => prev.map((m) => (m.id === member.id ? { ...m, cardActive: !m.cardActive } : m)))
    try {
      await toggleTeamMemberCard({ memberId: member.id, cardActive: !member.cardActive })
    } catch {
      load()
    }
  }

  return (
    <BusinessLayout title="Team" subtitle="Manage your team's access and spending">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-navy-700">Team Members</h2>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors"
        >
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      ) : team.length === 0 ? (
        <p className="text-sm text-slate-400 py-10 text-center">No team members yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
          {team.map((member) => (
            <div key={member.id} className="rounded-card bg-white border border-silver p-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-navy-600 text-white flex items-center justify-center font-display font-semibold">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-700">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">This month</p>
                  <p className="num text-sm font-semibold text-navy-700">
                    {formatCurrency(spend[member.id] ?? 0, 'NGN', { compact: true })}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleCard(member)}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 transition-colors ${
                    member.cardActive ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <CreditCard size={11} /> {member.cardActive ? 'Card Active' : 'No Card'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {inviteOpen && business && (
        <AddMemberModal businessId={business.id} onClose={() => setInviteOpen(false)} onAdded={load} />
      )}
    </BusinessLayout>
  )
}

function AddMemberModal({ businessId, onClose, onAdded }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await addTeamMember({ businessId, name, role })
      await onAdded()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Could not add team member')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-navy-700">Add Team Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">NAME</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">ROLE</label>
            <input
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add Member'}
          </button>
        </form>
      </div>
    </div>
  )
}
