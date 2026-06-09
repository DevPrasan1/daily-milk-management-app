export function formatDate(date) {
  const d = date instanceof Date ? date : date?.toDate?.() ?? new Date(date)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatMonthYear(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export function getMonthKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getLastNMonths(n = 6) {
  const months = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: getMonthKey(d), label: formatMonthYear(d), date: d })
  }
  return months
}

export function isToday(date) {
  const d = date instanceof Date ? date : date?.toDate?.() ?? new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}
