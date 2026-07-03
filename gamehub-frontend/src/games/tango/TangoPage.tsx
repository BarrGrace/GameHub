import { useState } from 'react'
import { Link } from 'react-router-dom'
import { startTangoGame, submitTangoMove, clearTangoCell } from './tangoApi'
import type { TangoGame } from '../../api/types'
import TangoBoard from './TangoBoard'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../components/NotificationProvider'

export default function TangoPage() {
  const [game, setGame] = useState<TangoGame | null>(null)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { show, dismiss } = useNotification()
  const [settled, setSettled] = useState(true)

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      const newGame = await startTangoGame(difficulty)
      setGame(newGame)
      setSelectedCell(null)
    } catch {
      setError('Could not start game')
    } finally {
      setLoading(false)
    }
  }

  const findConflicts = (): boolean[][] => {
    const conflicts: boolean[][] = Array.from({ length: 6 }, () => Array(6).fill(false))
    if (!game) return conflicts

    const board = game.current

    // Check row balance (max 3 of each)
    for (let i = 0; i < 6; i++) {
      const counts: Record<number, number[]> = { 1: [], 2: [] }
      for (let j = 0; j < 6; j++) {
        if (board[i][j] !== 0) counts[board[i][j]].push(j)
      }
      if (counts[1].length > 3) counts[1].forEach((j) => (conflicts[i][j] = true))
      if (counts[2].length > 3) counts[2].forEach((j) => (conflicts[i][j] = true))
    }

    // Check column balance
    for (let j = 0; j < 6; j++) {
      const counts: Record<number, number[]> = { 1: [], 2: [] }
      for (let i = 0; i < 6; i++) {
        if (board[i][j] !== 0) counts[board[i][j]].push(i)
      }
      if (counts[1].length > 3) counts[1].forEach((i) => (conflicts[i][j] = true))
      if (counts[2].length > 3) counts[2].forEach((i) => (conflicts[i][j] = true))
    }

    // Check three-in-a-row horizontally
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j <= 3; j++) {
        const v = board[i][j]
        if (v !== 0 && v === board[i][j + 1] && v === board[i][j + 2]) {
          conflicts[i][j] = true
          conflicts[i][j + 1] = true
          conflicts[i][j + 2] = true
        }
      }
    }

    // Check three-in-a-row vertically
    for (let j = 0; j < 6; j++) {
      for (let i = 0; i <= 3; i++) {
        const v = board[i][j]
        if (v !== 0 && v === board[i + 1][j] && v === board[i + 2][j]) {
          conflicts[i][j] = true
          conflicts[i + 1][j] = true
          conflicts[i + 2][j] = true
        }
      }
    }

    // Check horizontal constraints
    for (let i = 0; i < 6; i++) {
      const rowStr = game.hConstraints[i] || ''
      for (let j = 0; j < 5; j++) {
        const c = rowStr[j]
        const left = board[i][j]
        const right = board[i][j + 1]
        if (left !== 0 && right !== 0) {
          if (c === '=' && left !== right) {
            conflicts[i][j] = true
            conflicts[i][j + 1] = true
          } else if (c === 'x' && left === right) {
            conflicts[i][j] = true
            conflicts[i][j + 1] = true
          }
        }
      }
    }

    // Check vertical constraints
    for (let i = 0; i < 5; i++) {
      const rowStr = game.vConstraints[i] || ''
      for (let j = 0; j < 6; j++) {
        const c = rowStr[j]
        const top = board[i][j]
        const bot = board[i + 1][j]
        if (top !== 0 && bot !== 0) {
          if (c === '=' && top !== bot) {
            conflicts[i][j] = true
            conflicts[i + 1][j] = true
          } else if (c === 'x' && top === bot) {
            conflicts[i][j] = true
            conflicts[i + 1][j] = true
          }
        }
      }
    }

    return conflicts
  }

  const handleCellClick = async (row: number, col: number) => {
      if (!game || game.finished) return
      if (game.given[row][col]) return

      setError('')

      const currentValue = game.current[row][col]

    try {
      let updated
      if (currentValue === 0) {
        updated = await submitTangoMove(game.gameId, row, col, 1)
      } else if (currentValue === 1) {
        updated = await submitTangoMove(game.gameId, row, col, 2)
      } else {
        updated = await clearTangoCell(game.gameId, row, col)
      }
      setGame(updated)
      setSelectedCell([row, col])
      setSettled(false)
      setTimeout(() => setSettled(true), 500)

      if (updated.finished && updated.won) {
        show('🎉 You won!', 'success', {
          subtext: `Tango (${updated.difficulty}) complete`,
          actions: [
            { label: 'Play again', variant: 'primary', onClick: () => { dismiss(); setGame(null); } },
            { label: 'Home', variant: 'secondary', onClick: () => { dismiss(); navigate('/'); } },
          ],
        })
      }
    } catch (err: any) {
      setError(err.response?.data || 'Invalid move')
    }
  }

  const handlePlace = async (value: number) => {
    if (!game || !selectedCell) return
    const [row, col] = selectedCell
    if (game.given[row][col]) return

    setError('')
    try {
      const updated = await submitTangoMove(game.gameId, row, col, value)
      setGame(updated)
    } catch (err: any) {
      setError(err.response?.data || 'Invalid move')
    }
  }

  const handleClear = async () => {
    if (!game || !selectedCell) return
    const [row, col] = selectedCell
    if (game.given[row][col]) return

    try {
      const updated = await clearTangoCell(game.gameId, row, col)
      setGame(updated)
    } catch {
      setError('Could not clear')
    }
  }

  const conflicts = findConflicts()
  const displayedConflicts = settled ? conflicts : Array.from({ length: 6 }, () => Array(6).fill(false))

  if (!game) {
    return (
      <div className="min-h-screen p-6">
        <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
          <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
          <h1 className="text-2xl font-bold">Tango ☀️🌙</h1>
          <div />
        </header>

        <main className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Choose difficulty</h2>
          <div className="flex gap-2 mb-6">
            {['easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 p-3 rounded font-semibold capitalize ${
                  difficulty === d ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-semibold"
          >
            {loading ? 'Generating puzzle...' : 'Start Game'}
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Rules: Fill each row and column with 3 suns and 3 moons. No three of the same in a row.
            <span className="text-yellow-400"> =</span> means same,
            <span className="text-yellow-400"> ×</span> means different.
          </p>
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <h1 className="text-2xl font-bold">Tango ☀️🌙</h1>
        <button
          onClick={() => setGame(null)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          New Game
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <p className="text-center text-gray-400 capitalize">Difficulty: {game.difficulty}</p>

        <div className="flex justify-center">
        <TangoBoard
          current={game.current}
          given={game.given}
          hConstraints={game.hConstraints}
          vConstraints={game.vConstraints}
          conflicts={displayedConflicts}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          disabled={game.finished}
        />
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <button
            onClick={() => handlePlace(1)}
            disabled={!selectedCell || game.finished}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 p-3 rounded text-2xl"
          >
            ☀️
          </button>
          <button
            onClick={() => handlePlace(2)}
            disabled={!selectedCell || game.finished}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 p-3 rounded text-2xl"
          >
            🌙
          </button>
          <button
            onClick={handleClear}
            disabled={!selectedCell || game.finished}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 p-3 rounded font-semibold"
          >
            Clear
          </button>
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </main>
    </div>
  )
}