import { Bolt, ShieldCheck, Sparkles, Globe2, Eye, UserCheck } from 'lucide-react'

const features = [
  { icon: Bolt, title: 'Instant', desc: 'Transfers and payments that settle in seconds, not days.' },
  { icon: ShieldCheck, title: 'Secure', desc: 'Bank-grade encryption and real-time fraud monitoring.' },
  { icon: Sparkles, title: 'Beautifully designed', desc: 'Every screen built for clarity, not clutter.' },
  { icon: Globe2, title: 'Accessible anywhere', desc: 'Your money, wherever you are, whenever you need it.' },
  { icon: Eye, title: 'Transparent', desc: 'Clear pricing, clear information. No hidden surprises.' },
  { icon: UserCheck, title: 'Personalized', desc: 'Insights and recommendations built around your habits.' },
]

export default function KeyFeatures() {
  return (
    <section className="py-24 md:py-30 bg-slate-50">
      <div className="container-content">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-navy-700 tracking-tight">
            Everything a modern bank should be.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            VAULTA replaces the fragmented, multi-app experience most people
            tolerate today with one unified, intelligent ecosystem.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-card bg-white p-7 shadow-surface hover:shadow-elevated transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-electric-50 flex items-center justify-center">
                <Icon size={20} className="text-electric-600" />
              </div>
              <h3 className="mt-5 font-display font-semibold text-navy-700">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
