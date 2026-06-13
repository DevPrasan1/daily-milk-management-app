import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useLinkedSellers, useLinkRequests } from '@/hooks/useBuyer'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import SellerCard from '@/components/buyer/SellerCard'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Milk, IndianRupee, Store, MapPin, Bell } from 'lucide-react'

export default function BuyerDashboard() {
  const { t } = useTranslation()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const { sellers, loading } = useLinkedSellers()
  const { requests } = useLinkRequests()

  return (
    <AppShell>
      <TopBar
        showBack={false}
        title={t('buyer.dashboard.title')}
        action={
          <div className="flex items-center gap-1">
            {requests.length > 0 && (
              <button
                onClick={() => navigate('/buyer/link-requests')}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            )}
            <Avatar name={userProfile?.name} size="sm" />
          </div>
        }
      />
      <PageWrapper>
        <div className="mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back 👋</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {userProfile?.name || '—'}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Milk, label: t('buyer.dashboard.totalLitres'), value: '0 L' },
            { icon: IndianRupee, label: t('buyer.dashboard.amountDue'), value: '₹0' },
          ].map(({ icon: Icon, label, value }) => (
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
            {t('buyer.dashboard.mySellers')}
          </p>
        </div>

        {loading ? null : sellers.length === 0 ? (
          <Card className="flex flex-col items-center py-8 text-center">
            <Store className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No sellers linked yet</p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => navigate('/buyer/nearby')}
            >
              <MapPin className="w-4 h-4" />
              Find Nearby Sellers
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {sellers.map(s => (
              <SellerCard
                key={s.id}
                seller={s}
                onClick={() => navigate('/buyer/records')}
              />
            ))}
          </div>
        )}
      </PageWrapper>
    </AppShell>
  )
}
