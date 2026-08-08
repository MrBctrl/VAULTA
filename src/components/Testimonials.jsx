const testimonials = [
  {
    quote:
      'VAULTA is the first bank that has actually made me feel organized. Everything I need is one tap away.',
    name: 'Amara O.',
    role: 'Young Professional',
  },
  {
    quote:
      'Getting paid in three currencies used to be a nightmare. Now it just happens, quietly, in the background.',
    name: 'Daniel K.',
    role: 'Freelancer',
  },
  {
    quote:
      'Team cards and payroll in one place saved us hours every month. It finally feels built for founders.',
    name: 'Priya R.',
    role: 'Entrepreneur',
  },
  {
    quote:
      'I can finally see my whole portfolio without opening four different apps. The clarity alone is worth it.',
    name: 'Marcus T.',
    role: 'Investor',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 md:py-30 bg-slate-50">
      <div className="container-content">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-navy-700 tracking-tight">
            Trusted by people building real things.
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-card bg-white p-7 shadow-surface">
              <p className="text-navy-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-electric-50 flex items-center justify-center font-display font-semibold text-electric-600">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-700">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
