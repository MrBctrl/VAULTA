import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { CURRENCY_LIST, CURRENCIES } from '../../lib/currency.js'

export default function CurrencySelector({ value, onChange, label = 'Primary Account' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = CURRENCIES[value]

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      {label && <p className="text-xs text-slate-500 mb-2">{label}</p>}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-input border border-silver bg-white px-4 py-3 w-full sm:w-64 hover:border-electric-100 transition-colors"
      >
        <span className="text-xl leading-none">{current.flag}</span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-navy-700">{current.name}</span>
          <span className="block text-xs text-slate-500">
            {current.code} • {current.symbol}
          </span>
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full sm:w-64 rounded-card border border-silver bg-white shadow-elevated py-2">
          {CURRENCY_LIST.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                onChange(c.code)
                setOpen(false)
              }}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                c.code === value ? 'bg-electric-50/60' : ''
              }`}
            >
              <span className="text-lg leading-none">{c.flag}</span>
              <span>
                <span className="block text-sm font-medium text-navy-700">
                  {c.code} — {c.name}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
