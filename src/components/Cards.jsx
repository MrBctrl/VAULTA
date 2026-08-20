const cards = [
  {
    name: 'Virtual Card',
    tag: 'Instant',
    gradient: 'from-slate-500 to-slate-700',
    desc: 'Generated instantly for safe online spending.',
  },
  {
    name: 'Physical Card',
    tag: 'Everyday',
    gradient: 'from-navy-600 to-navy-700',
    desc: 'Tap to pay anywhere, with instant freeze if lost.',
  },
  {
    name: 'Premium Card',
    tag: 'Metal',
    gradient: 'from-electric-500 to-navy-600',
    desc: 'Weighted metal card with elevated rewards.',
  },
]

export default function Cards() {
  return (
    <section id="cards" className="py-24 md:py-30">
      <div className="container-content">
        <div className="max-w-xl">
          <span className="text-xs font-semibold tracking-wide text-electric-600 uppercase">
            Cards
          </span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-navy-700 tracking-tight">
            A card for every way you spend.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Freeze, lock, or set limits instantly. Every card lives inside
            the app, under your full control.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-8">
          {cards.map((c) => (
            <div key={c.name}>
              <div
                className={`aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${c.gradient} p-6 flex flex-col justify-between shadow-elevated`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-white/70 text-[11px] font-semibold tracking-wide">
                    VAULTA
                  </span>
                  <span className="rounded-full bg-white/15 text-white text-[10px] font-semibold px-2.5 py-1">
                    {c.tag}
                  </span>
                </div>
                <p className="num text-white text-base tracking-[0.2em]">•••• 4471</p>
              </div>
              <h3 className="mt-5 font-semibold text-navy-700">{c.name}</h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
