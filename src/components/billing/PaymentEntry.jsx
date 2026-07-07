import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addPayment } from '@/services/billing.service'
import { useApp } from '@/context/AppContext'
import { validatePrice } from '@/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'

export default function PaymentEntry({ sellerId, buyerId, open, onClose, onSaved }) {
  const { t } = useTranslation()
  const { toast } = useApp()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    // const err = validatePrice(amount)
    // if (err) { setError(err); return }
    setError(null)
    setLoading(true)
    try {
      await addPayment(sellerId, buyerId, parseFloat(amount), new Date(), note)
      toast('Payment recorded', 'success')
      setAmount('')
      setNote('')
      onSaved?.()
      onClose()
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('seller.billing.addPayment')}>
      <div className="flex flex-col gap-4">
        <Input
          label={t('seller.billing.paymentAmount')}
          type="number"
          inputMode="decimal"
          placeholder="0"
          prefix="₹"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          error={error}
        />
        <Input
          label={t('seller.billing.paymentNote')}
          placeholder="e.g. Cash payment"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <Button size="full" loading={loading} onClick={handleSave}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
