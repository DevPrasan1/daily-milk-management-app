import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { addMilkBook, updateMilkBook, getMilkBook, backfillMilkBookRecords } from '@/services/milkbook.service'
import { validateName, validatePhone, validateQuantity } from '@/utils/validators'
import { CATTLE_OPTIONS } from '@/utils/constants'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Plus, Trash2 } from 'lucide-react'

function buildEntriesFromData(data) {
  const allTypes = [...new Set([
    ...Object.keys(data.morning || {}),
    ...Object.keys(data.evening || {}),
  ])]
  if (!allTypes.length) return []
  return allTypes.map(type => ({
    cattleType: type,
    morning: String(data.morning?.[type] ?? ''),
    evening: String(data.evening?.[type] ?? ''),
    price: String(data.prices?.[type] ?? ''),
  }))
}

export default function AddEditMilkBook() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { milkbookId } = useParams()
  const { user } = useAuth()
  const { toast } = useApp()
  const isEdit = Boolean(milkbookId)
  const isHindi = i18n.language === 'hi'

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [errors, setErrors] = useState({})

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [milkEntries, setMilkEntries] = useState([])

  useEffect(() => {
    if (!isEdit) return
    getMilkBook(milkbookId, user.uid).then(data => {
      if (data) {
        setName(data.name || '')
        setPhone(data.phone || '')
        setStartDate(data.startDate || '')
        setMilkEntries(buildEntriesFromData(data))
      }
    }).finally(() => setFetching(false))
  }, [isEdit, milkbookId, user])

  const usedTypes = milkEntries.map(e => e.cattleType).filter(Boolean)
  const availableOptions = CATTLE_OPTIONS.filter(o => !usedTypes.includes(o.value))

  function addMilkEntry() {
    setMilkEntries(prev => [...prev, { cattleType: '', morning: '', evening: '', price: '' }])
  }

  function removeMilkEntry(idx) {
    setMilkEntries(prev => prev.filter((_, i) => i !== idx))
    setErrors(prev => {
      const next = { ...prev }
      delete next[`cattleType_${idx}`]
      delete next[`morning_${idx}`]
      delete next[`evening_${idx}`]
      delete next[`price_${idx}`]
      return next
    })
  }

  function updateEntry(idx, field, value) {
    setMilkEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function validate() {
    const errs = {}
    const ne = validateName(name)
    if (ne) errs.name = ne
    if (phone) {
      const pe = validatePhone(phone)
      if (pe) errs.phone = pe
    }
    milkEntries.forEach((entry, idx) => {
      if (!entry.cattleType) {
        errs[`cattleType_${idx}`] = t('onboarding.selectCattle')
      }
      if (entry.morning) {
        const e = validateQuantity(entry.morning)
        if (e) errs[`morning_${idx}`] = e
      }
      if (entry.evening) {
        const e = validateQuantity(entry.evening)
        if (e) errs[`evening_${idx}`] = e
      }
      if (!entry.price) {
        errs[`price_${idx}`] = t('common.error')
      } else {
        const priceNum = parseFloat(entry.price)
        if (isNaN(priceNum) || priceNum <= 0) {
          errs[`price_${idx}`] = t('common.error')
        }
      }
    })
    if (!isEdit && startDate) {
      const today = new Date()
      const minDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
      const maxDateStr = today.toISOString().split('T')[0]
      if (startDate < minDateStr || startDate > maxDateStr) {
        errs.startDate = t('seller.buyers.startDateError')
      }
    }
    return errs
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const morning = {}
      const evening = {}
      const prices = {}
      for (const entry of milkEntries) {
        if (!entry.cattleType) continue
        morning[entry.cattleType] = entry.morning ? parseFloat(entry.morning) : 0
        evening[entry.cattleType] = entry.evening ? parseFloat(entry.evening) : 0
        prices[entry.cattleType] = parseFloat(entry.price)
      }
      const data = {
        name: name.trim(),
        phone: phone.trim(),
        startDate: startDate || null,
        morning,
        evening,
        prices,
      }
      if (isEdit) {
        await updateMilkBook(milkbookId, data)
        toast('MilkBook updated', 'success')
      } else {
        const newId = await addMilkBook(user.uid, data)
        if (startDate) {
          await backfillMilkBookRecords(newId, morning, evening, startDate)
        }
        toast('MilkBook created', 'success')
      }
      navigate(-1) // go back to dashboard/calling list
    } catch (e) {
      console.error('AddEditMilkBook save error:', e)
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  function cattleLabel(option) {
    return isHindi ? option.labelHi : option.labelEn
  }

  if (fetching) return <FullPageSpinner />

  return (
    <AppShell>
      <TopBar title={isEdit ? t('milkbook.editTitle') : t('milkbook.addTitle')} />
      <PageWrapper>
        <div className="flex flex-col gap-4">
          <Input
            label={t('common.name')}
            placeholder={t('milkbook.partnerName')}
            value={name}
            onChange={e => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label={t('common.phone')}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder={t('milkbook.partnerPhone')}
            prefix="+91"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            error={errors.phone}
          />
          {!isEdit && (
            <Input
              label={t('seller.buyers.startDate')}
              type="date"
              min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01` })()}
              max={new Date().toISOString().split('T')[0]}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              error={errors.startDate}
            />
          )}

          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
            {t('onboarding.cattleSection')}
          </p>

          {milkEntries.map((entry, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-3 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {t('onboarding.cattleType')}
                </label>
                <button
                  type="button"
                  onClick={() => removeMilkEntry(idx)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <select
                value={entry.cattleType}
                onChange={e => updateEntry(idx, 'cattleType', e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-[#FAFAF8] dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40"
              >
                <option value="">{t('onboarding.selectCattle')}</option>
                {CATTLE_OPTIONS.filter(
                  o => o.value === entry.cattleType || !usedTypes.includes(o.value)
                ).map(o => (
                  <option key={o.value} value={o.value}>
                    {cattleLabel(o)}
                  </option>
                ))}
              </select>
              {errors[`cattleType_${idx}`] && (
                <p className="text-xs text-red-500">{errors[`cattleType_${idx}`]}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('common.morning')}
                  type="number"
                  inputMode="decimal"
                  placeholder="0.0"
                  suffix="L"
                  value={entry.morning}
                  onChange={e => updateEntry(idx, 'morning', e.target.value)}
                  error={errors[`morning_${idx}`]}
                />
                <Input
                  label={t('common.evening')}
                  type="number"
                  inputMode="decimal"
                  placeholder="0.0"
                  suffix="L"
                  value={entry.evening}
                  onChange={e => updateEntry(idx, 'evening', e.target.value)}
                  error={errors[`evening_${idx}`]}
                />
              </div>

              <Input
                label={t('onboarding.pricePerLitre')}
                type="number"
                inputMode="decimal"
                placeholder="0.0"
                value={entry.price}
                onChange={e => updateEntry(idx, 'price', e.target.value)}
                error={errors[`price_${idx}`]}
              />
            </div>
          ))}

          {availableOptions.length > 0 && (
            <button
              type="button"
              onClick={addMilkEntry}
              className="flex items-center gap-2 text-sm font-medium text-[#1D9E75] border border-dashed border-[#1D9E75]/50 rounded-2xl py-3 px-4 hover:bg-[#1D9E75]/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('onboarding.addCattle')}
            </button>
          )}

          <Button size="full" className="mt-4" loading={loading} onClick={handleSave}>
            {t('common.save')}
          </Button>
        </div>
      </PageWrapper>
    </AppShell>
  )
}

function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  )
}
