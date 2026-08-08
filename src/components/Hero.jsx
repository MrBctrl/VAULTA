import { useEffect, useState } from 'react'
import { ArrowUpRight, ShieldCheck, Zap } from 'lucide-react'

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = null
    let raf
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

export default function Hero() {
  const balance = useCountUp(48920)

  return (
    <section id="top" className="relative overflow-hidden pt-40 pb-24 md:pt-48 md:pb-32">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[560px] h-[560px] bg-electric-50 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[480px] h-[480px] bg-navy-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container-content grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-electric-50 text-electric-600 text-xs font-semibold px-3.5 py-1.5">
            <Zap size={14} /> Now live in 12 markets
          </span>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-semibold text-navy-700 tracking-tight">
            Banking Beyond
            <br />
            Boundaries.
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-md leading-relaxed">
            One premium ecosystem for everyday banking, business finance, and
            investing — built on trust, simplicity, and intelligence.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#open-account"
              className="rounded-button bg-navy-600 text-white font-semibold px-7 py-3.5 hover:bg-navy-700 transition-colors inline-flex items-center gap-2"
            >
              Open an Account <ArrowUpRight size={18} />
            </a>
            <a
              href="#personal"
              className="rounded-button border border-silver text-navy-600 font-semibold px-7 py-3.5 hover:bg-slate-50 transition-colors"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
            <ShieldCheck size={18} className="text-success" />
            Bank-grade encryption. Licensed &amp; regulated.
          </div>
        </div>

        {/* Signature element: floating account card */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm rounded-card bg-navy-600 text-white p-7 shadow-modal">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-navy-100/70 tracking-wide">
                TOTAL BALANCE
              </span>
              <span className="rounded-full bg-white/10 text-[11px] font-semibold px-2.5 py-1">
                USD
              </span>
            </div>
            <div className="num mt-3 text-4xl font-semibold tracking-tight">
              ${balance.toLocaleString()}
              <span className="text-navy-100/60 text-2xl">.00</span>
            </div>

            <div className="mt-6 flex items-center gap-2 text-success text-sm font-medium">
              <ArrowUpRight size={16} />
              +4.8% this month
            </div>

            <div className="mt-7 border-t border-white/10 pt-5 space-y-4">
              {[
                { name: 'Stripe Payout', amount: '+$2,140.00', time: 'Today' },
                { name: 'Adobe Suite', amount: '-$54.99', time: 'Yesterday' },
                { name: 'Client Invoice #204', amount: '+$1,800.00', time: '2 days ago' },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-navy-100/50 text-xs">{t.time}</p>
                  </div>
                  <span
                    className={`num font-medium ${
                      t.amount.startsWith('+') ? 'text-success' : 'text-navy-100/80'
                    }`}
                  >
                    {t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating virtual card accent */}
          <div className="hidden md:block absolute -bottom-8 -left-10 w-56 rounded-2xl bg-gradient-to-br from-electric-500 to-navy-600 p-5 shadow-elevated rotate-[-8deg]">
            <p className="text-white/70 text-[10px] tracking-wide font-medium">VAULTA</p>
            <p className="num text-white text-sm mt-4 tracking-widest">
              •••• •••• •••• 4471
            </p>
            <p className="text-white/60 text-[10px] mt-3">VIRTUAL CARD</p>
          </div>
        </div>
      </div>
    </section>
  )
}
