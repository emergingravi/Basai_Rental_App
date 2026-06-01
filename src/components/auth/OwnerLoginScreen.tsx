import React, { useState } from 'react'
import { ArrowLeft, Phone, Eye, EyeOff, House } from 'lucide-react'
import { loginOwner } from '../../lib/supabase'

interface OwnerLoginScreenProps {
  onBack: () => void
  onLoggedIn: (session: any) => void
}

export const OwnerLoginScreen: React.FC<OwnerLoginScreenProps> = ({ onBack, onLoggedIn }) => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await loginOwner(phone, password)

      if (res?.error) {
        setError(res.error.message || 'Login failed')
        return
      }

      if (res?.data) {
        onLoggedIn(res.data)
      } else {
        setError('No owner account found.')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell flex flex-col justify-between h-full px-6 py-6 bg-white dark:bg-gray-900 transition-colors overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-medium text-gray-400">Owner Login</span>
        </div>

        <div className="mb-5 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 dark:border-emerald-900/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#1D9E75] shadow-sm dark:bg-gray-800">
            <House className="h-3.5 w-3.5" />
            <span>Basai.com Owner</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Owner sign in</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Use your phone number and password to access your owner dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="owner-login-phone"
              className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5"
            >
              Phone number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-gray-400 dark:text-gray-500">
                <Phone className="w-5 h-5" />
              </div>
              <div className="absolute left-11 text-sm font-medium text-gray-500 dark:text-gray-400">+977</div>
              <input
                id="owner-login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98XXXXXXXX"
                className="block w-full pl-22 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="owner-login-password"
              className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-gray-400 dark:text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="owner-login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="block w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent transition-all"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium" role="alert">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                !loading
                  ? 'bg-[#1D9E75] text-white hover:bg-[#147B5A]'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in as owner'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-[11px] text-gray-400">Login checks your phone number and password against the owners table.</p>
      </div>
    </div>
  )
}

export default OwnerLoginScreen
