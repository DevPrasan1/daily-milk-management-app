import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useApp } from '@/context/AppContext'
import { validatePhone, validateOtp } from '@/utils/validators'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ArrowLeft, Phone, Mail } from 'lucide-react'

const IS_DEV = import.meta.env.DEV

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useApp()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [loading, setLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [phoneError, setPhoneError] = useState(null)
  const [otpError, setOtpError] = useState(null)
  const confirmationRef = useRef(null)

  // Dev-only email login state
  const [showDevLogin, setShowDevLogin] = useState(false)
  const [devEmail, setDevEmail] = useState('')
  const [devPassword, setDevPassword] = useState('')
  const [devError, setDevError] = useState(null)

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  function setupRecaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
  }

  async function handleSendOtp() {
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    setPhoneError(null)
    setLoading(true)
    try {
      setupRecaptcha()
      const fullPhone = `+91${phone.replace(/\D/g, '')}`
      const confirmation = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)
      confirmationRef.current = confirmation
      setStep('otp')
      setResendCountdown(30)
    } catch (e) {
      toast(t('common.error'), 'error')
      window.recaptchaVerifier = null
    } finally {
      setLoading(false)
    }
  }

  async function handleDevLogin() {
    setDevError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, devEmail, devPassword)
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, devEmail, devPassword)
        } catch (e2) {
          setDevError(e2.message)
        }
      } else {
        setDevError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    const err = validateOtp(otp)
    if (err) { setOtpError(err); return }
    setOtpError(null)
    setLoading(true)
    try {
      await confirmationRef.current.confirm(otp)
      // onAuthStateChanged in AuthContext will pick up the new user
    } catch {
      setOtpError(t('login.invalidOtp'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell showNav={false}>
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900 flex flex-col px-6">
        <div id="recaptcha-container" />

        {/* Header */}
        <div className="flex items-center pt-12 mb-8">
          <button
            onClick={() => step === 'otp' ? setStep('phone') : navigate('/')}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex flex-col flex-1">
          <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mb-6">
            <Phone className="w-6 h-6 text-[#1D9E75]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {t('login.title')}
          </h1>

          {step === 'phone' ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                {t('login.otpInstruction')}
              </p>
              <Input
                label={t('common.phone')}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder={t('login.phonePlaceholder')}
                prefix="+91"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                error={phoneError}
              />
              <Button
                size="full"
                className="mt-6"
                loading={loading}
                onClick={handleSendOtp}
              >
                {t('login.sendOtp')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                {t('login.otpSent')} +91 {phone}
              </p>
              <Input
                label={t('login.otpLabel')}
                type="tel"
                inputMode="numeric"
                maxLength={6}
                placeholder={t('login.otpPlaceholder')}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                error={otpError}
              />
              <Button
                size="full"
                className="mt-6"
                loading={loading}
                onClick={handleVerifyOtp}
              >
                {t('login.verifyOtp')}
              </Button>
              <div className="flex items-center justify-center mt-4">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    {t('login.resendIn')} {resendCountdown}s
                  </p>
                ) : (
                  <button
                    onClick={() => { setStep('phone'); setOtp('') }}
                    className="text-sm text-[#1D9E75] font-medium"
                  >
                    {t('login.changeNumber')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {IS_DEV && (
          <div className="mt-auto pb-8">
            {!showDevLogin ? (
              <button
                onClick={() => setShowDevLogin(true)}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 py-2"
              >
                <Mail className="w-3 h-3" />
                Dev: sign in with email
              </button>
            ) : (
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Dev login
                </p>
                <Input
                  label="Email"
                  type="email"
                  placeholder="seller@test.com"
                  value={devEmail}
                  onChange={e => setDevEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="test123456"
                  value={devPassword}
                  onChange={e => setDevPassword(e.target.value)}
                  error={devError}
                />
                <Button size="full" loading={loading} onClick={handleDevLogin}>
                  Sign in / Create account
                </Button>
                <button
                  onClick={() => setShowDevLogin(false)}
                  className="w-full text-xs text-gray-400 text-center"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
