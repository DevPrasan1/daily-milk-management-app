import { useTranslation } from 'react-i18next'
import { useLinkRequests } from '@/hooks/useBuyer'
import { respondToLinkRequest } from '@/services/buyer.service'
import { useApp } from '@/context/AppContext'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Store, Check, X } from 'lucide-react'

export default function LinkRequest() {
  const { t } = useTranslation()
  const { requests, loading } = useLinkRequests()
  const { toast } = useApp()
  const [processing, setProcessing] = useState(null)

  async function handleRespond(requestId, accept) {
    setProcessing(requestId)
    try {
      await respondToLinkRequest(requestId, accept)
      toast(accept ? 'Linked with seller!' : 'Request declined', accept ? 'success' : 'info')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <AppShell showNav={false}>
      <TopBar title="Link Requests" />
      <PageWrapper>
        {loading ? null : requests.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Store className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No pending link requests</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map(req => (
              <Card key={req.id}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1D9E75]/10 flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-[#1D9E75]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Seller wants to link with you
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Phone: {req.sellerPhone}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Linking allows the seller to track your milk delivery and create bills.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="md"
                    variant="danger"
                    className="flex-1"
                    loading={processing === req.id}
                    onClick={() => handleRespond(req.id, false)}
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </Button>
                  <Button
                    size="md"
                    className="flex-1"
                    loading={processing === req.id}
                    onClick={() => handleRespond(req.id, true)}
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageWrapper>
    </AppShell>
  )
}
