import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { doc, updateDoc, setDoc, GeoPoint } from 'firebase/firestore'
import { db } from '@/config/firebase'
import AppShell from '@/components/layout/AppShell'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { useLocation } from '@/hooks/useLocation'
import { ROLES, CATTLE_OPTIONS } from '@/utils/constants'
import { validateName } from '@/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Milk, MapPin, Check, AlertCircle } from 'lucide-react'
import { linkPendingMilkbooks } from '@/services/milkbook.service'
import { geohashForLocation } from 'geofire-common'


export default function Onboarding() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, userProfile, loading: authLoading, refreshProfile } = useAuth()
  const { toast } = useApp()
  const { coords, setCoords, loading: locLoading, error: locError, getLocation } = useLocation()

  const isSeller = userProfile?.role === ROLES.SELLER
  const isHindi = i18n.language === 'hi'

  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [selectedCattle, setSelectedCattle] = useState([])
  const [openToSell, setOpenToSell] = useState(true)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (!userProfile?.role) {
      navigate('/role-select', { replace: true })
      return
    }
    if (userProfile?.name) {
      navigate(userProfile.role === ROLES.SELLER ? '/seller' : '/buyer', { replace: true })
    }
  }, [user, userProfile, authLoading, navigate])

  if (authLoading) return <FullPageSpinner />

  function validate() {
    const errs = {}
    const nameErr = validateName(name)
    if (nameErr) errs.name = nameErr

    if (isSeller) {
      if (selectedCattle.length === 0) {
        errs.cattle = t('onboarding.selectCattle')
      }
      if (!coords) {
        errs.location = t('onboarding.locationMandatory')
      }
    }
    return errs
  }

  async function handleContinue() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const updateData = {
        name: name.trim(),
        about: about.trim(),
      }

      if (isSeller) {
        const hash = geohashForLocation([coords.lat, coords.lng])
        updateData.gpsLocation = new GeoPoint(coords.lat, coords.lng)
        updateData.geohash = hash
        updateData.openToSell = openToSell
        updateData.hasCow = selectedCattle.includes('cow')
        updateData.hasBuffalo = selectedCattle.includes('buffalo')
        updateData.hasGoat = selectedCattle.includes('goat')
        updateData.hasCamel = selectedCattle.includes('camel')
      }

      await updateDoc(doc(db, 'users', user.uid), updateData)

      if (isSeller) {
        const hash = geohashForLocation([coords.lat, coords.lng])
        await setDoc(doc(db, 'sellers', user.uid), {
          gpsLocation: new GeoPoint(coords.lat, coords.lng),
          geohash: hash,
          openToSell,
          hasCow: selectedCattle.includes('cow'),
          hasBuffalo: selectedCattle.includes('buffalo'),
          hasGoat: selectedCattle.includes('goat'),
          hasCamel: selectedCattle.includes('camel'),
        }, { merge: true })
      }

      try {
        await linkPendingMilkbooks(user.uid, user.phoneNumber)
      } catch (err) {
        console.error('Error linking pending books:', err)
      }

      refreshProfile()
      navigate(isSeller ? '/seller' : '/buyer')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell showNav={false}>

      <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900 flex flex-col px-6 py-12">
        <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mb-6">
          <Milk className="w-6 h-6 text-[#1D9E75]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {t('onboarding.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {userProfile?.phone || user?.phoneNumber}
        </p>

        <div className="flex flex-col gap-5 flex-1">
          <Input
            label={t('onboarding.phoneLabel')}
            value={userProfile?.phone || user?.phoneNumber || ''}
            disabled
            className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-75"
          />

          <Input
            label={t('common.name')}
            placeholder={t('onboarding.namePlaceholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
          />

          <Input
            label={t('common.note')}
            placeholder={t('onboarding.aboutPlaceholder')}
            value={about}
            onChange={e => setAbout(e.target.value)}
          />

          {isSeller && (
            <>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('onboarding.cattleTypeLabel')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CATTLE_OPTIONS.map(opt => {
                    const isSelected = selectedCattle.includes(opt.value)
                    const label = isHindi ? opt.labelHi : opt.labelEn
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedCattle(prev =>
                            prev.includes(opt.value)
                              ? prev.filter(c => c !== opt.value)
                              : [...prev, opt.value]
                          )
                          setErrors(prev => ({ ...prev, cattle: null }))
                        }}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[44px] ${isSelected
                          ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                          }`}
                      >
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
                {errors.cattle && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.cattle}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('onboarding.openToSellLabel')}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenToSell(true)}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all min-h-[44px] ${openToSell
                      ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                      }`}
                  >
                    {t('common.yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenToSell(false)}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all min-h-[44px] ${!openToSell
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                      }`}
                  >
                    {t('common.no')}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('onboarding.currentLocationLabel')}
                </label>
                {coords ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900/50">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green-800 dark:text-green-400">
                        {t('onboarding.locationSecured')}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-green-600 dark:text-green-500 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                      >
                        Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)} ↗
                      </a>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-[32px] py-1 px-2.5 text-xs text-[#1D9E75]"
                      onClick={() => {
                        getLocation()
                        setErrors(prev => ({ ...prev, location: null }))
                      }}
                      loading={locLoading}
                    >
                      {t('common.retry')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="full"
                      variant="outline"
                      onClick={() => {
                        getLocation()
                        setErrors(prev => ({ ...prev, location: null }))
                      }}
                      loading={locLoading}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      {t('onboarding.fetchLocationBtn')}
                    </Button>
                    {locError && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {locError}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCoords({ lat: 28.6139, lng: 77.2090 })
                            setErrors(prev => ({ ...prev, location: null }))
                          }}
                          className="text-xs text-[#1D9E75] font-semibold hover:underline self-start min-h-[32px] px-1"
                        >
                          {t('buyer.nearby.testModeLocation')}
                        </button>
                      </div>
                    )}
                    {errors.location && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Button
          size="full"
          className="mt-8"
          loading={loading}
          onClick={handleContinue}
        >
          {t('onboarding.continueBtn')}
        </Button>
      </div>
    </AppShell>
  )
}
