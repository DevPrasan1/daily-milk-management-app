import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import {
  getMilkBook, deleteMilkBook, getMilkBookRecords, getMilkBookPayments,
  deleteMilkBookRecord, deleteMilkBookPayment
} from '@/services/milkbook.service'

const EMOJIS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  camel: '🐪',
}

import { getLastNMonths } from '@/utils/dateUtils'
import { buildWhatsAppBillMessage, shareOnWhatsApp } from '@/utils/shareUtils'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import RecordCard from '@/components/records/RecordCard'
import PaymentEntry from '@/components/billing/PaymentEntry'
import PaymentHistory from '@/components/billing/PaymentHistory'
import RecordEntryModal from '@/components/records/RecordEntryModal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { IndianRupee, Pencil, Share2, Trash2, Milk } from 'lucide-react'
import { clsx } from 'clsx'
import { groupRecordsByDate, formatLitres, formatAmount } from '@/utils/milkUtils'

const months = getLastNMonths(6)

export default function MilkBookDetail() {
  const { milkbookId } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [records, setRecords] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(months[0])
  const [showPayment, setShowPayment] = useState(false)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [tab, setTab] = useState('records')
  const [showDeleteBook, setShowDeleteBook] = useState(false)
  const [deletingBook, setDeletingBook] = useState(false)

  const isCreator = book?.isCreator

  const loadData = useCallback(async () => {
    if (!milkbookId || !user) return
    setLoading(true)
    try {
      const bookData = await getMilkBook(milkbookId, user.uid)
      if (!bookData) {
        toast('MilkBook not found', 'error')
        navigate(-1)
        return
      }
      setBook(bookData)

      const year = selectedMonth.date.getFullYear()
      const month = selectedMonth.date.getMonth()

      const [recs, pays] = await Promise.all([
        getMilkBookRecords(milkbookId, year, month),
        getMilkBookPayments(milkbookId, year, month)
      ])

      setRecords(recs)
      setPayments(pays)
    } catch (e) {
      console.error(e)
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }, [milkbookId, user, selectedMonth, navigate, toast, t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getCattlePrice = (type) => {
    return book?.prices?.[type] ?? 0
  }

  // Calculate billing summary
  const summary = (() => {
    let totalLitres = 0
    let totalAmount = 0
    records.forEach(r => {
      totalLitres += r.total || 0
      const rPrice = getCattlePrice(r.cattleType)
      totalAmount += (r.total || 0) * rPrice
    })
    totalAmount = parseFloat(totalAmount.toFixed(2))
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const remaining = parseFloat((totalAmount - totalPaid).toFixed(2))
    return { totalLitres, totalAmount, totalPaid, remaining }
  })()

  const cattleRecords = groupRecordsByDate(records)
  const activeCattleTypes = Array.from(new Set(records.map(r => r.cattleType))).filter(Boolean)

  function handleShare() {
    if (!book) return
    const msg = buildWhatsAppBillMessage(book.name, selectedMonth.date, summary, records, getCattlePrice)
    shareOnWhatsApp(book.phone, msg)
  }

  async function handleDeleteRecord(recordId) {
    if (!isCreator) return
    try {
      if (Array.isArray(recordId)) {
        await Promise.all(recordId.map(id => deleteMilkBookRecord(milkbookId, id)))
      } else {
        await deleteMilkBookRecord(milkbookId, recordId)
      }
      loadData()
    } catch {
      toast(t('common.error'), 'error')
    }
  }

  async function handleDeletePayment(paymentId) {
    if (!isCreator) return
    try {
      await deleteMilkBookPayment(milkbookId, paymentId)
      loadData()
    } catch {
      toast(t('common.error'), 'error')
    }
  }

  async function handleDeleteBook() {
    if (!isCreator) return
    setDeletingBook(true)
    try {
      await deleteMilkBook(milkbookId)
      toast('MilkBook deleted', 'success')
      navigate(-1)
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setDeletingBook(false)
    }
  }

  return (
    <AppShell>
      <TopBar
        title={book?.displayName || book?.name || 'MilkBook Details'}
        action={
          <div className="flex gap-1">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Share bill on WhatsApp"
            >
              <Share2 className="w-4 h-4 text-[#1D9E75]" />
            </button>
            {isCreator && (
              <>
                <button
                  onClick={() => navigate(`/milkbooks/${milkbookId}/edit`)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setShowDeleteBook(v => !v)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Delete confirmation banner */}
      {showDeleteBook && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            Delete this MilkBook permanently? All daily entries and payments will also be deleted.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="danger" loading={deletingBook} onClick={handleDeleteBook}>
              {t('common.delete')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDeleteBook(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Month selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-gray-100 dark:border-gray-800">
        {months.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMonth(m)}
            className={clsx(
              'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              selectedMonth.key === m.key
                ? 'bg-[#1D9E75] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3">
        {['records', 'payments'].map(t_ => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={clsx(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize',
              tab === t_
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {t_ === 'records' ? 'Entries' : 'Payments'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : tab === 'records' ? (
          <div className="mt-3">
            {isCreator && (
              <div className="flex justify-end mb-3 px-4">
                <Button size="sm" className="w-100" onClick={() => setShowAddEntry(true)}>
                  <Milk className="w-4 h-4" />
                  Add Entry
                </Button>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-2xl mx-4 border border-gray-100 dark:border-gray-700 overflow-hidden">
              {cattleRecords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No records for this month</p>
              ) : (
                cattleRecords.map(r => (
                  <RecordCard key={r.id} record={r} onDelete={isCreator ? handleDeleteRecord : null} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3 px-4">
            {isCreator && (
              <div className="flex justify-end mb-3">
                <Button size="sm" className="w-100" onClick={() => setShowPayment(true)}>
                  <IndianRupee className="w-4 h-4" />
                  {t('seller.billing.addPayment')}
                </Button>
              </div>
            )}
            <PaymentHistory payments={payments} onDelete={isCreator ? handleDeletePayment : null} />
          </div>
        )}
      </div>

      {/* Sticky summary & rate breakdown */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 shadow-lg">
        {/* Breakdown details */}
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Rate & Deliveries Breakdown</p>
          {activeCattleTypes.length === 0 ? (
            <p className="text-xs text-gray-400">No milk entries recorded</p>
          ) : (
            activeCattleTypes.map(type => {
              const litres = records.filter(r => r.cattleType === type).reduce((sum, r) => sum + (r.total || 0), 0)
              const priceVal = getCattlePrice(type)
              const subtotal = litres * priceVal
              return (
                <div key={type} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{EMOJIS[type] || '🥛'}</span>
                    <span className="font-semibold capitalize">{type}:</span>
                    <span className="text-gray-500 font-medium">{formatLitres(litres)}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{priceVal}/L = {formatAmount(subtotal)}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Global Summary Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-base font-bold text-gray-900 dark:text-white">{formatLitres(summary.totalLitres)}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('common.total')}</p>
          </div>
          <div className="text-center border-x border-gray-100 dark:border-gray-700">
            <p className="text-base font-bold text-gray-900 dark:text-white">{formatAmount(summary.totalAmount)}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('common.amount')}</p>
          </div>
          <div className="text-center">
            <p className={`text-base font-bold ${summary.remaining > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
              {formatAmount(summary.remaining)}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('common.remaining')}</p>
          </div>
        </div>
      </div>

      {isCreator && (
        <>
          <PaymentEntry
            sellerId={user.uid}
            buyerId={null}
            milkbookId={milkbookId}
            open={showPayment}
            onClose={() => setShowPayment(false)}
            onSaved={loadData}
          />

          <RecordEntryModal
            sellerId={user.uid}
            buyer={book}
            milkbookId={milkbookId}
            open={showAddEntry}
            onClose={() => setShowAddEntry(false)}
            onSaved={loadData}
          />
        </>
      )}
    </AppShell>
  )
}
