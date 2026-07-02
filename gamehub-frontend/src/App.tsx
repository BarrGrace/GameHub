import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Home from './pages/Home.tsx'
import type { ReactNode } from 'react'
import WordlePage from './games/wordle/WordlePage'
import TicTacToePage from './games/tictactoe/TicTacToePage'
import SudokuPage from './games/sudoku/SudokuPage'
import TangoPage from './games/tango/TangoPage'
import Leaderboard from './pages/Leaderboard.tsx'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { username } = useAuth()
  return username ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/wordle" element={<ProtectedRoute><WordlePage /></ProtectedRoute>} />
        <Route path="/tictactoe" element={<ProtectedRoute><TicTacToePage /></ProtectedRoute>} />
        <Route path="/sudoku" element={<ProtectedRoute><SudokuPage /></ProtectedRoute>} />
        <Route path="/tango" element={<ProtectedRoute><TangoPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App