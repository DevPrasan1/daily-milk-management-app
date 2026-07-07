import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { useLinkedSellers } from '@/hooks/useBuyer'
import { useMonthRecords } from '@/hooks/useRecords'
import { saveBuyerSelfRecord } from '@/services/record.service'
import { getBuyerMembership } from '@/services/buyer.service'
import { useApp } from '@/context/AppContext'
import { getLastNMonths } from '@/utils/dateUtils'
import { validateQuantity } from '@/utils/validators'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import RecordCard from '@/components/records/RecordCard'
import MonthSummaryCard from '@/components/records/MonthSummaryCard'
import SellerCard from '@/components/buyer/SellerCard'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { BookOpen, PenLine } from 'lucide-react'
import { clsx } from 'clsx'
import { groupRecordsByDate } from '@/utils/milkUtils'

const months = getLastNMonths(6)

export default function MyRecords() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useApp()
  const { sellers, loading: sellersLoading } = useLinkedSellers()

  const [selectedSeller, setSelectedSeller] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(months[0])
  const [cattle, setCattle] = useState('cow')
  const [tab, setTab] = useState('records') // 'records' | 'self-entry'

  // Self-entry state
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [morning, setMorning] = useState('')
  const [evening, setEvening] = useState('')
  const [selfErrors, setSelfErrors] = useState({})
  const [selfLoading, setSelfLoading] = useState(false)
  const [buyerMember, setBuyerMember] = useState(null)

  // Fetch buyer's default milk values from seller's membership
  useEffect(() => {
    if (!selectedSeller || !user) {
      setBuyerMember(null)
      return
    }
    getBuyerMembership(selectedSeller.id, user.uid, user.phoneNumber)
      .then(setBuyerMember)
      .catch(err => {
        console.error('Error fetching buyer membership:', err)
        setBuyerMember(null)
      })
  }, [selectedSeller, user])

  // Pre-fill morning/evening with default values from membership on buyerMember/cattle change
  useEffect(() => {
    if (buyerMember) {
      const defaultMorning = buyerMember.morning?.[cattle] ?? ''
      const defaultEvening = buyerMember.evening?.[cattle] ?? ''
      setMorning(defaultMorning ? String(defaultMorning) : '')
      setEvening(defaultEvening ? String(defaultEvening) : '')
    } else {
      setMorning('')
      setEvening('')
    }
  }, [buyerMember, cattle])

  // Set default entryDate based on selectedMonth
  useEffect(() => {
    const today = new Date()
    const isCurrMonth = selectedMonth.key === months[0].key
    if (isCurrMonth) {
      setEntryDate(today.toISOString().split('T')[0])
    } else {
      const year = selectedMonth.date.getFullYear()
      const month = selectedMonth.date.getMonth()
      setEntryDate(`${year}-${String(month + 1).padStart(2, '0')}-01`)
    }
  }, [selectedMonth])

  const dateLimits = (() => {
    const year = selectedMonth.date.getFullYear()
    const month = selectedMonth.date.getMonth()
    const min = `${year}-${String(month + 1).padStart(2, '0')}-01`

    // Max is last day of the selected month, or today if selected month is the current month
    const today = new Date()
    const isCurrMonth = selectedMonth.key === months[0].key
    let max = ''
    if (isCurrMonth) {
      max = today.toISOString().split('T')[0]
    } else {
      const lastDay = new Date(year, month + 1, 0).getDate()
      max = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    }
    return { min, max }
  })()

  const isCurrentMonth = selectedMonth.key === months[0].key

  const { records, loading: recordsLoading, summary, reload } = useMonthRecords(
    selectedSeller?.id,
    buyerMember?.id,
    selectedMonth.date.getFullYear(),
    selectedMonth.date.getMonth(),
    0,
    true,
    user.uid
  )

  const cattleRecords = records

  async function handleSelfEntry() {
    const errs = {}
    if (!entryDate) {
      errs.date = 'Select a date'
    } else {
      const todayStr = new Date().toISOString().split('T')[0]
      if (entryDate > todayStr) {
        errs.date = 'Date cannot be in the future'
      }
    }
    if (morning) { const e = validateQuantity(morning); if (e) errs.morning = e }
    if (evening) { const e = validateQuantity(evening); if (e) errs.evening = e }
    if (!morning && !evening) errs.morning = 'Enter at least one value'
    if (Object.keys(errs).length) { setSelfErrors(errs); return }

    setSelfLoading(true)
    try {
      const [yr, mo, dy] = entryDate.split('-').map(Number)
      const dateObj = new Date(yr, mo - 1, dy)

      const sellerId = selectedSeller?.id || 'unlinked'
      const recordId = `${sellerId}_${cattle}_${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}`
      const docRef = doc(db, 'buyerSelfRecords', user.uid, 'entries', recordId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setSelfErrors({ date: t('common.recordExistsError') })
        setSelfLoading(false)
        return
      }

      await saveBuyerSelfRecord(
        user.uid,
        sellerId,
        dateObj,
        cattle,
        morning ? parseFloat(morning) : 0,
        evening ? parseFloat(evening) : 0
      )
      toast('Entry saved', 'success')
      setSelfErrors({})
      // Reset fields to defaults if available, otherwise clear
      if (buyerMember) {
        const defaultMorning = buyerMember.morning?.[cattle] ?? ''
        const defaultEvening = buyerMember.evening?.[cattle] ?? ''
        setMorning(defaultMorning ? String(defaultMorning) : '')
        setEvening(defaultEvening ? String(defaultEvening) : '')
      } else {
        setMorning('')
        setEvening('')
      }
      reload()
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setSelfLoading(false)
    }
  }

  if (sellersLoading) return (
    <AppShell><div className="flex justify-center py-20"><Spinner /></div></AppShell>
  )

  return (
    <AppShell>
      <TopBar title={t('buyer.records.title')} showBack={false} />

      {/* Seller selector */}
      {!selectedSeller ? (
        <PageWrapper>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('buyer.records.selectSeller')}
          </p>
          {sellers.length === 0 ? (
            <>
              <div className="flex flex-col items-center py-10 text-center mb-6">
                <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No linked sellers yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You can still record your own milk below
                </p>
              </div>
              {/* Unlinked self-entry */}
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <PenLine className="w-4 h-4 text-[#1D9E75]" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t('buyer.records.selfEntry')}
                  </p>
                </div>
                <div className="mb-4">
                  <Input
                    label={t('common.date')}
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    error={selfErrors.date}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Input
                    label={t('common.morning')}
                    type="number"
                    inputMode="decimal"
                    placeholder="0.0"
                    suffix="L"
                    value={morning}
                    onChange={e => setMorning(e.target.value)}
                    error={selfErrors.morning}
                  />
                  <Input
                    label={t('common.evening')}
                    type="number"
                    inputMode="decimal"
                    placeholder="0.0"
                    suffix="L"
                    value={evening}
                    onChange={e => setEvening(e.target.value)}
                    error={selfErrors.evening}
                  />
                </div>
                <Button size="full" loading={selfLoading} onClick={handleSelfEntry}>
                  {t('entry.saveEntry')}
                </Button>
              </Card>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              {sellers.map(s => (
                <SellerCard key={s.id} seller={s} onClick={() => setSelectedSeller(s)} />
              ))}
            </div>
          )}
        </PageWrapper>
      ) : (
        <>
          <button
            onClick={() => setSelectedSeller(null)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-[#1D9E75] font-medium"
          >
            ← {selectedSeller.name}
          </button>

          {/* Month selector */}
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none border-b border-gray-100 dark:border-gray-800">
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
            {['records', 'self-entry'].map(t_ => (
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
                {t_ === 'self-entry' ? 'My Entry' : 'Records'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pb-4 mt-3">
            {tab === 'records' ? (
              recordsLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : (
                <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {cattleRecords.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">
                      {t('buyer.records.noRecords')}
                    </p>
                  ) : (
                    cattleRecords.map(r => <RecordCard key={r.id} record={r} />)
                  )}
                </div>
              )
            ) : (
              <div className="px-4">
                <Card>
                  <div className="mb-4">
                    <Input
                      label={t('common.date')}
                      type="date"
                      min={dateLimits.min}
                      max={dateLimits.max}
                      value={entryDate}
                      onChange={e => setEntryDate(e.target.value)}
                      error={selfErrors.date}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Input
                      label={t('common.morning')}
                      type="number"
                      inputMode="decimal"
                      placeholder="0.0"
                      suffix="L"
                      value={morning}
                      onChange={e => setMorning(e.target.value)}
                      error={selfErrors.morning}
                    />
                    <Input
                      label={t('common.evening')}
                      type="number"
                      inputMode="decimal"
                      placeholder="0.0"
                      suffix="L"
                      value={evening}
                      onChange={e => setEvening(e.target.value)}
                      error={selfErrors.evening}
                    />
                  </div>
                  <Button size="full" loading={selfLoading} onClick={handleSelfEntry}>
                    {t('entry.saveEntry')}
                  </Button>
                </Card>
              </div>
            )}
          </div>

          <MonthSummaryCard summary={summary} pricePerLitre={0} />
        </>
      )}
    </AppShell>
  )
}
