import { formatAmount, formatLitres } from '@/utils/milkUtils'
import { useTranslation } from 'react-i18next'
import Card from '@/components/ui/Card'

export default function BillSummary({ summary }) {
  const { t } = useTranslation()
  const { totalLitres, totalAmount, totalPaid, remaining } = summary

  const rows = [
    { label: t('seller.billing.totalAmount'), value: formatAmount(totalAmount), color: 'text-gray-900 dark:text-white' },
    { label: t('seller.billing.amountPaid'), value: formatAmount(totalPaid), color: 'text-emerald-600' },
    { label: t('seller.billing.balanceDue'), value: formatAmount(remaining), color: remaining > 0 ? 'text-red-500' : 'text-emerald-600' },
  ]

  return (
    <Card>
      <p className="text-xs text-gray-400 mb-3">{formatLitres(totalLitres)} total delivered</p>
      <div className="space-y-2">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className={`text-sm font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
