export default function StatCard({ label, value, sub, trend, icon: Icon, dark = false }) {
  return (
    <div
      className={`rounded-card p-6 shadow-surface ${
        dark ? 'bg-navy-600 text-white' : 'bg-white text-navy-700 border border-silver'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium tracking-wide ${dark ? 'text-navy-100/60' : 'text-slate-500'}`}>
          {label}
        </span>
        {Icon && (
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-electric-50'}`}>
            <Icon size={15} className={dark ? 'text-electric-500' : 'text-electric-600'} />
          </div>
        )}
      </div>
      <p className="num text-2xl font-semibold mt-3 tracking-tight">{value}</p>
      {sub && (
        <p className={`text-xs mt-1.5 ${dark ? 'text-navy-100/50' : 'text-slate-500'}`}>{sub}</p>
      )}
      {trend && (
        <p className={`text-xs font-semibold mt-2 ${trend.startsWith('+') ? 'text-success' : 'text-error'}`}>
          {trend}
        </p>
      )}
    </div>
  )
}
