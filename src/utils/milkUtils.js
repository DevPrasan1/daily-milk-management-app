export function calcTotal(morning = 0, evening = 0) {
  return parseFloat((morning + evening).toFixed(2))
}

export function calcAmount(litres, pricePerLitre) {
  return parseFloat((litres * pricePerLitre).toFixed(2))
}

export function formatLitres(val) {
  if (!val && val !== 0) return '—'
  return `${parseFloat(val).toFixed(1)}L`
}

export function formatAmount(val) {
  if (!val && val !== 0) return '—'
  return `₹${parseFloat(val).toFixed(0)}`
}

export function isAbnormal(morning, evening, setMorning, setEvening) {
  const morningDiff = Math.abs((morning ?? 0) - (setMorning ?? 0))
  const eveningDiff = Math.abs((evening ?? 0) - (setEvening ?? 0))
  return morningDiff > 0.5 || eveningDiff > 0.5
}

export function groupRecordsByDate(records) {
  const groups = {}
  records.forEach(r => {
    const dateObj = r.date?.toDate ? r.date.toDate() : new Date(r.date)
    const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
    if (!groups[dateKey]) {
      groups[dateKey] = {
        id: r.id, // For key prop
        date: dateObj,
        entries: [],
        total: 0,
        source: r.source,
        isAbnormal: false,
        recordIds: [],
        manualEditedAt: null,
      }
    }
    groups[dateKey].entries.push(r)
    groups[dateKey].total += r.total || 0
    groups[dateKey].recordIds.push(r.id)
    if (r.isAbnormal) groups[dateKey].isAbnormal = true
    if (r.manualEditedAt) {
      if (!groups[dateKey].manualEditedAt || r.manualEditedAt > groups[dateKey].manualEditedAt) {
        groups[dateKey].manualEditedAt = r.manualEditedAt
      }
    }
  })
  return Object.values(groups).sort((a, b) => b.date - a.date)
}
