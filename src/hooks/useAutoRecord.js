import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { runAutoRecordsForSeller } from '@/services/autoRecord.service'

export function useAutoRecord() {
  const { user, userProfile } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (!user || userProfile?.role !== 'seller' || ran.current) return
    ran.current = true
    runAutoRecordsForSeller(user.uid).catch(() => {})
  }, [user, userProfile])
}
