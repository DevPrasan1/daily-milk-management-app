import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { clsx } from 'clsx'

export default function TopBar({ title, showBack = true, action, className }) {
  const navigate = useNavigate()

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
        'border-b border-gray-100 dark:border-gray-800',
        className
      )}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
        {title}
      </h1>
      {action && <div>{action}</div>}
    </header>
  )
}
