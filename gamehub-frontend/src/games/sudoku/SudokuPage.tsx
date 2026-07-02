import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { startSudokuGame, submitSudokuMove, clearSudokuCell } from './sudokuApi'
import type { SudokuGame } from '../../api/types'
import SudokuBoard from './SudokuBoard'

export default function SudokuPage() {
  const [game, setGame] = useState<SudokuGame | null>(null)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      const newGame = await startSudokuGame(difficulty)
      setGame(newGame)
      setSelectedCell(null)
    } catch {
      setError('Could not start game')
    } finally {
      setLoading(false)
    }
  }

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col])
    setError('')
  }

  const handleNumberInput = async (value: number) => {
    if (!game || !selectedCell) return
    const [row, col] = selectedCell
    if (game.given[row][col]) return

    setError('')
    try {
      const updated = await submitSudokuMove(game.gameId, row, col, value)
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
      const updated = await clearSudokuCell(game.gameId, row, col)
      setGame(updated)
    } catch {
      setError('Could not clear')
    }
  }

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!game || !selectedCell || game.finished) return
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleClear()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [game, selectedCell])

  if (!game) {
    return (
      <div className="min-h-screen p-6">
        <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
          <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
          <h1 className="text-2xl font-bold">Sudoku 🔢</h1>
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
            {loading ? 'Generating...' : 'Start Game'}
          </button>
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <h1 className="text-2xl font-bold">Sudoku 🔢</h1>
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
          <SudokuBoard
            current={game.current}
            given={game.given}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            disabled={game.finished}
          />
        </div>

        <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleNumberInput(n)}
              disabled={!selectedCell || game.finished}
              className="aspect-square bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded font-bold text-lg transition"
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={handleClear}
          disabled={!selectedCell || game.finished}
          className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 p-2 rounded"
        >
          Clear Cell
        </button>

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