import { describe, it, expect } from 'vitest'
import {
  calcTotal,
  calcAmount,
  formatLitres,
  formatAmount,
  isAbnormal,
  groupRecordsByDate
} from './milkUtils'

describe('milkUtils.js utilities', () => {
  describe('calcTotal', () => {
    it('should sum morning and evening milk quantities and round to 2 decimals', () => {
      expect(calcTotal(1.5, 2.3)).toBe(3.8)
      expect(calcTotal(1.333, 2.666)).toBe(4.0)
      expect(calcTotal()).toBe(0)
      expect(calcTotal(2.5)).toBe(2.5)
      expect(calcTotal(undefined, 3.1)).toBe(3.1)
    })
  })

  describe('calcAmount', () => {
    it('should multiply litres and price, rounding to 2 decimals', () => {
      expect(calcAmount(2.5, 60)).toBe(150)
      expect(calcAmount(1.33, 55)).toBe(73.15)
      expect(calcAmount(0, 50)).toBe(0)
    })
  })

  describe('formatLitres', () => {
    it('should format litres value with one decimal place and "L" suffix', () => {
      expect(formatLitres(5)).toBe('5.0L')
      expect(formatLitres(3.75)).toBe('3.8L')
      expect(formatLitres(0)).toBe('0.0L')
    })

    it('should return long dash for undefined/null/empty values', () => {
      expect(formatLitres(null)).toBe('—')
      expect(formatLitres(undefined)).toBe('—')
    })
  })

  describe('formatAmount', () => {
    it('should format amount as rupee string', () => {
      expect(formatAmount(150)).toBe('₹150')
      expect(formatAmount(73.15)).toBe('₹73.15')
      expect(formatAmount(0)).toBe('₹0')
    })

    it('should return long dash for invalid values', () => {
      expect(formatAmount(null)).toBe('—')
      expect(formatAmount(undefined)).toBe('—')
    })
  })

  describe('isAbnormal', () => {
    it('should return true if difference between actual and expected exceeds 0.5L', () => {
      expect(isAbnormal(2.0, 1.5, 1.0, 1.5)).toBe(true) // morning diff is 1.0
      expect(isAbnormal(1.0, 2.2, 1.0, 1.5)).toBe(true) // evening diff is 0.7
    })

    it('should return false if differences are <= 0.5L', () => {
      expect(isAbnormal(1.5, 1.5, 1.0, 1.0)).toBe(false) // both diffs are 0.5 exactly
      expect(isAbnormal(1.2, 1.3, 1.0, 1.0)).toBe(false) // diffs are 0.2 and 0.3
      expect(isAbnormal(1.0, 1.0, 1.0, 1.0)).toBe(false)
    })

    it('should handle undefined values gracefully', () => {
      expect(isAbnormal(undefined, undefined, 1.0, 1.0)).toBe(true) // 0 vs 1 diff is 1.0
      expect(isAbnormal(1.0, 1.0, undefined, undefined)).toBe(true) // 1 vs 0 diff is 1.0
    })
  })

  describe('groupRecordsByDate', () => {
    it('should group records by date and sort them in descending order', () => {
      const mockRecords = [
        {
          id: 'rec1',
          date: '2026-07-10T10:00:00Z',
          total: 2.5,
          source: 'manual',
          isAbnormal: false,
          manualEditedAt: 1000
        },
        {
          id: 'rec2',
          date: '2026-07-10T18:00:00Z',
          total: 1.5,
          source: 'manual',
          isAbnormal: true,
          manualEditedAt: 2000
        },
        {
          id: 'rec3',
          date: '2026-07-11T09:00:00Z',
          total: 3.0,
          source: 'auto',
          isAbnormal: false
        }
      ]

      const grouped = groupRecordsByDate(mockRecords)

      expect(grouped).toHaveLength(2)

      // First item should be July 11 (descending date sort)
      expect(grouped[0].entries).toHaveLength(1)
      expect(grouped[0].total).toBe(3.0)
      expect(grouped[0].isAbnormal).toBe(false)
      expect(grouped[0].recordIds).toEqual(['rec3'])

      // Second item should be July 10
      expect(grouped[1].entries).toHaveLength(2)
      expect(grouped[1].total).toBe(4.0)
      expect(grouped[1].isAbnormal).toBe(true) // since one of them is abnormal
      expect(grouped[1].recordIds).toEqual(['rec1', 'rec2'])
      expect(grouped[1].manualEditedAt).toBe(2000) // latest edit time
    })

    it('should handle Firebase Timestamps containing toDate method', () => {
      const mockTimestampDate = {
        toDate: () => new Date('2026-07-12T08:00:00Z')
      }
      const mockRecords = [
        {
          id: 'rec1',
          date: mockTimestampDate,
          total: 2.0
        }
      ]
      const grouped = groupRecordsByDate(mockRecords)
      expect(grouped).toHaveLength(1)
      expect(grouped[0].total).toBe(2.0)
    })
  })
})
