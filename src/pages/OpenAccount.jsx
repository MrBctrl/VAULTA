import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

export default function OpenAccount() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const firstName = fullName.trim().split(' ')[0] || fullName
    const { data, error } = await signUp({ email, password, firstName, fullName })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // If email confirmation is required, there's no session yet.
    if (!data.session) {
      setCheckEmail(true)
      return
    }
    navigate('/dashboard')
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 text-center">
        <div className="w-full max-w-sm rounded-card bg-white border border-silver p-8">
          <h1 className="font-display text-xl font-semibold text-navy-700">Check your email</h1>
          <p className="text-sm text-slate-500 mt-2">
            We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then sign in.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <Logo />
        </Link>
        <div className="rounded-card bg-white border border-silver p-8">
          <h1 className="font-display text-xl font-semibold text-navy-700">Open an account</h1>
          <p className="text-sm text-slate-500 mt-1">Start banking with VAULTA in minutes.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">FULL NAME</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">PASSWORD</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-input border border-silver px-4 py-3 text-sm focus:outline-none focus:border-electric-500"
              />
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-button bg-navy-600 text-white font-semibold py-3.5 hover:bg-navy-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Open Account'}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-electric-600 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
