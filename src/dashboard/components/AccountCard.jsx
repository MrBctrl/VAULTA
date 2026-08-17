import { CURRENCIES, formatCurrency } from '../../lib/currency.js'

export default function AccountCard({ account, onClick, selected = false }) {
  const currency = CURRENCIES[account.currency]
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-card p-5 border transition-all ${
        selected
          ? 'border-electric-500 bg-electric-50/50 shadow-surface'
          : 'border-silver bg-white hover:border-electric-100 hover:shadow-surface'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">{currency.flag}</span>
          <div>
            <p className="text-sm font-semibold text-navy-700">{account.label}</p>
            <p className="text-xs text-slate-500">
              {currency.code} • {currency.symbol}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400">•••• {account.accountNumber.slice(-4)}</span>
      </div>
      <p className="num text-xl font-semibold text-navy-700 mt-4 tracking-tight">
        {formatCurrency(account.balance, account.currency)}
      </p>
    </button>
  )
}
