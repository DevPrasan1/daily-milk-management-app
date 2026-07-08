import { useState } from 'react'
import { clsx } from 'clsx'
import { AlertTriangle, Info, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate, getLocalDateString } from '@/utils/dateUtils'
import { formatLitres } from '@/utils/milkUtils'
import { useApp } from '@/context/AppContext'

const EMOJIS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  camel: '🐪',
}

export default function RecordCard({ record, onDelete }) {
  const { t } = useTranslation()
  const { state: { panchang } } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const date = record.date?.toDate ? record.date.toDate() : new Date(record.date)
  const editedAt = record.manualEditedAt?.toDate ? record.manualEditedAt.toDate() : null

  const entries = record.entries || [record];

  const dateStr = getLocalDateString(date)
  const panchangEntry = panchang?.[dateStr]
  const panchangText = panchangEntry
    ? `${t(`panchang.${panchangEntry[0]}`)} • ${t(`panchang.${panchangEntry[1]}`)} • ${t(`panchang.${panchangEntry[2]}`)}`
    : ''

  const isAbnormal = false;//record.isAbnormal;

  return (
    <div
      className={clsx(
        'px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0',
        isAbnormal && 'bg-amber-50/50 dark:bg-amber-900/10'
      )}
    >
      {/* Top Row: Date & Global Total & Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatDate(date)}
            </p>
            {isAbnormal && (
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
          {panchangText && (
            <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400/90 leading-tight">
              {panchangText}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* <p className="text-sm font-bold text-[#1D9E75] dark:text-[#2cc191]">
            {formatLitres(record.total)}
          </p> */}
          {/* <p className="text-[10px] text-gray-400 capitalize">{record.source}</p> */}

          {onDelete && (
            confirmDelete ? (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => { setConfirmDelete(false); onDelete(record.recordIds || record.id) }}
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

      {/* Bottom section: Entries List */}
      <div className="space-y-1.5 pl-1 pr-0">
        {entries.map((entry, idx) => (
          <div key={entry.id || idx} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm" title={entry.cattleType}>
                {EMOJIS[entry.cattleType] || '🥛'}
              </span>
              <span className="font-medium capitalize w-14 text-gray-500 dark:text-gray-400">
                {entry.cattleType}:
              </span>
              <span>☀️ {formatLitres(entry.morning)}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>🌙 {formatLitres(entry.evening)}</span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 ml-4">
              {formatLitres(entry.total)}
            </span>
          </div>
        ))}
      </div>

      {/* Comments */}
      {entries.map((entry, idx) => entry.comment && (
        <div key={idx} className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-500 font-medium italic">
          <span>💬</span>
          <span>{entry.comment}</span>
        </div>
      ))}

      {showInfo && editedAt && (
        <p className="text-xs text-blue-400 mt-2">
          Edited: {editedAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}
