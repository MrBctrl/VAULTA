import { useEffect, useState } from 'react'
import { ShieldCheck, Fingerprint, Smartphone, Bell, Lock, Laptop, KeyRound, Info } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { getLoginActivity } from '../../lib/api.js'
import { useAuth } from '../../lib/AuthContext.jsx'

function Toggle({ enabled }) {
  return (
    <div className={`relative h-6 w-11 rounded-full opacity-50 cursor-not-allowed ${enabled ? 'bg-navy-600' : 'bg-slate-200'}`}>
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </div>
  )
}

export default function Security() {
  const { user } = useAuth()
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLoginActivity().then(setActivity).finally(() => setLoading(false))
  }, [])

  const emailConfirmed = !!user?.email_confirmed_at
  // A simple heuristic from real signals — email verification and having
  // login history on record — not a real fraud/risk engine.
  const securityScore = 50 + (emailConfirmed ? 25 : 0) + (activity.length > 0 ? 25 : 0)

  return (
    <DashboardLayout title="Security" subtitle="Your account is protected">
      <div className="rounded-card bg-navy-600 text-white p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-navy-100/70 text-xs">
            <ShieldCheck size={14} /> SECURITY SCORE
          </div>
          <p className="font-display text-3xl font-semibold mt-2">{securityScore}%</p>
          <p className="text-navy-100/60 text-sm mt-1">
            {emailConfirmed ? 'Email verified.' : 'Verify your email to improve this.'}
          </p>
        </div>
        <div className="h-24 w-24 rounded-full border-4 border-white/10 relative flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#2F6FED" strokeWidth="8"
              strokeDasharray={`${securityScore * 2.76} 276`} strokeLinecap="round" />
          </svg>
          <ShieldCheck size={26} className="text-electric-500" />
        </div>
      </div>

      <div className="rounded-xl bg-electric-50 border border-electric-100 px-4 py-3 flex items-start gap-2.5 text-xs text-navy-700 mt-6">
        <Info size={15} className="text-electric-600 mt-0.5 shrink-0" />
        <p>
          Protection toggles below aren't wired to real 2FA/biometric infrastructure yet. Shown for
          the interface design, not functional. Login Activity on the right is real.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">Protection</h3>
          <div className="mt-5 space-y-5">
            {[
              { icon: KeyRound, title: 'Two-Factor Authentication', desc: 'Require a code in addition to your password.', enabled: false },
              { icon: Fingerprint, title: 'Biometric Login', desc: 'Use Face ID or fingerprint to sign in.', enabled: false },
              { icon: Bell, title: 'Transaction Alerts', desc: 'Get notified the moment something happens.', enabled: false },
              { icon: Lock, title: 'Merchant Card Controls', desc: 'Restrict cards to approved merchant types.', enabled: false },
            ].map(({ icon: Icon, title, desc, enabled }) => (
              <div key={title} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-navy-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-700">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
                <Toggle enabled={enabled} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">Recent Login Activity</h3>
          <div className="mt-5 space-y-4">
            {loading && <p className="text-sm text-slate-400 text-center py-6">Loading…</p>}
            {!loading && activity.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No login activity recorded yet.</p>
            )}
            {activity.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between border-b border-silver last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center">
                    {a.deviceLabel.includes('iOS') || a.deviceLabel.includes('Android') ? (
                      <Smartphone size={16} className="text-navy-600" />
                    ) : (
                      <Laptop size={16} className="text-navy-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-700">{a.deviceLabel}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(a.occurredAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {i === 0 && (
                  <span className="text-[11px] font-semibold rounded-full px-2.5 py-1 bg-electric-50 text-electric-600">
                    This device
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
