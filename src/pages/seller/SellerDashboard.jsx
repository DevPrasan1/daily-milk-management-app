import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useBuyerList } from '@/hooks/useSeller'
import { useAutoRecord } from '@/hooks/useAutoRecord'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import BuyerCard from '@/components/seller/BuyerCard'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Users, Milk, IndianRupee, ClipboardList, Plus } from 'lucide-react'

export default function SellerDashboard() {
  const { t } = useTranslation()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const { buyers, loading } = useBuyerList()
  useAutoRecord()

  const activeBuyers = buyers.filter(b => b.status === 'active')
  const totalDailyLitres = activeBuyers.reduce((sum, b) => {
    const cow = (b.morning?.cow ?? 0) + (b.evening?.cow ?? 0)
    const buf = (b.morning?.buffalo ?? 0) + (b.evening?.buffalo ?? 0)
    return sum + cow + buf
  }, 0)

  const stats = [
    { icon: Users, label: t('seller.dashboard.totalBuyers'), value: String(activeBuyers.length) },
    { icon: Milk, label: t('seller.dashboard.todayDelivery'), value: `${totalDailyLitres.toFixed(1)}L` },
    { icon: IndianRupee, label: t('seller.dashboard.pendingPayments'), value: '—' },
    { icon: ClipboardList, label: t('seller.dashboard.todayEntry'), value: `0/${activeBuyers.length}` },
  ]

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppShell>
      <TopBar
        showBack={false}
        title={t('seller.dashboard.title')}
        action={<Avatar name={userProfile?.name} size="sm" />}
      />
      <PageWrapper>
        <div className="mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{greeting} 👋</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {userProfile?.name || '—'}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#1D9E75]" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('seller.buyers.title')}
          </p>
          <Button size="sm" variant="ghost" onClick={() => navigate('/seller/buyers')}>
            {t('seller.dashboard.viewAll')}
          </Button>
        </div>

        {loading ? null : buyers.length === 0 ? (
          <Card className="flex flex-col items-center py-8 text-center">
            <Users className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{t('seller.buyers.emptyTitle')}</p>
            <Button size="sm" className="mt-3" onClick={() => navigate('/seller/buyers/add')}>
              <Plus className="w-4 h-4" />
              {t('seller.buyers.addBuyer')}
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {buyers.slice(0, 3).map(b => (
              <BuyerCard key={b.id} buyer={b} />
            ))}
            {buyers.length > 3 && (
              <button
                onClick={() => navigate('/seller/buyers')}
                className="text-sm text-[#1D9E75] text-center py-2 font-medium"
              >
                +{buyers.length - 3} more buyers
              </button>
            )}
          </div>
        )}
      </PageWrapper>
    </AppShell>
  )
}
