import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { useMonthRecords } from '@/hooks/useRecords'
import { useSellerPrices } from '@/hooks/useSeller'
import { getBuyer, deleteBuyer, hasBuyerRecords } from '@/services/seller.service'
import { deleteRecord } from '@/services/record.service'
import { getLastNMonths } from '@/utils/dateUtils'
import { buildWhatsAppBillMessage, shareOnWhatsApp } from '@/utils/shareUtils'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import CattleSelector from '@/components/seller/CattleSelector'
import RecordCard from '@/components/records/RecordCard'
import MonthSummaryCard from '@/components/records/MonthSummaryCard'
import PaymentEntry from '@/components/billing/PaymentEntry'
import PaymentHistory from '@/components/billing/PaymentHistory'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { IndianRupee, Pencil, Share2, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'

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
  const [tab, setTab] = useState('records')
  const [showDeleteBuyer, setShowDeleteBuyer] = useState(false)
  const [deletingBuyer, setDeletingBuyer] = useState(false)

  // Only show cattle types the seller has configured; default both if not set
  const cattleOptions = [
    userProfile?.hasCow !== false ? 'cow' : null,
    userProfile?.hasBuffalo !== false ? 'buffalo' : null,
  ].filter(Boolean)

  const [cattle, setCattle] = useState(cattleOptions[0] || 'cow')

  const { getPrice } = useSellerPrices()

  useEffect(() => {
    getBuyer(user.uid, buyerId).then(setBuyer)
  }, [user.uid, buyerId])

  const price = getPrice(cattle)
  const { records, payments, loading, summary, reload } = useMonthRecords(
    user.uid, buyerId,
    selectedMonth.date.getFullYear(),
    selectedMonth.date.getMonth(),
    price
  )

  const cattleRecords = records.filter(r => r.cattleType === cattle)

  function handleShare() {
    if (!buyer) return
    const msg = buildWhatsAppBillMessage(buyer.name, selectedMonth.date, summary, price, cattle)
    shareOnWhatsApp(buyer.phone, msg)
  }

  async function handleDeleteRecord(recordId) {
    try {
      await deleteRecord(user.uid, recordId)
      reload()
    } catch {
      toast(t('common.error'), 'error')
    }
  }

  async function handleDeleteBuyer() {
    setDeletingBuyer(true)
    try {
      const hasRecords = await hasBuyerRecords(user.uid, buyerId)
      if (hasRecords) {
        toast(t('seller.buyers.hasRecordsError'), 'warning')
        setShowDeleteBuyer(false)
        return
      }
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

      {/* Cattle selector — only show if seller has both types */}
      {cattleOptions.length > 1 && (
        <div className="px-4 pt-4">
          <CattleSelector value={cattle} onChange={setCattle} options={cattleOptions} />
        </div>
      )}

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
          <div className="mt-3 bg-white dark:bg-gray-800 rounded-2xl mx-4 border border-gray-100 dark:border-gray-700 overflow-hidden">
            {cattleRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No records for this month</p>
            ) : (
              cattleRecords.map(r => (
                <RecordCard key={r.id} record={r} onDelete={handleDeleteRecord} />
              ))
            )}
          </div>
        ) : (
          <div className="mt-3 px-4">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => setShowPayment(true)}>
                <IndianRupee className="w-4 h-4" />
                {t('seller.billing.addPayment')}
              </Button>
            </div>
            <PaymentHistory payments={payments} />
          </div>
        )}
      </div>

      {/* Sticky summary */}
      <MonthSummaryCard summary={summary} pricePerLitre={price} />

      <PaymentEntry
        sellerId={user.uid}
        buyerId={buyerId}
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSaved={reload}
      />
    </AppShell>
  )
}
