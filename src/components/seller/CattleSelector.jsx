import { clsx } from 'clsx'

const ALL_OPTIONS = [
  { value: 'cow', label: 'Cow', emoji: '🐄' },
  { value: 'buffalo', label: 'Buffalo', emoji: '🐃' },
]

export default function CattleSelector({ value, onChange, className, options }) {
  const visibleOptions = options
    ? ALL_OPTIONS.filter(o => options.includes(o.value))
    : ALL_OPTIONS

  return (
    <div className={clsx('flex gap-2', className)}>
      {visibleOptions.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all min-h-[44px]',
            value === opt.value
              ? 'border-[#1D9E75] bg-[#1D9E75]/10 text-[#1D9E75]'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
          )}
        >
          <span>{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
