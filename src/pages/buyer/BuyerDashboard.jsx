import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { getMilkBooks, getMilkBookRecords, getMilkBookPayments } from '@/services/milkbook.service'
import AppShell from '@/components/layout/AppShell'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import BuyerCard from '@/components/seller/BuyerCard'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Milk, IndianRupee, Store, MapPin, Plus, ClipboardList } from 'lucide-react'
import { formatAmount } from '@/utils/milkUtils'

export default function BuyerDashboard() {
  const { t } = useTranslation()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalDue, setTotalDue] = useState(0)

  useEffect(() => {
    if (user) {
      getMilkBooks(user.uid)
        .then(setBooks)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user])

  useEffect(() => {
    if (books.length === 0) {
      setTotalDue(0)
      return
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const fetchDue = async () => {
      let sumDue = 0
      
      await Promise.all(books.map(async (b) => {
        try {
          const [recs, pays] = await Promise.all([
            getMilkBookRecords(b.id, year, month),
            getMilkBookPayments(b.id, year, month)
          ])
          
          let totalAmount = 0
          recs.forEach(r => {
            const price = b.prices?.[r.cattleType] ?? 0
            totalAmount += (r.total || 0) * price
          })
          
          const totalPaid = pays.reduce((sum, p) => sum + (p.amount || 0), 0)
          const remaining = totalAmount - totalPaid
          sumDue += remaining
        } catch (e) {
          console.error('Error fetching due for book:', b.id, e)
        }
      }))
      
      setTotalDue(sumDue)
    }

    fetchDue()
  }, [books])

  const myBooks = books.filter(b => b.isCreator)
  const sharedBooks = books.filter(b => !b.isCreator)

  return (
    <AppShell>
      <TopBar
        showBack={false}
        title={t('buyer.dashboard.title')}
        action={
          <div className="flex items-center gap-1">
            <Avatar name={userProfile?.name} size="sm" />
          </div>
        }
      />
      <PageWrapper>
        <div className="mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back 👋</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {userProfile?.name || '—'}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: ClipboardList, label: 'Managed Books', value: String(myBooks.length) },
            { icon: Milk, label: 'Shared Books', value: String(sharedBooks.length) },
            { icon: IndianRupee, label: 'Pending Dues', value: formatAmount(totalDue) },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#1D9E75]" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{value}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Shared with Me (View Only)
          </p>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate('/buyer/nearby')}>
            <MapPin className="w-3.5 h-3.5 mr-1" />
            Find Sellers
          </Button>
        </div>

        {loading ? null : sharedBooks.length === 0 ? (
          <Card className="flex flex-col items-center py-8 text-center mb-6">
            <Store className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No shared books yet</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {sharedBooks.map(b => (
              <BuyerCard key={b.id} buyer={b} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            My MilkBooks (I Manage)
          </p>
          <Button size="sm" onClick={() => navigate('/milkbooks/add')}>
            <Plus className="w-4 h-4" />
            Start Book
          </Button>
        </div>

        {loading ? null : myBooks.length === 0 ? (
          <Card className="flex flex-col items-center py-8 text-center">
            <ClipboardList className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No managed books yet</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {myBooks.map(b => (
              <BuyerCard key={b.id} buyer={b} />
            ))}
          </div>
        )}
      </PageWrapper>
    </AppShell>
  )
}
