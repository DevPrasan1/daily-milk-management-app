import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { useMonthRecords } from '@/hooks/useRecords'
import { useSellerPrices } from '@/hooks/useSeller'
import { getBuyer, deleteBuyer, setPrice, getGlobalPriceId } from '@/services/seller.service'

const EMOJIS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  camel: '🐪',
}
import { deleteRecord } from '@/services/record.service'
import { deletePayment } from '@/services/billing.service'
import { getLastNMonths } from '@/utils/dateUtils'
import { buildWhatsAppBillMessage, shareOnWhatsApp } from '@/utils/shareUtils'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import CattleSelector from '@/components/seller/CattleSelector'
import RecordCard from '@/components/records/RecordCard'
import MonthSummaryCard from '@/components/records/MonthSummaryCard'
import PaymentEntry from '@/components/billing/PaymentEntry'
import PaymentHistory from '@/components/billing/PaymentHistory'
import RecordEntryModal from '@/components/records/RecordEntryModal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { IndianRupee, Pencil, Share2, Trash2, Milk } from 'lucide-react'
import { clsx } from 'clsx'
import { groupRecordsByDate, formatLitres, formatAmount } from '@/utils/milkUtils'

const months = getLastNMonths(6)

export default function BuyerDetail() {
  const { buyerId } = useParams()
  const { t } = useTranslation()
  const { user, userProfile } = useAuth()
  const { toast } = useApp()
  const navigate = useNavigate()

  const [buyer, setBuyer] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(months[0])
  const [showPayment, setShowPayment] = useState(false)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [tab, setTab] = useState('records')
  const [showDeleteBuyer, setShowDeleteBuyer] = useState(false)
  const [deletingBuyer, setDeletingBuyer] = useState(false)

  const { prices, getPrice } = useSellerPrices()
  const [customPrices, setCustomPrices] = useState({})

  useEffect(() => {
    if (prices.length > 0) {
      const initialPrices = {}
      prices.forEach(p => {
        if (p.buyerId === null) {
          initialPrices[p.cattleType] = p.pricePerLitre
        }
      })
      setCustomPrices(initialPrices)
    }
  }, [prices])

  const getCattlePrice = (type) => {
    return customPrices[type] ?? getPrice(type) ?? 0
  }

  useEffect(() => {
    getBuyer(user.uid, buyerId).then(setBuyer)
  }, [user.uid, buyerId])

  const { records, payments, loading, reload } = useMonthRecords(
    user.uid,
    buyerId,
    selectedMonth.date.getFullYear(),
    selectedMonth.date.getMonth(),
    0
  )

  // Calculate correct summary based on each record's cattle type price
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

  const handlePriceChange = (type, val) => {
    const numVal = parseFloat(val) || 0
    setCustomPrices(prev => ({ ...prev, [type]: numVal }))
  }

  const handleSavePriceToDb = async (type) => {
    const priceVal = customPrices[type] ?? 0
    if (priceVal > 0) {
      try {
        await setPrice(user.uid, getGlobalPriceId(type), {
          cattleType: type,
          pricePerLitre: priceVal,
          buyerId: null,
        })
        toast('Price updated successfully', 'success')
      } catch {
        toast(t('common.error'), 'error')
      }
    }
  }

  const cattleRecords = groupRecordsByDate(records)

  function handleShare() {
    if (!buyer) return
    const msg = buildWhatsAppBillMessage(buyer.name, selectedMonth.date, summary, records, getCattlePrice)
    shareOnWhatsApp(buyer.phone, msg)
  }

  const activeCattleTypes = Array.from(new Set(records.map(r => r.cattleType))).filter(Boolean)

  async function handleDeleteRecord(recordId) {
    try {
      if (Array.isArray(recordId)) {
        await Promise.all(recordId.map(id => deleteRecord(user.uid, id)))
      } else {
        await deleteRecord(user.uid, recordId)
      }
      reload()
    } catch {
      toast(t('common.error'), 'error')
    }
  }

  async function handleDeletePayment(paymentId) {
    try {
      await deletePayment(user.uid, paymentId)
      reload()
    } catch {
      toast(t('common.error'), 'error')
    }
  }

  async function handleDeleteBuyer() {
    setDeletingBuyer(true)
    try {
      await deleteBuyer(user.uid, buyerId)
      toast('Buyer deleted', 'success')
      navigate('/seller/buyers')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setDeletingBuyer(false)
    }
  }

  return (
    <AppShell>
      <TopBar
        title={buyer?.name || 'Buyer Detail'}
        action={
          <div className="flex gap-1">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Share bill on WhatsApp"
            >
              <Share2 className="w-4 h-4 text-[#1D9E75]" />
            </button>
            <button
              onClick={() => navigate(`/seller/buyers/${buyerId}/edit`)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowDeleteBuyer(v => !v)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        }
      />

      {/* Delete buyer confirmation banner */}
      {showDeleteBuyer && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-between gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            {t('seller.buyers.deleteConfirm')}
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="danger" loading={deletingBuyer} onClick={handleDeleteBuyer}>
              {t('common.delete')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDeleteBuyer(false)}>
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
            {t_}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : tab === 'records' ? (
          <div className="mt-3">
            <div className="flex justify-end mb-3 px-4">
              <Button size="sm" className="w-100" onClick={() => setShowAddEntry(true)}>
                <Milk className="w-4 h-4" />
                {t('seller.entry.title') || 'Add Entry'}
              </Button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl mx-4 border border-gray-100 dark:border-gray-700 overflow-hidden">
              {cattleRecords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No records for this month</p>
              ) : (
                cattleRecords.map(r => (
                  <RecordCard key={r.id} record={r} onDelete={handleDeleteRecord} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3 px-4">
            <div className="flex justify-end mb-3">
              <Button size="sm" className="w-100" onClick={() => setShowPayment(true)}>
                <IndianRupee className="w-4 h-4" />
                {t('seller.billing.addPayment')}
              </Button>
            </div>
            <PaymentHistory payments={payments} onDelete={handleDeletePayment} />
          </div>
        )}
      </div>

      {/* Sticky summary & custom billing breakdown with price inputs */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 shadow-lg">
        {/* Breakdown details */}
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-50 dark:border-gray-700">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Rate & Deliveries Breakdown</p>
          {activeCattleTypes.length === 0 ? (
            <p className="text-xs text-gray-400">No milk entries recorded</p>
          ) : (
            activeCattleTypes.map(type => {
              const litres = records.filter(r => r.cattleType === type).reduce((sum, r) => sum + (r.total || 0), 0)
              const priceVal = customPrices[type] ?? getPrice(type) ?? 0
              const subtotal = litres * priceVal
              return (
                <div key={type} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{EMOJIS[type] || '🥛'}</span>
                    <span className="font-semibold capitalize">{type}:</span>
                    <span className="text-gray-500 font-medium">{formatLitres(litres)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">@</span>
                    <div className="relative flex items-center">
                      <span className="absolute left-1.5 text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        className="w-16 pl-4 pr-1 py-0.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-transparent focus:outline-none focus:border-[#1D9E75] font-semibold text-gray-800 dark:text-gray-200"
                        value={customPrices[type] !== undefined ? customPrices[type] : priceVal}
                        onChange={e => handlePriceChange(type, e.target.value)}
                        onBlur={() => handleSavePriceToDb(type)}
                      />
                      <span className="text-[10px] text-gray-400 ml-1">/L</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white ml-2">
                      = {formatAmount(subtotal)}
                    </span>
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

      <PaymentEntry
        sellerId={user.uid}
        buyerId={buyerId}
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSaved={reload}
      />

      <RecordEntryModal
        sellerId={user.uid}
        buyer={buyer}
        open={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        onSaved={reload}
      />
    </AppShell>
  )
}
