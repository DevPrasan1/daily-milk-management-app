import { formatLitres, formatAmount } from '@/utils/milkUtils'
import { useTranslation } from 'react-i18next'

export default function MonthSummaryCard({ summary, pricePerLitre }) {
  const { t } = useTranslation()
  const { totalLitres, totalAmount, totalPaid, remaining } = summary

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatLitres(totalLitres)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.total')}</p>
        </div>
        <div className="text-center border-x border-gray-100 dark:border-gray-700">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatAmount(totalAmount)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.amount')}</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${remaining > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {formatAmount(remaining)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.remaining')}</p>
        </div>
      </div>
      {pricePerLitre > 0 && (
        <p className="text-center text-xs text-gray-400">
          ₹{pricePerLitre}/{t('common.perLitre')}
        </p>
      )}
    </div>
  )
}
