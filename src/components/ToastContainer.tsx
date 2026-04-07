import type { Toast, ToastType } from '../hooks/useToast'

const colors: Record<ToastType, string> = {
  success: '#00D4AA',
  error: '#FF4757',
  info: '#00CFFF',
}

interface Props {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in flex items-center gap-3 px-4 py-2.5 rounded-lg pointer-events-auto cursor-pointer"
          style={{
            background: '#191926',
            border: `1px solid ${colors[t.type]}50`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${colors[t.type]}15`,
            color: colors[t.type],
          }}
          onClick={() => onDismiss(t.id)}
          role="alert"
        >
          <span className="text-sm font-mono">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
