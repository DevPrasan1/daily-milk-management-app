import { clsx } from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, className, prefix, suffix, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-gray-500 dark:text-gray-400 text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          min={props.type === 'number' ? (props.min ?? '0') : props.min}
          onKeyDown={props.type === 'number'
            ? e => { if (e.key === '-' || e.key === 'e') e.preventDefault(); props.onKeyDown?.(e) }
            : props.onKeyDown}
          className={clsx(
            'w-full rounded-xl border px-4 py-3 text-sm min-h-[44px]',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent',
            'transition-colors',
            error
              ? 'border-red-400 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700',
            prefix && 'pl-10',
            suffix && 'pr-12',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-gray-500 dark:text-gray-400 text-sm select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
})

export default Input
