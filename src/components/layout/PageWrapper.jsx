import { clsx } from 'clsx'

export default function PageWrapper({ children, className, noPadding }) {
  return (
    <main
      className={clsx(
        'flex-1 overflow-y-auto',
        !noPadding && 'px-4 pt-4 pb-28',
        className
      )}
    >
      {children}
    </main>
  )
}
