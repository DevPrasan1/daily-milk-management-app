import { NavLink } from 'react-router-dom'
import { Home, Users, ClipboardList, Settings, BookOpen, MapPin, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { clsx } from 'clsx'

const sellerNav = [
  { to: '/seller', icon: Home, label: 'Home', end: true },
  { to: '/seller/buyers', icon: Users, label: 'Buyers' },
  // { to: '/seller/entry', icon: ClipboardList, label: 'Entry' },
  { to: '/seller/settings', icon: Settings, label: 'Settings' },
]

const buyerNav = [
  { to: '/buyer', icon: Home, label: 'Home', end: true },
  { to: '/buyer/records', icon: BookOpen, label: 'Records' },
  { to: '/buyer/nearby', icon: MapPin, label: 'Nearby' },
  { to: '/buyer/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const { userProfile } = useAuth()
  const navItems = userProfile?.role === 'seller' ? sellerNav : buyerNav

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]',
                isActive
                  ? 'text-[#1D9E75]'
                  : 'text-gray-400 dark:text-gray-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5', isActive && 'stroke-[2.5]')} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
