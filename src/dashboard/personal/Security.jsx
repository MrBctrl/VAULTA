import { useState } from 'react'
import { ShieldCheck, Fingerprint, Smartphone, Bell, Lock, Laptop, KeyRound } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { loginActivity, securityScore } from '../../data/mockData.js'

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-navy-600' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

const initialToggles = {
  twoFactor: true,
  biometric: true,
  alerts: true,
  cardControls: false,
}

export default function Security() {
  const [toggles, setToggles] = useState(initialToggles)
  const toggle = (key) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <DashboardLayout title="Security" subtitle="Your account is protected">
      <div className="rounded-card bg-navy-600 text-white p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-navy-100/70 text-xs">
            <ShieldCheck size={14} /> SECURITY SCORE
          </div>
          <p className="font-display text-3xl font-semibold mt-2">{securityScore}%</p>
          <p className="text-navy-100/60 text-sm mt-1">Your account is protected.</p>
        </div>
        <div className="h-24 w-24 rounded-full border-4 border-white/10 relative flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#2F6FED" strokeWidth="8"
              strokeDasharray={`${securityScore * 2.76} 276`} strokeLinecap="round" />
          </svg>
          <ShieldCheck size={26} className="text-electric-500" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">Protection</h3>
          <div className="mt-5 space-y-5">
            {[
              { key: 'twoFactor', icon: KeyRound, title: 'Two-Factor Authentication', desc: 'Require a code in addition to your password.' },
              { key: 'biometric', icon: Fingerprint, title: 'Biometric Login', desc: 'Use Face ID or fingerprint to sign in.' },
              { key: 'alerts', icon: Bell, title: 'Transaction Alerts', desc: 'Get notified the moment something happens.' },
              { key: 'cardControls', icon: Lock, title: 'Merchant Card Controls', desc: 'Restrict cards to approved merchant types.' },
            ].map(({ key, icon: Icon, title, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-navy-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-700">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
                <Toggle enabled={toggles[key]} onChange={() => toggle(key)} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">Recent Login Activity</h3>
          <div className="mt-5 space-y-4">
            {loginActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between border-b border-silver last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center">
                    {a.device.includes('iPhone') ? <Smartphone size={16} className="text-navy-600" /> : <Laptop size={16} className="text-navy-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-700">{a.device}</p>
                    <p className="text-xs text-slate-500">{a.time}</p>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                    a.status === 'This device' ? 'bg-electric-50 text-electric-600' : 'bg-success/10 text-success'
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
