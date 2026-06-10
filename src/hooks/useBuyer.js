import { useState, useEffect, useCallback } from 'react'
import { getLinkedSellers, getLinkRequests } from '@/services/buyer.service'
import { useAuth } from '@/context/AuthContext'

export function useLinkedSellers() {
  const { user } = useAuth()
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getLinkedSellers(user.uid)
      setSellers(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])
  return { sellers, loading, reload: load }
}

export function useLinkRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getLinkRequests(user.uid).then(setRequests).finally(() => setLoading(false))
  }, [user])

  return { requests, loading }
}
