import { useState, useEffect, useRef } from 'react'
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
import L from 'leaflet'
import { CATTLE_OPTIONS } from '@/utils/constants'

export default function NearbySellers() {
  const { t, i18n } = useTranslation()
  const { user, userProfile } = useAuth()
  const { toast } = useApp()
  const { coords, setCoords, loading: locLoading, error: locError, getLocation } = useLocation()

  const [sellers, setSellers] = useState([])
  const [fetching, setFetching] = useState(false)
  const [requested, setRequested] = useState(new Set())
  const [requesting, setRequesting] = useState(null)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [activeTab, setActiveTab] = useState('map') // 'map' | 'list'

  const mapRef = useRef(null)
  const mapDivRef = useRef(null)
  const isHindi = i18n.language === 'hi'

  useEffect(() => {
    if (activeTab === 'map' && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize()
      }, 50)
    }
  }, [activeTab])

  useEffect(() => {
    if (!coords) return
    setFetching(true)
    saveUserLocation(user.uid, coords.lat, coords.lng).catch(() => { })
    getNearbySellers(coords.lat, coords.lng, 10)
      .then(setSellers)
      .catch(() => toast('Could not fetch nearby sellers', 'error'))
      .finally(() => setFetching(false))
  }, [coords])

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!coords || !mapDivRef.current) return

    // Create Map
    const mapInstance = L.map(mapDivRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([coords.lat, coords.lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)

    // Force Leaflet to recalculate container size
    const timer = setTimeout(() => {
      mapInstance.invalidateSize()
    }, 100)

    // Set up marker layer group
    const markerGroup = L.layerGroup().addTo(mapInstance)

    // Add Buyer Location Marker (Blue)
    const buyerMarkerIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg text-white text-sm">📍</div>`,
      className: 'custom-buyer-marker-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })
    L.marker([coords.lat, coords.lng], { icon: buyerMarkerIcon })
      .addTo(markerGroup)
      .bindPopup(isHindi ? 'आप यहाँ हैं' : 'You are here')

    // Add Seller Location Markers (Green)
    sellers.forEach(seller => {
      if (!seller.gpsLocation) return
      const lat = seller.gpsLocation.latitude
      const lng = seller.gpsLocation.longitude

      const sellerMarkerIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#1D9E75] border-2 border-white shadow-lg text-white text-sm">🐄</div>`,
        className: 'custom-seller-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const marker = L.marker([lat, lng], { icon: sellerMarkerIcon }).addTo(markerGroup)

      marker.on('click', () => {
        setSelectedSeller(seller)
      })
    })

    mapRef.current = mapInstance

    return () => {
      clearTimeout(timer)
      mapInstance.remove()
      mapRef.current = null
    }
  }, [coords, sellers, isHindi])

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
              {t('buyer.nearby.findSellersHeading')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              {t('buyer.nearby.locationAccessDesc')}
            </p>
            <Button onClick={getLocation}>
              <MapPin className="w-4 h-4" />
              {t('buyer.nearby.allowLocationBtn')}
            </Button>
            {locError && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-xs text-red-500">{locError}</p>
                {/* <button
                  onClick={() => setCoords({ lat: 28.6139, lng: 77.2090 })}
                  className="text-xs text-[#1D9E75] font-semibold hover:underline min-h-[32px] px-3 mt-1"
                >
                  {t('buyer.nearby.testModeLocation')}
                </button> */}
              </div>
            )}
          </div>
        )}

        {(locLoading || fetching) && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">
              {locLoading ? t('buyer.nearby.gettingLocation') : t('buyer.nearby.findingSellers')}
            </p>
          </div>
        )}

        {coords && !fetching && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#1D9E75]" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isHindi ? '10 किमी के भीतर विक्रेता दिखा रहे हैं' : 'Showing sellers within 10 km'}
              </p>
              <button
                onClick={getLocation}
                className="ml-auto text-xs text-[#1D9E75] font-medium"
              >
                {isHindi ? 'रिफ्रेश' : 'Refresh'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'map'
                  ? 'bg-white dark:bg-gray-700 text-[#1D9E75] shadow-xs font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {isHindi ? 'मैप व्यू' : 'Map View'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'list'
                  ? 'bg-white dark:bg-gray-700 text-[#1D9E75] shadow-xs font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {isHindi ? 'लिस्ट व्यू' : 'List View'}
              </button>
            </div>

            {/* Map View */}
            <div className={activeTab === 'map' ? 'block' : 'hidden'}>
              <div className="w-full relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm mb-5 z-0">
                <div
                  ref={mapDivRef}
                  style={{ height: 'calc(100dvh - 240px)', minHeight: '350px', width: '100%' }}
                  className="w-full bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>

            {/* List View */}
            <div className={activeTab === 'list' ? 'block' : 'hidden'}>
              {sellers.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Store className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">{t('buyer.nearby.noSellers')}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isHindi ? 'खोज दायरा बढ़ाने का प्रयास करें' : 'Try increasing the search radius'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    {isHindi ? 'सभी विक्रेता सूची' : 'All Sellers List'}
                  </p>
                  {sellers.map(seller => (
                    <Card
                      key={seller.id}
                      onClick={() => setSelectedSeller(seller)}
                      className="cursor-pointer hover:border-[#1D9E75]/30 active:scale-[0.99] transition-all font-medium"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={seller.name} photo={seller.photo} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {seller.name}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {seller.distance < 1
                                ? `${Math.round(seller.distance * 1000)}m`
                                : `${seller.distance.toFixed(1)} km`}
                            </span>
                          </div>
                          {seller.about && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {seller.about}
                            </p>
                          )}
                          {/* Cattle Types Info */}
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {CATTLE_OPTIONS.filter(opt => {
                              if (opt.value === 'cow') return seller.hasCow
                              if (opt.value === 'buffalo') return seller.hasBuffalo
                              if (opt.value === 'goat') return seller.hasGoat
                              if (opt.value === 'camel') return seller.hasCamel
                              return false
                            }).map(opt => (
                              <span
                                key={opt.value}
                                className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium"
                              >
                                {isHindi ? opt.labelHi : opt.labelEn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </PageWrapper>
      {/* Bottom Sheet */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedSeller(null)}
          />
          {/* Sheet */}
          <div className="relative w-full max-w-[390px] bg-white dark:bg-gray-900 rounded-t-3xl p-6 z-10 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />

            <div className="flex items-center gap-3 mb-4">
              <Avatar name={selectedSeller.name} photo={selectedSeller.photo} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                    {selectedSeller.name}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${selectedSeller.openToSell !== false
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                    }`}>
                    {selectedSeller.openToSell !== false
                      ? (isHindi ? 'बिक्री चालू' : 'Open to Sell')
                      : (isHindi ? 'बंद' : 'Closed')}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedSeller.distance < 1
                      ? `${Math.round(selectedSeller.distance * 1000)}m`
                      : `${selectedSeller.distance.toFixed(1)} km`}{' '}
                    {t('buyer.nearby.distance')}
                  </span>
                </div>
              </div>
            </div>

            {selectedSeller.about && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {isHindi ? 'डेयरी के बारे में' : 'About Dairy'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {selectedSeller.about}
                </p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {t('onboarding.cattleTypeLabel')}
              </p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {CATTLE_OPTIONS.filter(opt => {
                  if (opt.value === 'cow') return selectedSeller.hasCow
                  if (opt.value === 'buffalo') return selectedSeller.hasBuffalo
                  if (opt.value === 'goat') return selectedSeller.hasGoat
                  if (opt.value === 'camel') return selectedSeller.hasCamel
                  return false
                }).map(opt => (
                  <span key={opt.value} className="text-xs bg-[#1D9E75]/10 text-[#1D9E75] px-2.5 py-1 rounded-full font-medium">
                    {isHindi ? opt.labelHi : opt.labelEn}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {t('common.phone')}
              </p>
              <a
                href={`tel:${selectedSeller.phone}`}
                className="text-sm text-[#1D9E75] hover:underline font-semibold"
              >
                {selectedSeller.phone}
              </a>
            </div>

            <div className="flex gap-3">
              <Button
                size="full"
                variant="outline"
                onClick={() => {
                  if (selectedSeller.gpsLocation) {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${selectedSeller.gpsLocation.latitude},${selectedSeller.gpsLocation.longitude}`,
                      '_blank'
                    )
                  }
                }}
                className={userProfile?.role === 'seller' ? 'w-full' : ''}
              >
                {isHindi ? 'दिशा निर्देश' : 'Get Directions'}
              </Button>
              {userProfile?.role !== 'seller' && (
                <Button
                  size="full"
                  variant={requested.has(selectedSeller.id) ? 'secondary' : 'primary'}
                  disabled={requested.has(selectedSeller.id)}
                  loading={requesting === selectedSeller.id}
                  onClick={() => handleRequest(selectedSeller)}
                >
                  {requested.has(selectedSeller.id) ? '✓ Requested' : t('buyer.nearby.requestLink')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
