import BusinessLayout from '../components/BusinessLayout.jsx'
import DonutChart from '../components/DonutChart.jsx'
import { business } from '../../data/mockData.js'
import { formatCurrency } from '../../lib/currency.js'

const expenseCategories = [
  { label: 'Payroll', amount: 1420000, color: '#0B2545' },
  { label: 'Software', amount: 486000, color: '#2F6FED' },
  { label: 'Contractors', amount: 720000, color: '#64748B' },
  { label: 'Office', amount: 310000, color: '#10B981' },
  { label: 'Marketing', amount: 244000, color: '#F59E0B' },
]
const total = expenseCategories.reduce((s, c) => s + c.amount, 0)

export default function Expenses() {
  return (
    <BusinessLayout title="Expenses" subtitle="Where the business is spending">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-card bg-navy-600 text-white p-6 sm:p-7">
          <p className="text-navy-100/60 text-xs">TOTAL EXPENSES (MTD)</p>
          <p className="num text-2xl font-semibold mt-2">{formatCurrency(business.expensesNGN, 'NGN')}</p>
          <div className="flex justify-center mt-6">
            <DonutChart data={expenseCategories.map((c) => ({ ...c, pct: (c.amount / total) * 100 }))} />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-card bg-white border border-silver p-6 sm:p-7">
          <h3 className="font-display font-semibold text-navy-700">By Category</h3>
          <div className="mt-4 divide-y divide-silver">
            {expenseCategories.map((c) => (
              <div key={c.label} className="flex items-center justify-between py-3.5">
                <span className="flex items-center gap-2.5 text-sm text-navy-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </span>
                <div className="text-right">
                  <span className="num text-sm font-semibold text-navy-700">
                    {formatCurrency(c.amount, 'NGN', { compact: true })}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">{((c.amount / total) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BusinessLayout>
  )
}
