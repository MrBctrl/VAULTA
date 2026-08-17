export default function BarChart({ data, height = 140, color = '#2F6FED' }) {
  const max = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex items-end gap-2.5 sm:gap-4" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${Math.max((d.value / max) * 100, 4)}%`,
              backgroundColor: d.color ?? color,
            }}
          />
          <span className="text-[10px] text-slate-500 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
