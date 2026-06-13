import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { useLocation } from '@/hooks/useLocation'
import { getNearbySellers, saveUserLocation } from '@/services/location.service'
import { createLinkRequest } from '@/services/buyer.service'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { MapPin, Navigation, Store, Send } from 'lucide-react'

export default function NearbySellers() {
  const { t } = useTranslation()
  const { user, userProfile } = useAuth()
  const { toast } = useApp()
  const { coords, loading: locLoading, error: locError, getLocation } = useLocation()

  const [sellers, setSellers] = useState([])
  const [fetching, setFetching] = useState(false)
  const [requested, setRequested] = useState(new Set())
  const [requesting, setRequesting] = useState(null)

  useEffect(() => {
    if (!coords) return
    setFetching(true)
    saveUserLocation(user.uid, coords.lat, coords.lng).catch(() => {})
    getNearbySellers(coords.lat, coords.lng, 10)
      .then(setSellers)
      .catch(() => toast('Could not fetch nearby sellers', 'error'))
      .finally(() => setFetching(false))
  }, [coords])

  async function handleRequest(seller) {
    setRequesting(seller.id)
    try {
      await createLinkRequest(
        seller.phone,
        userProfile?.phone || user.phoneNumber,
        seller.id,
        user.uid
      )
      setRequested(prev => new Set([...prev, seller.id]))
      toast('Link request sent!', 'success')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setRequesting(null)
    }
  }

  return (
    <AppShell>
      <TopBar title={t('buyer.nearby.title')} showBack={false} />
      <PageWrapper>
        {!coords && !locLoading && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1D9E75]/10 flex items-center justify-center mb-4">
              <Navigation className="w-8 h-8 text-[#1D9E75]" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Find sellers near you
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              Allow location access to discover milk sellers in your area
            </p>
            <Button onClick={getLocation}>
              <MapPin className="w-4 h-4" />
              Allow Location
            </Button>
            {locError && (
              <p className="text-xs text-red-500 mt-3">{locError}</p>
            )}
          </div>
        )}

        {(locLoading || fetching) && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">
              {locLoading ? 'Getting your location...' : t('buyer.nearby.findingSellers')}
            </p>
          </div>
        )}

        {coords && !fetching && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing sellers within 10 km
              </p>
              <button
                onClick={getLocation}
                className="ml-auto text-xs text-[#1D9E75] font-medium"
              >
                Refresh
              </button>
            </div>

            {sellers.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Store className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">{t('buyer.nearby.noSellers')}</p>
                <p className="text-xs text-gray-400 mt-1">Try increasing the search radius</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sellers.map(seller => (
                  <Card key={seller.id}>
                    <div className="flex items-center gap-3">
                      <Avatar name={seller.name} photo={seller.photo} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {seller.name}
                        </p>
                        {seller.about && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {seller.about}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-400">
                            {seller.distance < 1
                              ? `${Math.round(seller.distance * 1000)}m`
                              : `${seller.distance.toFixed(1)} km`}{' '}
                            {t('buyer.nearby.distance')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="full"
                      variant={requested.has(seller.id) ? 'secondary' : 'outline'}
                      className="mt-3"
                      disabled={requested.has(seller.id)}
                      loading={requesting === seller.id}
                      onClick={() => handleRequest(seller)}
                    >
                      {requested.has(seller.id) ? (
                        '✓ Request Sent'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t('buyer.nearby.requestLink')}
                        </>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </AppShell>
  )
}
