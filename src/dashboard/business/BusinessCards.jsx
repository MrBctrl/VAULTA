import { useState } from 'react'
import { Snowflake, Plus } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { cards as cardsData } from '../../data/mockData.js'
import { formatCurrency } from '../../lib/currency.js'

export default function BusinessCards() {
  const [cards, setCards] = useState(cardsData)
  const toggleFreeze = (id) => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c)))

  return (
    <BusinessLayout title="Cards" subtitle="Corporate and team cards">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-navy-700">Business Cards</h2>
        <button className="inline-flex items-center gap-2 rounded-button bg-navy-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-navy-700 transition-colors">
          <Plus size={16} /> Issue Card
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {cards.map((card) => (
          <div key={card.id} className="rounded-card bg-white border border-silver p-5">
            <div
              className={`aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-electric-500 to-navy-600 p-5 flex flex-col justify-between relative ${
                card.frozen ? 'opacity-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-white/70 text-[11px] font-semibold tracking-wide">VAULTA BUSINESS</span>
                {card.frozen && (
                  <span className="rounded-full bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 flex items-center gap-1">
                    <Snowflake size={11} /> Frozen
                  </span>
                )}
              </div>
              <div>
                <p className="num text-white text-base tracking-[0.2em]">•••• •••• •••• {card.last4}</p>
                <p className="text-white/60 text-[10px] mt-2">{card.holder}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy-700 text-sm">{card.type}</h3>
                <span className="num text-sm font-semibold text-navy-700">{formatCurrency(card.balance, card.currency)}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Spending limit</span>
                  <span className="num">{formatCurrency(card.spendingLimit, card.currency)}</span>
                </div>
                <ProgressBar pct={42} />
              </div>
              <button
                onClick={() => toggleFreeze(card.id)}
                className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                  card.frozen ? 'bg-navy-600 text-white' : 'bg-slate-50 text-navy-700 hover:bg-slate-100'
                }`}
              >
                <Snowflake size={14} /> {card.frozen ? 'Unfreeze Card' : 'Freeze Card'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </BusinessLayout>
  )
}
