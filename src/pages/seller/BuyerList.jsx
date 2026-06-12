import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Users } from 'lucide-react'
import { useBuyerList } from '@/hooks/useSeller'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import BuyerCard from '@/components/seller/BuyerCard'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'

export default function BuyerList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { buyers, loading } = useBuyerList()

  if (loading) return <FullPageSpinner />

  return (
    <AppShell>
      <TopBar
        title={t('seller.buyers.title')}
        showBack={false}
        action={
          <Button size="sm" onClick={() => navigate('/seller/buyers/add')}>
            <Plus className="w-4 h-4" />
            {t('seller.buyers.addBuyer')}
          </Button>
        }
      />
      <PageWrapper>
        {buyers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('seller.buyers.emptyTitle')}
            description={t('seller.buyers.emptyDesc')}
            action={() => navigate('/seller/buyers/add')}
            actionLabel={t('seller.buyers.addBuyer')}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {buyers.map(b => (
              <BuyerCard key={b.id} buyer={b} />
            ))}
          </div>
        )}
      </PageWrapper>
    </AppShell>
  )
}
