import { formatAmount, formatLitres } from './milkUtils'
import { formatMonthYear } from './dateUtils'

export function buildWhatsAppBillMessage(buyerName, monthDate, summary, records, getPrice) {
  const month = formatMonthYear(monthDate)

  const cowRecords = records.filter(r => r.cattleType === 'cow')
  const buffaloRecords = records.filter(r => r.cattleType === 'buffalo')

  const cowLitres = cowRecords.reduce((sum, r) => sum + (r.total || 0), 0)
  const buffaloLitres = buffaloRecords.reduce((sum, r) => sum + (r.total || 0), 0)

  const cowPrice = getPrice('cow')
  const buffaloPrice = getPrice('buffalo')

  const lines = [
    `🥛 *MilkBook Bill — ${month}*`,
    ``,
    `👤 Buyer: *${buyerName}*`,
    ``,
    `📊 *Deliveries*`,
  ]

  if (cowLitres > 0) {
    lines.push(`🐄 Cow: ${formatLitres(cowLitres)} @ ₹${cowPrice}/L = ${formatAmount(cowLitres * cowPrice)}`)
  }
  if (buffaloLitres > 0) {
    lines.push(`🐃 Buffalo: ${formatLitres(buffaloLitres)} @ ₹${buffaloPrice}/L = ${formatAmount(buffaloLitres * buffaloPrice)}`)
  }

  lines.push(
    ``,
    `📊 *Summary*`,
    `• Total amount: *${formatAmount(summary.totalAmount)}*`,
    `• Paid: ${formatAmount(summary.totalPaid)}`,
    `• *Balance due: ${formatAmount(summary.remaining)}*`,
    ``,
    `_Sent via MilkBook — Apna dudh, apna hisaab_`
  )

  return lines.join('\n')
}

export function shareOnWhatsApp(phone, message) {
  const cleaned = phone ? phone.replace(/\D/g, '') : ''
  const encoded = encodeURIComponent(message)
  const url = cleaned
    ? `https://wa.me/91${cleaned}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`
  window.open(url, '_blank')
}
