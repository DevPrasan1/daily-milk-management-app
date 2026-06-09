import { clsx } from 'clsx'

export default function Avatar({ name, photo, size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const initials = name
    ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={clsx('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={clsx(
        'rounded-full bg-[#1D9E75]/20 text-[#1D9E75] font-semibold flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
