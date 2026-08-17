export default function DonutChart({ data, size = 160, thickness = 22 }) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {data.map((slice) => {
          const dash = (slice.pct / 100) * circumference
          const gap = circumference - dash
          const offset = -((cumulative / 100) * circumference)
          cumulative += slice.pct
          return (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          )
        })}
      </g>
    </svg>
  )
}
