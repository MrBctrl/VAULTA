export default function Logo({ className = 'h-8 w-8', variant = 'color' }) {
  const primary = variant === 'white' ? '#FFFFFF' : '#0B2545'
  const accent = variant === 'white' ? '#FFFFFF' : '#2F6FED'

  return (
   <img src="/logo.png" alt="VAULTA" className={className} />
  )
}
