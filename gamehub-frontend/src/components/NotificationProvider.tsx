import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import Notification from './Notification'
import type { NotificationAction } from './Notification'

type NotificationType = 'success' | 'error' | 'info'

interface ShowOptions {
  subtext?: string
  actions?: NotificationAction[]
}

interface NotificationContextType {
  show: (message: string, type?: NotificationType, options?: ShowOptions) => void
  dismiss: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const [subtext, setSubtext] = useState<string | undefined>(undefined)
  const [type, setType] = useState<NotificationType>('info')
  const [visible, setVisible] = useState(false)
  const [actions, setActions] = useState<NotificationAction[] | undefined>(undefined)

  const show = (msg: string, notifType: NotificationType = 'info', options?: ShowOptions) => {
    setMessage(msg)
    setType(notifType)
    setSubtext(options?.subtext)
    setActions(options?.actions)
    setVisible(true)
  }

  const dismiss = () => setVisible(false)

  return (
    <NotificationContext.Provider value={{ show, dismiss }}>
      {children}
      <Notification
        message={message}
        subtext={subtext}
        type={type}
        visible={visible}
        actions={actions}
        onDismiss={dismiss}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider')
  return ctx
}