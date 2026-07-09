import { useTranslation } from 'react-i18next'
import { CATTLE_OPTIONS } from '@/utils/constants'


export default function CattleSelector({ value, onChange, className, options }) {
  const { i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'

  const visibleOptions = options
    ? CATTLE_OPTIONS.filter(o => options.includes(o.value))
    : CATTLE_OPTIONS

  return (
    <div className={className}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/40 min-h-[44px]"
      >
        {visibleOptions.map(opt => {
          const label = isHindi ? opt.labelHi : opt.labelEn
          return (
            <option key={opt.value} value={opt.value}>
              {label}
            </option>
          )
        })}
      </select>
    </div>
  )
}
