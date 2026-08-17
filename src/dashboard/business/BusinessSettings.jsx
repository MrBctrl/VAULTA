import { useEffect, useState } from 'react'
import { Building2, Users, Bell, ShieldCheck, LogOut, Check } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import { getBusiness, updateBusinessName } from '../../lib/api.js'
import { useAuth } from '../../lib/AuthContext.jsx'

const sections = [
  { icon: Users, title: 'Team Permissions', desc: 'Roles and access control (coming soon)' },
  { icon: Bell, title: 'Notifications', desc: 'Invoice, payroll, and spend alerts (coming soon)' },
  { icon: ShieldCheck, title: 'Security', desc: 'Approval workflows and spend limits (coming soon)' },
]

export default function BusinessSettings() {
  const { signOut } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getBusiness().then((b) => {
      setBusiness(b)
      setName(b?.name ?? '')
      setLoading(false)
    })
  }, [])

  async function handleSaveName() {
    setSaving(true)
    try {
      await updateBusinessName({ businessId: business.id, name })
      setBusiness((prev) => ({ ...prev, name }))
      setEditingName(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <BusinessLayout title="Settings" subtitle="Manage your business profile">
        <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout title="Settings" subtitle="Manage your business profile">
      <div className="rounded-card bg-white border border-silver p-6 sm:p-7 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-navy-600 text-white flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-input border border-silver px-3 py-1.5 text-sm font-semibold text-navy-700 focus:outline-none focus:border-electric-500"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="text-electric-600 text-xs font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingName(true)} className="text-left flex items-center gap-2">
                <h2 className="font-display font-semibold text-navy-700 text-lg hover:text-electric-600 transition-colors">
                  {business?.name}
                </h2>
                {saved && (
                  <span className="inline-flex items-center gap-1 text-success text-xs font-semibold">
                    <Check size={13} /> Saved
                  </span>
                )}
              </button>
            )}
            <p className="text-sm text-slate-500 mt-0.5">Click the name above to edit it</p>
          </div>
        </div>

        <div className="mt-7 divide-y divide-silver">
          {sections.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 py-4 opacity-60">
              <div className="h-10 w-10 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-navy-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-700">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={signOut} className="mt-6 flex items-center gap-2 text-error text-sm font-semibold">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </BusinessLayout>
  )
}
