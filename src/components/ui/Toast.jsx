import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
}

export default function ToastContainer() {
  const { state, dispatch } = useApp()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)]">
      {state.toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 shadow-lg animate-in slide-in-from-top-2"
          onClick={() => dispatch({ type: 'REMOVE_TOAST', id: t.id })}
        >
          {icons[t.type] || icons.info}
          <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{t.message}</p>
        </div>
      ))}
    </div>
  )
}
