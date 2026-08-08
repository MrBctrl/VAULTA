export default function Logo({ className = 'h-8 w-8', variant = 'color' }) {
  const primary = variant === 'white' ? '#FFFFFF' : '#0B2545'
  const accent = variant === 'white' ? '#FFFFFF' : '#2F6FED'

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Vault-door frame */}
      <rect x="4" y="4" width="32" height="32" rx="10" stroke={primary} strokeWidth="2.5" />
      {/* Ascending connected nodes — growth + connectivity */}
      <circle cx="14" cy="26" r="2.2" fill={accent} />
      <circle cx="20" cy="19" r="2.2" fill={accent} />
      <circle cx="27" cy="12" r="2.2" fill={accent} />
      <path
        d="M14 26 L20 19 L27 12"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
