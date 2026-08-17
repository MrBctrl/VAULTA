import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <Logo className="h-10 w-10" />
      <h1 className="font-display text-3xl font-semibold text-navy-700 mt-6">Page not found</h1>
      <p className="text-slate-600 mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-7 rounded-button bg-navy-600 text-white font-semibold px-6 py-3 hover:bg-navy-700 transition-colors"
      >
        Back to VAULTA
      </Link>
    </div>
  )
}
