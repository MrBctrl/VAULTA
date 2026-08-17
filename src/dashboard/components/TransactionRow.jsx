import {
  Tv, Wallet, Cloud, Users, Music2, Plane, ShoppingBag, Car,
  Zap, Send, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react'
import { formatCurrency } from '../../lib/currency.js'

const categoryIcons = {
  Entertainment: Music2,
  Income: Wallet,
  Business: Cloud,
  Transfer: Send,
  Shopping: ShoppingBag,
  Transport: Car,
  Bills: Zap,
  Travel: Plane,
  Default: Tv,
}

export default function TransactionRow({ tx }) {
  const Icon = categoryIcons[tx.category] ?? categoryIcons.Default
  const isCredit = tx.type === 'credit'

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-silver last:border-0">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
            isCredit ? 'bg-success/10' : 'bg-slate-100'
          }`}
        >
          <Icon size={17} className={isCredit ? 'text-success' : 'text-navy-600'} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-700 truncate">{tx.name}</p>
          <p className="text-xs text-slate-500">
            {tx.category} · {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pl-3">
        <span className={`num text-sm font-semibold ${isCredit ? 'text-success' : 'text-navy-700'}`}>
          {isCredit ? '+' : '−'} {formatCurrency(Math.abs(tx.amount), tx.currency).replace('-', '')}
        </span>
        {isCredit ? (
          <ArrowDownLeft size={15} className="text-success" />
        ) : (
          <ArrowUpRight size={15} className="text-slate-400" />
        )}
      </div>
    </div>
  )
}
