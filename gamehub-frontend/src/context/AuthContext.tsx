import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  username: string | null
  login: (username: string, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) setUsername(storedUsername)
  }, [])

  const login = (username: string, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
    setUsername(username)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  if (AuthContext === undefined) throw new Error('useAuth must be inside AuthProvider')
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}