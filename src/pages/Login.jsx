import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useApp } from '@/context/AppContext'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Mail, Compass, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useApp()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState(null)

  // Handle checking for inbound Email Magic Link on mount
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setLoading(true)
      let emailVal = window.localStorage.getItem('emailForSignIn')
      if (!emailVal) {
        // If the user clicked the link in a different browser/device, ask them to re-enter email
        emailVal = window.prompt('Please provide your email for confirmation:')
      }

      if (emailVal) {
        signInWithEmailLink(auth, emailVal, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn')
            toast(t('common.done') || 'Logged in successfully!', 'success')
            navigate('/')
          })
          .catch((err) => {
            console.error('Magic link sign-in error:', err)
            toast(err.message, 'error')
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }
  }, [navigate, toast, t])

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      navigate('/')
    } catch (err) {
      console.error('Google login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMagicLink() {
    if (!email.trim() || !email.includes('@')) {
      setError(t('login.invalidEmail'))
      return
    }
    setError(null)
    setLoading(true)
    try {
      const actionCodeSettings = {
        // Redirect back to this login page to parse the magic code
        url: window.location.origin + '/login',
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings)
      window.localStorage.setItem('emailForSignIn', email.trim())
      setEmailSent(true)
    } catch (err) {
      console.error('Magic link send error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell showNav={false}>
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900 flex flex-col justify-center px-6 py-12">
        <div className="w-full max-w-[342px] mx-auto flex flex-col">

          <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mb-6">
            <Compass className="w-6 h-6 text-[#1D9E75]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('login.title')}
          </h1>

          {emailSent ? (
            <div className="flex flex-col items-center text-center mt-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.magicLinkSent')}
              </p>
              <p className="text-xs text-gray-400">
                {email}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-6"
                onClick={() => setEmailSent(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 mt-4">

              {/* Google Sign-in Option */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-xs cursor-pointer min-h-[44px] select-none active:scale-[0.99] transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                {t('login.googleLogin')}
              </button>

              {/* Separator */}
              <div className="flex items-center text-center">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
                <span className="px-3 text-xs font-semibold text-gray-400 tracking-wider">
                  {t('login.or')}
                </span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-800" />
              </div>

              {/* Email Form */}
              <div className="flex flex-col gap-4">
                <Input
                  label={t('login.emailLabel')}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={error}
                  disabled={loading}
                />

                <Button
                  size="full"
                  loading={loading}
                  onClick={handleSendMagicLink}
                  className="flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Mail className="w-4 h-4" />
                  {t('login.sendMagicLink')}
                </Button>
              </div>

            </div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
