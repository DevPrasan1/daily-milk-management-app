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
