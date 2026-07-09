import { useNavigate } from 'react-router-dom'
import { ChevronRight, Milk } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

export default function BuyerCard({ buyer, sellerId }) {
  const navigate = useNavigate()
  const totalSet = (buyer.morning?.cow ?? 0) + (buyer.morning?.buffalo ?? 0) +
    (buyer.evening?.cow ?? 0) + (buyer.evening?.buffalo ?? 0)

  return (
    <Card
      padding={false}
      onClick={() => navigate(`/milkbooks/${buyer.id}`)}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={buyer.displayName || buyer.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {buyer.displayName || buyer.name}
            </p>
            <Badge variant={buyer.status === 'active' ? 'green' : 'gray'}>
              {buyer.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Milk className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalSet > 0 ? `${totalSet}L/day` : 'No quantity set'}
            </p>
            {buyer.phone && (
              <span className="text-xs text-gray-400 ml-2">{buyer.phone}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  )
}
