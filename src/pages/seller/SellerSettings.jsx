import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth, db } from '@/config/firebase'
import { doc, updateDoc, setDoc, GeoPoint } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useApp } from '@/context/AppContext'
import { useLocation } from '@/hooks/useLocation'
import { useSellerPrices } from '@/hooks/useSeller'
import { setPrice, getGlobalPriceId } from '@/services/seller.service'
import { useState, useEffect } from 'react'
import { geohashForLocation } from 'geofire-common'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import AutoModeToggle from '@/components/seller/AutoModeToggle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { LogOut, Globe, MapPin, Check, AlertCircle } from 'lucide-react'
import { CATTLE_OPTIONS } from '@/utils/constants'
import i18n from '@/i18n/index.js'


export default function SellerSettings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, userProfile, refreshProfile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { toast } = useApp()
  const { coords: fetchedCoords, loading: locLoading, error: locError, getLocation } = useLocation()
  const { prices, getPrice } = useSellerPrices()

  const isHindi = i18n.language === 'hi'

  const [name, setName] = useState(userProfile?.name || '')
  const [about, setAbout] = useState(userProfile?.about || '')
  const [openToSell, setOpenToSell] = useState(userProfile?.openToSell !== false)
  const [selectedCattle, setSelectedCattle] = useState([])
  const [customCoords, setCustomCoords] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [cowPrice, setCowPrice] = useState('')
  const [bufPrice, setBufPrice] = useState('')
  const [goatPrice, setGoatPrice] = useState('')
  const [camelPrice, setCamelPrice] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)

  // Pre-fill profile settings once userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '')
      setAbout(userProfile.about || '')
      setOpenToSell(userProfile.openToSell !== false)

      const list = []
      if (userProfile.hasCow) list.push('cow')
      if (userProfile.hasBuffalo) list.push('buffalo')
      if (userProfile.hasGoat) list.push('goat')
      if (userProfile.hasCamel) list.push('camel')
      setSelectedCattle(list)

      if (userProfile.gpsLocation) {
        setCustomCoords({
          lat: userProfile.gpsLocation.latitude,
          lng: userProfile.gpsLocation.longitude,
        })
      }
    }
  }, [userProfile])

  // Sync pricing inputs once prices are loaded
  useEffect(() => {
    if (prices && prices.length > 0) {
      setCowPrice(String(getPrice('cow') || ''))
      setBufPrice(String(getPrice('buffalo') || ''))
      setGoatPrice(String(getPrice('goat') || ''))
      setCamelPrice(String(getPrice('camel') || ''))
    }
  }, [prices])

  // Sync customCoords if new coords are fetched
  useEffect(() => {
    if (fetchedCoords) {
      setCustomCoords(fetchedCoords)
    }
  }, [fetchedCoords])

  async function handleSaveProfile() {
    if (!name.trim()) {
      toast('Name is required', 'warning')
      return
    }
    if (selectedCattle.length === 0) {
      toast('Select at least one cattle type', 'warning')
      return
    }
    if (openToSell && !customCoords) {
      toast('Location is mandatory when open to sell milk', 'warning')
      return
    }

    setSavingProfile(true)
    try {
      const hasCoords = !!customCoords
      const geoPoint = hasCoords ? new GeoPoint(customCoords.lat, customCoords.lng) : null
      const hash = hasCoords ? geohashForLocation([customCoords.lat, customCoords.lng]) : null
      const updateData = {
        name: name.trim(),
        about: about.trim(),
        openToSell,
        hasCow: selectedCattle.includes('cow'),
        hasBuffalo: selectedCattle.includes('buffalo'),
        hasGoat: selectedCattle.includes('goat'),
        hasCamel: selectedCattle.includes('camel'),
        gpsLocation: geoPoint,
        geohash: hash,
      }

      await updateDoc(doc(db, 'users', user.uid), updateData)
      await setDoc(doc(db, 'sellers', user.uid), {
        openToSell,
        hasCow: selectedCattle.includes('cow'),
        hasBuffalo: selectedCattle.includes('buffalo'),
        hasGoat: selectedCattle.includes('goat'),
        hasCamel: selectedCattle.includes('camel'),
        gpsLocation: geoPoint,
        geohash: hash,
      }, { merge: true })

      toast('Profile updated successfully', 'success')
      refreshProfile()
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSavePrices() {
    setSavingPrice(true)
    try {
      if (selectedCattle.includes('cow') && cowPrice) {
        await setPrice(user.uid, getGlobalPriceId('cow'), { buyerId: null, cattleType: 'cow', pricePerLitre: parseFloat(cowPrice) })
      }
      if (selectedCattle.includes('buffalo') && bufPrice) {
        await setPrice(user.uid, getGlobalPriceId('buffalo'), { buyerId: null, cattleType: 'buffalo', pricePerLitre: parseFloat(bufPrice) })
      }
      if (selectedCattle.includes('goat') && goatPrice) {
        await setPrice(user.uid, getGlobalPriceId('goat'), { buyerId: null, cattleType: 'goat', pricePerLitre: parseFloat(goatPrice) })
      }
      if (selectedCattle.includes('camel') && camelPrice) {
        await setPrice(user.uid, getGlobalPriceId('camel'), { buyerId: null, cattleType: 'camel', pricePerLitre: parseFloat(camelPrice) })
      }
      toast('Prices updated', 'success')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setSavingPrice(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  function toggleLanguage() {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('milkbook_lang', next)
  }

  return (
    <AppShell>
      <TopBar title={t('seller.settings.title')} showBack={false} />
      <PageWrapper>
        {/* Profile Card */}
        <Card className="mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('seller.settings.profile')}
          </p>
          <div className="flex flex-col gap-4">
            <Input
              label={t('onboarding.phoneLabel')}
              value={userProfile?.phone || user?.phoneNumber || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-75"
            />
            <Input
              label={t('common.name')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              label={t('common.note')}
              value={about}
              onChange={e => setAbout(e.target.value)}
            />

            {/* Open to Sell */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.openToSellLabel')}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpenToSell(true)}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all min-h-[44px] ${openToSell
                      ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                >
                  {t('common.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenToSell(false)}
                  className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all min-h-[44px] ${!openToSell
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                >
                  {t('common.no')}
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('onboarding.currentLocationLabel')}
              </label>
              {customCoords ? (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900/50">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-800 dark:text-green-400">
                      {t('onboarding.locationSecured')}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${customCoords.lat},${customCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-green-600 dark:text-green-500 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                    >
                      Lat: {customCoords.lat.toFixed(6)}, Lng: {customCoords.lng.toFixed(6)} ↗
                    </a>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[32px] py-1 px-2.5 text-xs text-[#1D9E75]"
                    onClick={getLocation}
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
                    onClick={getLocation}
                    loading={locLoading}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {t('onboarding.fetchLocationBtn')}
                  </Button>
                  {locError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {locError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cattle Types */}
            <div className="flex flex-col gap-2">
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
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all min-h-[44px] ${isSelected
                          ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                        }`}
                    >
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              size="full"
              loading={savingProfile}
              onClick={handleSaveProfile}
              className="mt-2"
            >
              {t('onboarding.saveProfile')}
            </Button>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('seller.settings.pricing')}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {selectedCattle.includes('cow') && (
              <Input
                label={`🐄 ${t('onboarding.cow')} (₹/L)`}
                type="number"
                inputMode="decimal"
                value={cowPrice}
                onChange={e => setCowPrice(e.target.value)}
              />
            )}
            {selectedCattle.includes('buffalo') && (
              <Input
                label={`🐃 ${t('onboarding.buffalo')} (₹/L)`}
                type="number"
                inputMode="decimal"
                value={bufPrice}
                onChange={e => setBufPrice(e.target.value)}
              />
            )}
            {selectedCattle.includes('goat') && (
              <Input
                label={`🐐 ${t('onboarding.goat')} (₹/L)`}
                type="number"
                inputMode="decimal"
                value={goatPrice}
                onChange={e => setGoatPrice(e.target.value)}
              />
            )}
            {selectedCattle.includes('camel') && (
              <Input
                label={`🐪 ${t('onboarding.camel')} (₹/L)`}
                type="number"
                inputMode="decimal"
                value={camelPrice}
                onChange={e => setCamelPrice(e.target.value)}
              />
            )}
          </div>
          {selectedCattle.length > 0 ? (
            <Button size="full" variant="outline" loading={savingPrice} onClick={handleSavePrices}>
              {t('seller.settings.savePrices')}
            </Button>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">{t('seller.settings.selectCattlePrompt')}</p>
          )}
        </Card>

        {/* Preferences */}
        <Card className="mb-4">
          <AutoModeToggle
            enabled={isDark}
            onToggle={toggleTheme}
            label={t('seller.settings.theme')}
          />
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-between w-full py-3 min-h-[44px]"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {t('seller.settings.language')}
              </span>
            </div>
            <span className="text-sm font-medium text-[#1D9E75]">
              {i18n.language === 'en' ? 'English' : 'हिंदी'}
            </span>
          </button>
        </Card>

        {/* Logout */}
        <Button size="full" variant="danger" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          {t('seller.settings.logout')}
        </Button>
      </PageWrapper>
    </AppShell>
  )
}
