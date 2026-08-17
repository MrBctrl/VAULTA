import { useState } from 'react'
import { User, Bell, Globe, CreditCard, LogOut, Check } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import CurrencySelector from '../components/CurrencySelector.jsx'
import { useAuth } from '../../lib/AuthContext.jsx'
import { updateProfile } from '../../lib/api.js'

const sections = [
  { icon: Bell, title: 'Notifications', desc: 'Email, SMS, and push preferences (coming soon)' },
  { icon: Globe, title: 'Language & Region', desc: 'App language and regional format (coming soon)' },
  { icon: CreditCard, title: 'Payment Preferences', desc: 'Default account and card (coming soon)' },
]

export default function Settings() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [editingName, setEditingName] = useState(false)
  const [primary, setPrimary] = useState(profile?.primary_currency ?? 'NGN')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSaveName() {
    setSaving(true)
    try {
      await updateProfile({ fullName })
      await refreshProfile()
      setEditingName(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleCurrencyChange(code) {
    setPrimary(code)
    setSaved(false)
    try {
      await updateProfile({ primaryCurrency: code })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      /* keep local value even if save fails, user can retry */
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '…'

  return (
    <DashboardLayout title="Settings" subtitle="Manage your VAULTA profile and preferences">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-card bg-white border border-silver p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-navy-600 text-white flex items-center justify-center font-display font-semibold text-xl">
              {initials}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                <button onClick={() => setEditingName(true)} className="text-left">
                  <h2 className="font-display font-semibold text-navy-700 text-lg hover:text-electric-600 transition-colors">
                    {profile?.full_name ?? '…'}
                  </h2>
                </button>
              )}
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-7 divide-y divide-silver">
            <div className="flex items-center gap-4 py-4">
              <div className="h-10 w-10 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                <User size={17} className="text-navy-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-700">Profile</p>
                <p className="text-xs text-slate-500">Click your name above to edit it</p>
              </div>
            </div>
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

        <div className="rounded-card bg-white border border-silver p-6 sm:p-7 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-navy-700">Default Currency</h3>
            {saved && (
              <span className="inline-flex items-center gap-1 text-success text-xs font-semibold">
                <Check size={13} /> Saved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Used as your primary display currency across the dashboard.
          </p>
          <div className="mt-4">
            <CurrencySelector value={primary} onChange={handleCurrencyChange} label={null} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
