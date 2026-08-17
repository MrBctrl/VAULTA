export default function ProgressBar({ pct, color = 'bg-electric-500' }) {
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${clamped}%` }} />
    </div>
  )
}
