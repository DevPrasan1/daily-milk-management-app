import { clsx } from 'clsx'

export default function Card({ children, className, onClick, padding = true }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700',
        'shadow-sm',
        padding && 'p-4',
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
    >
      {children}
    </div>
  )
}
