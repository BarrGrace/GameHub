import { useState } from 'react'
import { Link } from 'react-router-dom'
import { startTangoGame, submitTangoMove, clearTangoCell } from './tangoApi'
import type { TangoGame } from '../../api/types'
import TangoBoard from './TangoBoard'

export default function TangoPage() {
  const [game, setGame] = useState<TangoGame | null>(null)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

    const handleCellClick = async (row: number, col: number) => {
        if (!game || game.finished) return
        if (game.given[row][col]) return

        setError('')
        const currentValue = game.current[row][col]

        try {
            if (currentValue === 0) {
            // empty → sun (1)
            const updated = await submitTangoMove(game.gameId, row, col, 1)
            setGame(updated)
            } else if (currentValue === 1) {
            // sun → moon (2)
            const updated = await submitTangoMove(game.gameId, row, col, 2)
            setGame(updated)
            } else {
            // moon → empty (clear)
            const updated = await clearTangoCell(game.gameId, row, col)
            setGame(updated)
            }
            setSelectedCell([row, col])
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

        {game.finished && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-400 mb-4">🎉 You won!</h2>
            <button
              onClick={() => setGame(null)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold"
            >
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  )
}