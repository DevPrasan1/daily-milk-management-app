import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { ROLES } from '@/utils/constants'
import Button from '@/components/ui/Button'
import { ShoppingBag, Store, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'

const roles = [
  {
    id: ROLES.SELLER,
    icon: Store,
    titleKey: 'roleSelect.sellerTitle',
    descKey: 'roleSelect.sellerDesc',
  },
  {
    id: ROLES.BUYER,
    icon: ShoppingBag,
    titleKey: 'roleSelect.buyerTitle',
    descKey: 'roleSelect.buyerDesc',
  },
]

export default function RoleSelect() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, userProfile, loading: authLoading, refreshProfile } = useAuth()
  const { toast } = useApp()

  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (userProfile?.role) {
      if (userProfile?.name) {
        navigate(userProfile.role === ROLES.SELLER ? '/seller' : '/buyer', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    }
  }, [user, userProfile, authLoading, navigate])

  if (authLoading) return <FullPageSpinner />

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        phone: user.phoneNumber,
        role: selected,
        createdAt: serverTimestamp(),
        language: 'en',
        theme: 'light',
      }, { merge: true })

      if (selected === ROLES.SELLER) {
        await setDoc(doc(db, 'sellers', user.uid), {
          homeDelivery: false,
          autoMode: false,
          cattle: [],
          linkedBuyers: [],
        }, { merge: true })
      } else {
        await setDoc(doc(db, 'buyers', user.uid), {
          linkedSellers: [],
        }, { merge: true })
      }

      refreshProfile()
      navigate('/onboarding')
    } catch {
      toast(t('common.error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900 flex flex-col px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {t('roleSelect.title')}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {t('roleSelect.subtitle')}
      </p>

      <div className="flex flex-col gap-4 flex-1">
        {roles.map(({ id, icon: Icon, titleKey, descKey }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={clsx(
              'text-left p-5 rounded-2xl border-2 transition-all active:scale-[0.98]',
              selected === id
                ? 'border-[#1D9E75] bg-[#1D9E75]/5'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={clsx(
                'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                selected === id ? 'bg-[#1D9E75]' : 'bg-gray-100 dark:bg-gray-700'
              )}>
                <Icon className={clsx('w-6 h-6', selected === id ? 'text-white' : 'text-gray-500 dark:text-gray-300')} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {t(titleKey)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t(descKey)}
                </p>
              </div>
              {selected === id && (
                <CheckCircle className="w-5 h-5 text-[#1D9E75] flex-shrink-0 mt-0.5" />
              )}
            </div>
          </button>
        ))}
      </div>

      <Button
        size="full"
        className="mt-8"
        disabled={!selected}
        loading={loading}
        onClick={handleContinue}
      >
        {t('roleSelect.selectBtn')} {selected ? (selected === ROLES.SELLER ? 'Seller' : 'Buyer') : ''}
      </Button>
    </div>
  )
}
