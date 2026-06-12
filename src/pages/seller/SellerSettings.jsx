import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth, db } from '@/config/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useApp } from '@/context/AppContext'
import { useSellerPrices } from '@/hooks/useSeller'
import { setPrice, getGlobalPriceId } from '@/services/seller.service'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import AutoModeToggle from '@/components/seller/AutoModeToggle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { LogOut, Globe } from 'lucide-react'
import i18n from '@/i18n/index.js'

export default function SellerSettings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { toast } = useApp()
  const { getPrice } = useSellerPrices()

  const [cowPrice, setCowPrice] = useState(String(getPrice('cow') || ''))
  const [bufPrice, setBufPrice] = useState(String(getPrice('buffalo') || ''))
  const [savingPrice, setSavingPrice] = useState(false)
  const [hasCow, setHasCow] = useState(userProfile?.hasCow !== false)
  const [hasBuffalo, setHasBuffalo] = useState(userProfile?.hasBuffalo !== false)
  const [savingCattle, setSavingCattle] = useState(false)

  async function handleSavePrices() {
    setSavingPrice(true)
    try {
      if (cowPrice) await setPrice(user.uid, getGlobalPriceId('cow'), { buyerId: null, cattleType: 'cow', pricePerLitre: parseFloat(cowPrice) })
      if (bufPrice) await setPrice(user.uid, getGlobalPriceId('buffalo'), { buyerId: null, cattleType: 'buffalo', pricePerLitre: parseFloat(bufPrice) })
      toast('Prices updated', 'success')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setSavingPrice(false)
    }
  }

  async function handleSaveCattle() {
    if (!hasCow && !hasBuffalo) {
      toast('Select at least one cattle type', 'warning')
      return
    }
    setSavingCattle(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { hasCow, hasBuffalo })
      toast('Cattle preferences saved', 'success')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setSavingCattle(false)
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
        {/* Profile */}
        <Card className="flex items-center gap-3 mb-4">
          <Avatar name={userProfile?.name} size="lg" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{userProfile?.name}</p>
            <p className="text-xs text-gray-400">{user?.phoneNumber}</p>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('seller.settings.pricing')}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              label="🐄 Cow (₹/L)"
              type="number"
              inputMode="decimal"
              value={cowPrice}
              onChange={e => setCowPrice(e.target.value)}
            />
            <Input
              label="🐃 Buffalo (₹/L)"
              type="number"
              inputMode="decimal"
              value={bufPrice}
              onChange={e => setBufPrice(e.target.value)}
            />
          </div>
          <Button size="full" variant="outline" loading={savingPrice} onClick={handleSavePrices}>
            Save Prices
          </Button>
        </Card>

        {/* Cattle type */}
        <Card className="mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('seller.settings.cattleType')}
          </p>
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() => setHasCow(v => !v)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all min-h-[44px] ${hasCow ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]' : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'}`}
            >
              🐄 {t('common.cow')}
            </button>
            <button
              type="button"
              onClick={() => setHasBuffalo(v => !v)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all min-h-[44px] ${hasBuffalo ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]' : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'}`}
            >
              🐃 {t('common.buffalo')}
            </button>
          </div>
          <Button size="full" variant="outline" loading={savingCattle} onClick={handleSaveCattle}>
            Save
          </Button>
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
