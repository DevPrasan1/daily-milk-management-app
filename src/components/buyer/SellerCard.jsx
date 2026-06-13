import { ChevronRight } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'

export default function SellerCard({ seller, onClick }) {
  return (
    <Card padding={false} onClick={onClick} className="overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={seller.name} photo={seller.photo} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {seller.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {seller.about || seller.phone || '—'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  )
}
