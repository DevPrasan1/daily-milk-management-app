import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { useBuyerList } from '@/hooks/useSeller'
import { saveRecord } from '@/services/record.service'
import { validateQuantity } from '@/utils/validators'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import CattleSelector from '@/components/seller/CattleSelector'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { clsx } from 'clsx'

export default function DailyEntry() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { toast } = useApp()
  const { buyers } = useBuyerList()

  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [cattle, setCattle] = useState('cow')
  const [morning, setMorning] = useState('')
  const [evening, setEvening] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function validate() {
    const errs = {}
    if (morning) {
      const e = validateQuantity(morning)
      if (e) errs.morning = e
    }
    if (evening) {
      const e = validateQuantity(evening)
      if (e) errs.evening = e
    }
    if (!morning && !evening) errs.morning = 'Enter at least one value'
    return errs
  }

  async function handleSave() {
    if (!selectedBuyer) { toast('Please select a buyer', 'warning'); return }
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const today = new Date()
      // Check if record already exists
      const recordId = `${selectedBuyer.id}_${cattle}_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
      const docRef = doc(db, 'records', user.uid, 'entries', recordId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        toast('Record for today already exists for this cattle type', 'error')
        setLoading(false)
        return
      }

      const m = morning ? parseFloat(morning) : 0
      const e = evening ? parseFloat(evening) : 0
      await saveRecord(user.uid, selectedBuyer.id, today, cattle, m, e, 'manual')
      toast('Entry saved', 'success')
      setSaved(true)
      setMorning('')
      setEvening('')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <AppShell>
      <TopBar title={t('seller.entry.title')} showBack={false} />
      <PageWrapper>
        <p className="text-xs text-gray-400 mb-4">{today}</p>

        {/* Buyer selector */}
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('seller.entry.selectBuyer')}
        </p>
        <div className="flex flex-col gap-2 mb-5">
          {buyers.length === 0 && (
            <p className="text-sm text-gray-400">No buyers added yet</p>
          )}
          {buyers.filter(b => b.status === 'active').map(b => (
            <button
              key={b.id}
              onClick={() => { setSelectedBuyer(b); setSaved(false) }}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
                selectedBuyer?.id === b.id
                  ? 'border-[#1D9E75] bg-[#1D9E75]/5'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                selectedBuyer?.id === b.id ? 'bg-[#1D9E75] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              )}>
                {b.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{b.name}</p>
            </button>
          ))}
        </div>

        {selectedBuyer && (
          <Card>
            <CattleSelector value={cattle} onChange={setCattle} className="mb-4" />

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <Input
                  label={t('seller.entry.morningEntry')}
                  type="number"
                  inputMode="decimal"
                  placeholder={t('seller.entry.quantityPlaceholder')}
                  suffix="L"
                  min="0"
                  value={morning}
                  onChange={e => setMorning(e.target.value)}
                  error={errors.morning}
                />
                <QuickQtyButtons onSelect={v => setMorning(String(v))} />
              </div>
              <div>
                <Input
                  label={t('seller.entry.eveningEntry')}
                  type="number"
                  inputMode="decimal"
                  placeholder={t('seller.entry.quantityPlaceholder')}
                  suffix="L"
                  min="0"
                  value={evening}
                  onChange={e => setEvening(e.target.value)}
                  error={errors.evening}
                />
                <QuickQtyButtons onSelect={v => setEvening(String(v))} />
              </div>
            </div>

            {selectedBuyer.autoMode && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                ⚡ {t('seller.entry.autoMode')}
              </p>
            )}

            <Button
              size="full"
              loading={loading}
              onClick={handleSave}
              variant={saved ? 'secondary' : 'primary'}
            >
              {saved ? '✓ Saved!' : t('seller.entry.saveEntry')}
            </Button>
          </Card>
        )}
      </PageWrapper>
    </AppShell>
  )
}

function QuickQtyButtons({ onSelect }) {
  const qtys = [
    { label: '250ml', value: 0.25 },
    { label: '500ml', value: 0.5 },
    { label: '1L', value: 1 },
    { label: '1.5L', value: 1.5 },
    { label: '2L', value: 2 },
  ]
  return (
    <div className="flex gap-1.5 mt-1.5 flex-wrap">
      {qtys.map(q => (
        <button
          key={q.label}
          type="button"
          onClick={() => onSelect(q.value)}
          className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#1D9E75]/10 hover:text-[#1D9E75] transition-colors"
        >
          {q.label}
        </button>
      ))}
    </div>
  )
}
