import { describe, it, expect, vi } from 'vitest'

// Mock firebase/firestore so we don't call real Firebase methods or need full Firestore setup during unit tests.
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => date),
  },
  serverTimestamp: vi.fn(),
  deleteDoc: vi.fn(),
}))

vi.mock('@/config/firebase', () => ({
  db: {}
}))

import { calcBillSummary } from './billing.service'

describe('billing.service.js', () => {
  describe('calcBillSummary', () => {
    it('should correctly calculate totals with standard values', () => {
      const records = [
        { total: 2.5 },
        { total: 3.0 },
        { total: 1.5 }
      ]
      const pricePerLitre = 60
      const payments = [
        { amount: 100 },
        { amount: 150 }
      ]

      const result = calcBillSummary(records, pricePerLitre, payments)

      expect(result.totalLitres).toBe(7.0) // 2.5 + 3.0 + 1.5 = 7.0
      expect(result.totalAmount).toBe(420) // 7.0 * 60 = 420
      expect(result.totalPaid).toBe(250) // 100 + 150 = 250
      expect(result.remaining).toBe(170) // 420 - 250 = 170
    })

    it('should handle empty records and payments', () => {
      const result = calcBillSummary([], 60, [])
      expect(result.totalLitres).toBe(0)
      expect(result.totalAmount).toBe(0)
      expect(result.totalPaid).toBe(0)
      expect(result.remaining).toBe(0)
    })

    it('should handle decimals correctly and round to 2 decimals', () => {
      const records = [
        { total: 1.33 },
        { total: 2.66 }
      ]
      const pricePerLitre = 55.5
      const payments = [
        { amount: 100.25 }
      ]

      const result = calcBillSummary(records, pricePerLitre, payments)

      // totalLitres = 1.33 + 2.66 = 3.99
      // totalAmount = 3.99 * 55.5 = 221.445 -> rounded to 221.45
      // totalPaid = 100.25
      // remaining = 221.45 - 100.25 = 121.20
      expect(result.totalLitres).toBe(3.99)
      expect(result.totalAmount).toBe(221.45)
      expect(result.totalPaid).toBe(100.25)
      expect(result.remaining).toBe(121.20)
    })

    it('should ignore records or payments without values/totals', () => {
      const records = [
        { total: null },
        { total: undefined },
        { total: 2.0 }
      ]
      const payments = [
        { amount: null },
        { amount: undefined },
        { amount: 50 }
      ]
      const result = calcBillSummary(records, 60, payments)

      expect(result.totalLitres).toBe(2.0)
      expect(result.totalAmount).toBe(120.0)
      expect(result.totalPaid).toBe(50)
      expect(result.remaining).toBe(70.0)
    })
  })
})
