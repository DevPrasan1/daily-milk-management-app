import { useState } from 'react'
import { clsx } from 'clsx'
import { AlertTriangle, Info, Trash2 } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import { formatLitres } from '@/utils/milkUtils'

export default function RecordCard({ record, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const date = record.date?.toDate ? record.date.toDate() : new Date(record.date)
  const editedAt = record.manualEditedAt?.toDate ? record.manualEditedAt.toDate() : null

  return (
    <div
      className={clsx(
        'px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0',
        record.isAbnormal && 'bg-amber-50/50 dark:bg-amber-900/10'
      )}
    >
      <div className="flex items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(date)}
            </p>
            {record.isAbnormal && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            )}
            {editedAt && (
              <button
                onClick={() => setShowInfo(v => !v)}
                className="text-blue-400 hover:text-blue-500"
                title="Manually edited"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-4 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              M: {formatLitres(record.morning)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              E: {formatLitres(record.evening)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatLitres(record.total)}
            </p>
            <p className="text-xs text-gray-400 capitalize">{record.source}</p>
          </div>

          {onDelete && (
            confirmDelete ? (
              <div className="flex flex-col items-end gap-0.5 ml-2">
                <button
                  onClick={() => { setConfirmDelete(false); onDelete(record.id) }}
                  className="text-xs font-semibold text-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="ml-2 p-1 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {showInfo && editedAt && (
        <p className="text-xs text-blue-400 mt-1">
          Edited: {editedAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}
