import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import AutoModeToggle from '@/components/seller/AutoModeToggle'
import Button from '@/components/ui/Button'
import { LogOut, Globe } from 'lucide-react'
import i18n from '@/i18n/index.js'

export default function BuyerProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  function toggleLanguage() {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('milkbook_lang', next)
  }

  async function handleLogout() {
    if (window.confirm(t('common.logoutConfirm'))) {
      await signOut(auth)
      navigate('/')
    }
  }

  return (
    <AppShell>
      <TopBar title="Profile" showBack={false} />
      <PageWrapper>
        <Card className="flex items-center gap-3 mb-4">
          <Avatar name={userProfile?.name} size="lg" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{userProfile?.name}</p>
            <p className="text-xs text-gray-400">{user?.phoneNumber}</p>
          </div>
        </Card>

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

        <Button size="full" variant="danger" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          {t('seller.settings.logout')}
        </Button>
      </PageWrapper>
    </AppShell>
  )
}
