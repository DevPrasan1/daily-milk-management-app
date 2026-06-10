import { useState, useEffect, useCallback } from 'react'
import { getBuyers, getSellerProfile, getSellerPrices } from '@/services/seller.service'
import { useAuth } from '@/context/AuthContext'

export function useBuyerList() {
  const { user } = useAuth()
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getBuyers(user.uid)
      setBuyers(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  return { buyers, loading, error, reload: load }
}

export function useSellerProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getSellerProfile(user.uid)
      setProfile(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])
  return { profile, loading, reload: load }
}

export function useSellerPrices() {
  const { user } = useAuth()
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getSellerPrices(user.uid).then(setPrices).finally(() => setLoading(false))
  }, [user])

  function getPrice(cattleType) {
    const p = prices.find(p => p.buyerId === null && p.cattleType === cattleType)
    return p?.pricePerLitre ?? 0
  }

  return { prices, loading, getPrice }
}
