import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatMonthYear,
  getMonthKey,
  getDaysInMonth,
  getLastNMonths,
  isToday,
  getLocalDateString
} from './dateUtils'

describe('dateUtils.js utilities', () => {
  beforeEach(() => {
    // Set system time to a fixed date for deterministic testing of relative/today features.
    // e.g., July 14, 2026
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-14T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDate', () => {
    it('should format Date instance to Indian local format with day of week', () => {
      const date = new Date('2026-07-14T00:00:00Z')
      const formatted = formatDate(date)
      expect(formatted).toContain('14')
      expect(formatted).toContain('Jul')
      expect(formatted).toContain('2026')
      // weekday could be Tue or Tuesday depending on locale config, but let's test if it contains parts
      expect(formatted).toMatch(/14\s+Jul\s+2026\s+\|\s+Tue/)
    })

    it('should handle Firebase Timestamps with toDate()', () => {
      const mockTimestamp = {
        toDate: () => new Date('2026-07-15T00:00:00Z')
      }
      const formatted = formatDate(mockTimestamp)
      expect(formatted).toMatch(/15\s+Jul\s+2026\s+\|\s+Wed/)
    })

    it('should return empty string for invalid dates', () => {
      expect(formatDate(new Date('invalid'))).toBe('')
      expect(formatDate(null)).toBe('')
    })
  })

  describe('formatMonthYear', () => {
    it('should format Date instance to long month and numeric year', () => {
      const date = new Date('2026-07-14T00:00:00Z')
      expect(formatMonthYear(date)).toBe('July 2026')
    })
  })

  describe('getMonthKey', () => {
    it('should return YYYY-MM formatted string for the given date', () => {
      const date = new Date('2026-07-14T00:00:00Z')
      expect(getMonthKey(date)).toBe('2026-07')

      const dateJan = new Date('2026-01-05T00:00:00Z')
      expect(getMonthKey(dateJan)).toBe('2026-01')
    })

    it('should default to the current system date if no date is provided', () => {
      expect(getMonthKey()).toBe('2026-07')
    })
  })

  describe('getDaysInMonth', () => {
    it('should return the correct number of days in a month', () => {
      // 2026-02 is February (month 1 in JS)
      expect(getDaysInMonth(2026, 1)).toBe(28)
      // 2024-02 is leap year
      expect(getDaysInMonth(2024, 1)).toBe(29)
      // 2026-07 is July (month 6 in JS)
      expect(getDaysInMonth(2026, 6)).toBe(31)
    })
  })

  describe('getLastNMonths', () => {
    it('should return the last N months info including key, label and date object', () => {
      const months = getLastNMonths(3)
      expect(months).toHaveLength(3)

      // index 0 is current month (July 2026)
      expect(months[0].key).toBe('2026-07')
      expect(months[0].label).toBe('July 2026')
      expect(months[0].date.getMonth()).toBe(6) // 0-indexed July is 6

      // index 1 is previous month (June 2026)
      expect(months[1].key).toBe('2026-06')
      expect(months[1].label).toBe('June 2026')

      // index 2 is May 2026
      expect(months[2].key).toBe('2026-05')
      expect(months[2].label).toBe('May 2026')
    })
  })

  describe('isToday', () => {
    it('should return true if the given date matches today', () => {
      expect(isToday(new Date())).toBe(true)
      expect(isToday(new Date('2026-07-14T15:30:00'))).toBe(true)
    })

    it('should return false if the date is not today', () => {
      expect(isToday(new Date('2026-07-13T12:00:00Z'))).toBe(false)
      expect(isToday(new Date('2026-07-15T12:00:00Z'))).toBe(false)
    })
  })

  describe('getLocalDateString', () => {
    it('should format date to YYYY-MM-DD string', () => {
      const date = new Date('2026-07-14T12:00:00Z')
      expect(getLocalDateString(date)).toBe('2026-07-14')

      const dateJan = new Date('2026-01-05T03:00:00Z')
      expect(getLocalDateString(dateJan)).toBe('2026-01-05')
    })

    it('should return empty string for invalid dates', () => {
      expect(getLocalDateString(new Date('invalid'))).toBe('')
      expect(getLocalDateString(null)).toBe('')
    })
  })
})
