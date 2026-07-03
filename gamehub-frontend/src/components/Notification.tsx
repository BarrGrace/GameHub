import { useEffect, useState } from 'react'

export interface NotificationAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

interface Props {
  message: string
  subtext?: string
  type: 'success' | 'error' | 'info'
  visible: boolean
  actions?: NotificationAction[]
  onDismiss: () => void
}

const buttonVariants: Record<string, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-gray-700 text-white hover:bg-gray-600',
}

export default function Notification({
  message,
  subtext,
  visible,
  actions,
  onDismiss,
}: Props) {
  const [render, setRender] = useState(false)
  const [slidIn, setSlidIn] = useState(false)

  useEffect(() => {
    if (visible) {
      setRender(true)
      document.body.style.overflow = 'hidden'
      const t = setTimeout(() => setSlidIn(true), 20)
      return () => clearTimeout(t)
    } else {
      setSlidIn(false)
      const t = setTimeout(() => {
        setRender(false)
        document.body.style.overflow = ''
      }, 500)
      return () => clearTimeout(t)
    }
  }, [visible])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!render) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black
          transition-opacity duration-500
          ${slidIn ? 'opacity-60' : 'opacity-0'}
        `}
      />
      {/* Popup */}
      <div
        className={`
          fixed left-1/2 -translate-x-1/2 z-50
          top-1/4
          max-w-lg w-11/12 px-8 py-10 rounded-xl border-2 border-gray-700
          bg-gray-800 shadow-2xl text-white text-center
          transition-transform duration-500 ease-out
          ${slidIn ? 'translate-y-0' : '-translate-y-[calc(25vh+100%)]'}
        `}
      >
        <p className="text-3xl font-bold mb-2">{message}</p>
        {subtext && <p className="text-lg text-gray-300 mb-4">{subtext}</p>}
        {actions && actions.length > 0 ? (
          <div className="flex gap-3 mt-6 justify-center">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className={`px-5 py-3 rounded font-semibold ${buttonVariants[action.variant ?? 'primary']}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={onDismiss}
            className="mt-4 text-sm text-gray-400 hover:text-white underline"
          >
            Dismiss
          </button>
        )}
      </div>
    </>
  )
}