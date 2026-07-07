import { useState, useEffect, useCallback } from 'react'
import { getRecordsForMonth, getBuyerSelfRecords } from '@/services/record.service'
import { getPaymentsForMonth } from '@/services/billing.service'
import { calcBillSummary } from '@/services/billing.service'

export function useMonthRecords(sellerId, buyerId, year, month, pricePerLitre = 0, isBuyer = false, buyerUserId = null) {
  const [records, setRecords] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  console.log({ records })
  const load = useCallback(async () => {
    if (!sellerId || !buyerId || year == null || month == null) {
      setRecords([])
      setPayments([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const promises = [
        getRecordsForMonth(sellerId, buyerId, year, month),
        getPaymentsForMonth(sellerId, buyerId, year, month),
      ]
      if (isBuyer && buyerUserId) {
        promises.push(getBuyerSelfRecords(buyerUserId, sellerId, year, month))
      }

      const [recs, pays, selfRecs = []] = await Promise.all(promises)
      const mergedRecs = [...recs, ...selfRecs].sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
        return dateA - dateB
      })

      setRecords(mergedRecs)
      setPayments(pays)
    } finally {
      setLoading(false)
    }
  }, [sellerId, buyerId, year, month, isBuyer, buyerUserId])

  useEffect(() => { load() }, [load])

  const summary = calcBillSummary(records, pricePerLitre, payments)

  return { records, payments, loading, summary, reload: load }
}
