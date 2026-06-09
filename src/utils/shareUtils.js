import { formatAmount, formatLitres } from './milkUtils'
import { formatMonthYear } from './dateUtils'

export function buildWhatsAppBillMessage(buyerName, monthDate, summary, pricePerLitre, cattleType) {
  const month = formatMonthYear(monthDate)
  const cattle = cattleType === 'cow' ? '🐄 Cow' : '🐃 Buffalo'

  const lines = [
    `🥛 *MilkBook Bill — ${month}*`,
    ``,
    `👤 Buyer: *${buyerName}*`,
    `🐄 Type: ${cattle}`,
    ``,
    `📊 *Summary*`,
    `• Total delivered: ${formatLitres(summary.totalLitres)}`,
    `• Price: ₹${pricePerLitre}/L`,
    `• Total amount: *${formatAmount(summary.totalAmount)}*`,
    `• Paid: ${formatAmount(summary.totalPaid)}`,
    `• *Balance due: ${formatAmount(summary.remaining)}*`,
    ``,
    `_Sent via MilkBook — Apna dudh, apna hisaab_`,
  ]

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
