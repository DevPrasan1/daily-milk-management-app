import { clsx } from 'clsx'
import { Zap } from 'lucide-react'

export default function AutoModeToggle({ enabled, onToggle, label, description }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
          enabled ? 'bg-[#1D9E75]/10' : 'bg-gray-100 dark:bg-gray-800'
        )}>
          <Zap className={clsx('w-4 h-4', enabled ? 'text-[#1D9E75]' : 'text-gray-400')} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={clsx(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent',
          'transition-colors duration-200 cursor-pointer focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-[#1D9E75] focus-visible:ring-offset-2',
          enabled ? 'bg-[#1D9E75]' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm',
            'transform transition-transform duration-200',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
