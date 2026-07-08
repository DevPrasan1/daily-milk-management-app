import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Milk, ClipboardList, Receipt, Globe, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import AppShell from '@/components/layout/AppShell'

const features = [
  { icon: ClipboardList, key: 'feature1' },
  { icon: Receipt, key: 'feature2' },
  { icon: Globe, key: 'feature3' },
  { icon: Eye, key: 'feature4' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <AppShell showNav={false}>
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900 flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#1D9E75] flex items-center justify-center mb-6 shadow-lg">
            <Milk className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            MilkBook
          </h1>
          <p className="text-lg text-[#1D9E75] font-medium mb-2">{t('landing.tagline')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            {t('landing.subtitle')}
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3 mb-8">
            {features.map(({ icon: Icon, key }) => (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-[#1D9E75]" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t(`landing.${key}Title`)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t(`landing.${key}Desc`)}
                </p>
              </div>
            ))}
          </div>

          <Button size="full" onClick={() => navigate('/login')}>
            {t('landing.loginBtn')}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-4">{t('landing.alreadyAccount')}</p>
        </div>
      </div>
    </AppShell>
  )
}
