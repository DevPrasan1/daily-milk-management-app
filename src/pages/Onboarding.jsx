import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { ROLES, CATTLE_OPTIONS } from '@/utils/constants'
import { validateName, validatePrice } from '@/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Milk, Plus, Trash2 } from 'lucide-react'

export default function Onboarding() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, userProfile, refreshProfile } = useAuth()
  const { toast } = useApp()

  const isSeller = userProfile?.role === ROLES.SELLER
  const isHindi = i18n.language === 'hi'

  const [name, setName] = useState('')
  const [about, setAbout] = useState('')
  const [homeDelivery, setHomeDelivery] = useState(false)
  // Each entry: { cattleType: string, price: string, totalMilk: string }
  const [cattleEntries, setCattleEntries] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const usedTypes = cattleEntries.map(e => e.cattleType).filter(Boolean)
  const availableOptions = CATTLE_OPTIONS.filter(o => !usedTypes.includes(o.value))

  function addCattle() {
    setCattleEntries(prev => [...prev, { cattleType: '', price: '', totalMilk: '' }])
  }

  function removeCattle(idx) {
    setCattleEntries(prev => prev.filter((_, i) => i !== idx))
    setErrors(prev => {
      const next = { ...prev }
      delete next[`price_${idx}`]
      delete next[`totalMilk_${idx}`]
      delete next[`cattleType_${idx}`]
      return next
    })
  }

  function updateEntry(idx, field, value) {
    setCattleEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function validate() {
    const errs = {}
    const nameErr = validateName(name)
    if (nameErr) errs.name = nameErr

    if (isSeller) {
      cattleEntries.forEach((entry, idx) => {
        if (!entry.cattleType) {
          errs[`cattleType_${idx}`] = t('onboarding.selectCattle')
        }
        if (entry.price) {
          const pErr = validatePrice(entry.price)
          if (pErr) errs[`price_${idx}`] = pErr
        }
        if (entry.totalMilk) {
          const n = parseFloat(entry.totalMilk)
          if (isNaN(n) || n <= 0) errs[`totalMilk_${idx}`] = 'Enter a valid quantity'
        }
      })
    }
    return errs
  }

  async function handleContinue() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        about: about.trim(),
      })

      if (isSeller) {
        await updateDoc(doc(db, 'sellers', user.uid), { homeDelivery })

        for (const entry of cattleEntries) {
          if (!entry.cattleType) continue
          const priceId = `global_${entry.cattleType}`
          const data = {
            buyerId: null,
            cattleType: entry.cattleType,
            fromDate: serverTimestamp(),
          }
          if (entry.price) data.pricePerLitre = parseFloat(entry.price)
          if (entry.totalMilk) data.totalMilk = parseFloat(entry.totalMilk)
          await setDoc(doc(db, 'sellerPrices', user.uid, 'prices', priceId), data)
        }
      }

      refreshProfile()
      navigate(isSeller ? '/seller' : '/buyer')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  function cattleLabel(option) {
    return isHindi ? option.labelHi : option.labelEn
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900 flex flex-col px-6 py-12">
      <div className="w-12 h-12 rounded-2xl bg-[#1D9E75]/10 flex items-center justify-center mb-6">
        <Milk className="w-6 h-6 text-[#1D9E75]" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {t('onboarding.title')}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {userProfile?.phone || user?.phoneNumber}
      </p>

      <div className="flex flex-col gap-4 flex-1">
        <Input
          label={t('common.name')}
          placeholder={t('onboarding.namePlaceholder')}
          value={name}
          onChange={e => setName(e.target.value)}
          error={errors.name}
        />

        <Input
          label={t('common.note')}
          placeholder={t('onboarding.aboutPlaceholder')}
          value={about}
          onChange={e => setAbout(e.target.value)}
        />

        {isSeller && (
          <>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
              {t('onboarding.sellerExtra')}
            </p>

            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={homeDelivery}
                onChange={e => setHomeDelivery(e.target.checked)}
                className="w-5 h-5 rounded accent-[#1D9E75]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('onboarding.homeDelivery')}
              </span>
            </label>

            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
              {t('onboarding.cattleSection')}
            </p>

            {cattleEntries.map((entry, idx) => (
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
                    onClick={() => removeCattle(idx)}
                    className="text-red-400 hover:text-red-600 p-1"
                    aria-label={t('onboarding.removeCattle')}
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
                    label={t('onboarding.pricePerLitre')}
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 60"
                    suffix="₹/L"
                    value={entry.price}
                    onChange={e => updateEntry(idx, 'price', e.target.value)}
                    error={errors[`price_${idx}`]}
                  />
                  <Input
                    label={t('onboarding.totalMilk')}
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 20"
                    suffix="L"
                    value={entry.totalMilk}
                    onChange={e => updateEntry(idx, 'totalMilk', e.target.value)}
                    error={errors[`totalMilk_${idx}`]}
                  />
                </div>
              </div>
            ))}

            {availableOptions.length > 0 && (
              <button
                type="button"
                onClick={addCattle}
                className="flex items-center gap-2 text-sm font-medium text-[#1D9E75] border border-dashed border-[#1D9E75]/50 rounded-2xl py-3 px-4 hover:bg-[#1D9E75]/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('onboarding.addCattle')}
              </button>
            )}
          </>
        )}
      </div>

      <Button
        size="full"
        className="mt-8"
        loading={loading}
        onClick={handleContinue}
      >
        {t('onboarding.continueBtn')}
      </Button>
    </div>
  )
}
