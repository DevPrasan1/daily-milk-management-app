import ToastContainer from '@/components/ui/Toast'
import BottomNav from './BottomNav'

export default function AppShell({ children, showNav = true }) {
  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-200 dark:bg-gray-700">
      <div className="relative w-full max-w-[390px] min-h-screen bg-[#FAFAF8] dark:bg-gray-900 flex flex-col overflow-hidden shadow-2xl">
        <ToastContainer />
        <div className="flex flex-col flex-1 overflow-hidden">
          {children}
        </div>
        {showNav && <BottomNav />}
      </div>
    </div>
  )
}
