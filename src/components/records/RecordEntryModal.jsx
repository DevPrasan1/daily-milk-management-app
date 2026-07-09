import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { saveRecord } from '@/services/record.service'
import { saveMilkBookRecord } from '@/services/milkbook.service'
import { useApp } from '@/context/AppContext'
import { validateQuantity } from '@/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import CattleSelector from '../seller/CattleSelector'

export default function RecordEntryModal({ sellerId, buyer, open, onClose, onSaved, milkbookId }) {
  const { t } = useTranslation()
  const { toast } = useApp()

  // Default to first configured cattle or 'cow'
  const cattleOptions = [
    buyer?.morning?.cow || buyer?.evening?.cow ? 'cow' : null,
    buyer?.morning?.buffalo || buyer?.evening?.buffalo ? 'buffalo' : null,
  ].filter(Boolean)
  const defaultCattle = cattleOptions[0] || 'cow'

  const [cattle, setCattle] = useState(defaultCattle)
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [morning, setMorning] = useState('')
  const [evening, setEvening] = useState('')
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Sync default cattle option when buyer is loaded
  useEffect(() => {
    if (buyer) {
      const options = [
        buyer.morning?.cow || buyer.evening?.cow ? 'cow' : null,
        buyer.morning?.buffalo || buyer.evening?.buffalo ? 'buffalo' : null,
      ].filter(Boolean)
      setCattle(options[0] || 'cow')
    }
  }, [buyer])

  // Pre-fill morning/evening quantities with buyer defaults
  useEffect(() => {
    if (buyer) {
      const defaultMorning = buyer.morning?.[cattle] ?? ''
      const defaultEvening = buyer.evening?.[cattle] ?? ''
      setMorning(defaultMorning ? String(defaultMorning) : '')
      setEvening(defaultEvening ? String(defaultEvening) : '')
    }
  }, [buyer, cattle, open])

  async function handleSave() {
    const errs = {}
    if (!entryDate) {
      errs.date = 'Select a date'
    }
    if (morning) {
      const e = validateQuantity(morning)
      if (e) errs.morning = e
    }
    if (evening) {
      const e = validateQuantity(evening)
      if (e) errs.evening = e
    }
    if (!morning && !evening) {
      errs.morning = 'Enter at least one value'
    }

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      const [yr, mo, dy] = entryDate.split('-').map(Number)
      const dateObj = new Date(yr, mo - 1, dy)

      // Check if record already exists
      const recordId = milkbookId 
        ? `${cattle}_${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}`
        : `${buyer.id}_${cattle}_${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}`
      
      const docRef = milkbookId
        ? doc(db, 'milkbooks', milkbookId, 'records', recordId)
        : doc(db, 'records', sellerId, 'entries', recordId)
        
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setErrors({ date: t('common.recordExistsError') })
        setLoading(false)
        return
      }

      const m = morning ? parseFloat(morning) : 0
      const e = evening ? parseFloat(evening) : 0

      if (milkbookId) {
        await saveMilkBookRecord(milkbookId, dateObj, cattle, m, e, comment, 'manual')
      } else {
        await saveRecord(sellerId, buyer.id, dateObj, cattle, m, e, comment, 'manual')
      }
      toast('Entry saved', 'success')
      setComment('')
      onSaved?.()
      onClose()
    } catch (e) {
      console.error(e)
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('seller.entry.title') || 'Add Milk Entry'}>
      <div className="flex flex-col gap-4">
        <CattleSelector value={cattle} onChange={setCattle} />

        <Input
          label={t('common.date')}
          type="date"
          max={new Date().toISOString().split('T')[0]}
          value={entryDate}
          onChange={e => setEntryDate(e.target.value)}
          error={errors.date}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('common.morning')}
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            suffix="L"
            value={morning}
            onChange={e => setMorning(e.target.value)}
            error={errors.morning}
          />
          <Input
            label={t('common.evening')}
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            suffix="L"
            value={evening}
            onChange={e => setEvening(e.target.value)}
            error={errors.evening}
          />
        </div>

        <Input
          label="Comment"
          placeholder="e.g. Buyer was out of town"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <Button size="full" loading={loading} onClick={handleSave}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
