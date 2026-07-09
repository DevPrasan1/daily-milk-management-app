import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useLocation() {
  const { t } = useTranslation()
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t('location.errUnknown'))
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      err => {
        let msg = t('location.errUnknown')
        if (err.code === 1) {
          msg = t('location.errDenied')
        } else if (err.code === 2) {
          msg = t('location.errUnavailable')
        } else if (err.code === 3) {
          msg = t('location.errTimeout')
        }
        setError(msg)
        setLoading(false)
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [t])

  return { coords, setCoords, loading, error, getLocation }
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
