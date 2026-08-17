import { Banknote, Calendar } from 'lucide-react'
import BusinessLayout from '../components/BusinessLayout.jsx'
import { team } from '../../data/mockData.js'
import { formatCurrency } from '../../lib/currency.js'

const salaries = [
  { ...team[0], salary: 950000 },
  { ...team[1], salary: 820000 },
  { ...team[2], salary: 610000 },
]
const totalPayroll = salaries.reduce((s, m) => s + m.salary, 0)

export default function Payroll() {
  return (
    <BusinessLayout title="Payroll" subtitle="Pay your team on time, every time">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="rounded-card bg-navy-600 text-white p-6">
          <div className="flex items-center gap-2 text-navy-100/70 text-xs">
            <Banknote size={14} /> NEXT PAYROLL RUN
          </div>
          <p className="num text-2xl font-semibold mt-2">{formatCurrency(totalPayroll, 'NGN')}</p>
          <p className="text-navy-100/60 text-sm mt-1 flex items-center gap-1.5">
            <Calendar size={13} /> Scheduled for Sep 1, 2026
          </p>
        </div>
        <div className="rounded-card bg-white border border-silver p-6 flex flex-col justify-center">
          <p className="text-xs text-slate-500">Team members on payroll</p>
          <p className="num text-2xl font-semibold text-navy-700 mt-1">{salaries.length}</p>
        </div>
      </div>

      <div className="rounded-card bg-white border border-silver p-6 mt-6">
        <h3 className="font-display font-semibold text-navy-700">Payroll Breakdown</h3>
        <div className="mt-4 divide-y divide-silver">
          {salaries.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-navy-600 text-white flex items-center justify-center text-xs font-display font-semibold">
                  {m.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-700">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>
              <span className="num text-sm font-semibold text-navy-700">{formatCurrency(m.salary, 'NGN')}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-silver">
          <span className="text-sm font-semibold text-navy-700">Total</span>
          <span className="num text-base font-semibold text-navy-700">{formatCurrency(totalPayroll, 'NGN')}</span>
        </div>
      </div>
    </BusinessLayout>
  )
}
