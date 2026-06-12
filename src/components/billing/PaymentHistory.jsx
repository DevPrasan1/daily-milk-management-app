import { formatDate } from '@/utils/dateUtils'
import { formatAmount } from '@/utils/milkUtils'
import { IndianRupee } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PaymentHistory({ payments }) {
  const { t } = useTranslation()

  if (!payments.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">No payments recorded yet</p>
    )
  }

  return (
    <div className="space-y-2">
      {payments.map(p => {
        const date = p.date?.toDate ? p.date.toDate() : new Date(p.date)
        return (
          <div key={p.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatAmount(p.amount)}
              </p>
              {p.note && (
                <p className="text-xs text-gray-400 truncate">{p.note}</p>
              )}
            </div>
            <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(date)}</p>
          </div>
        )
      })}
    </div>
  )
}
