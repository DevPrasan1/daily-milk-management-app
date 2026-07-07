import { useState } from 'react'
import { formatDate } from '@/utils/dateUtils'
import { formatAmount } from '@/utils/milkUtils'
import { IndianRupee, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PaymentHistory({ payments, onDelete }) {
  const { t } = useTranslation()
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  if (!payments.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">No payments recorded yet</p>
    )
  }

  return (
    <div className="space-y-3">
      {payments.map(p => {
        const date = p.date?.toDate ? p.date.toDate() : new Date(p.date)
        const isConfirming = confirmDeleteId === p.id

        return (
          <div key={p.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatAmount(p.amount)}
              </p>
              {p.note && (
                <p className="text-xs text-gray-400 truncate">{p.note}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="text-xs text-gray-400">{formatDate(date)}</p>
              
              {onDelete && (
                isConfirming ? (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => { setConfirmDeleteId(null); onDelete(p.id) }}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="ml-2 p-1 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 transition-colors"
                    title="Delete payment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
