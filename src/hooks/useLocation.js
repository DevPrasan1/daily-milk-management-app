import { useState, useCallback } from 'react'

export function useLocation() {
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchIPLocation = useCallback(async () => {
    try {
      const res = await fetch('https://ipapi.co/json/')
      if (res.ok) {
        const data = await res.json()
        if (data.latitude && data.longitude) {
          setCoords({ lat: data.latitude, lng: data.longitude })
          return true
        }
      }
    } catch (e) {
      console.error('IP Geolocation failed:', e)
    }
    return false
  }, [])

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      async err => {
        console.warn('Native geolocation failed, trying IP fallback...', err)
        const success = await fetchIPLocation()
        if (!success) {
          setError(err.message)
        }
        setLoading(false)
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [fetchIPLocation])

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
