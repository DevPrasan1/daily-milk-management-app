import { useState, useEffect, useCallback } from 'react'
import { getRecordsForMonth } from '@/services/record.service'
import { getPaymentsForMonth } from '@/services/billing.service'
import { calcBillSummary } from '@/services/billing.service'

export function useMonthRecords(sellerId, buyerId, year, month, pricePerLitre = 0) {
  const [records, setRecords] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!sellerId || !buyerId || year == null || month == null) return
    setLoading(true)
    try {
      const [recs, pays] = await Promise.all([
        getRecordsForMonth(sellerId, buyerId, year, month),
        getPaymentsForMonth(sellerId, buyerId, year, month),
      ])
      setRecords(recs)
      setPayments(pays)
    } finally {
      setLoading(false)
    }
  }, [sellerId, buyerId, year, month])

  useEffect(() => { load() }, [load])

  const summary = calcBillSummary(records, pricePerLitre, payments)

  return { records, payments, loading, summary, reload: load }
}
