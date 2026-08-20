import { Fingerprint, Lock, Radar, Snowflake } from 'lucide-react'

const items = [
  { icon: Fingerprint, title: 'Biometric Login', desc: 'Face ID and fingerprint access, no passwords to remember.' },
  { icon: Lock, title: 'Encryption', desc: 'Bank-grade encryption on every transaction, always on.' },
  { icon: Radar, title: 'Fraud Monitoring', desc: 'Real-time alerts the moment something looks unusual.' },
  { icon: Snowflake, title: 'Instant Card Freeze', desc: 'Lock a lost or stolen card in a single tap.' },
]

export default function Security() {
  return (
    <section id="security" className="py-24 md:py-30">
      <div className="container-content">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-xs font-semibold tracking-wide text-electric-600 uppercase">
            Security
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-navy-700 tracking-tight">
            Trust without intimidation.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Every safeguard runs quietly in the background, so your money
            stays protected without your day feeling like a security briefing.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-card border border-silver p-6 text-center hover:border-electric-100 hover:shadow-surface transition-all"
            >
              <div className="h-12 w-12 mx-auto rounded-full bg-navy-50 flex items-center justify-center">
                <Icon size={20} className="text-navy-600" />
              </div>
              <h3 className="mt-4 font-semibold text-navy-700 text-sm">{title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
