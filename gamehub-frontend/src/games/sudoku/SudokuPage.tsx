import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { startSudokuGame, submitSudokuMove, clearSudokuCell } from './sudokuApi'
import type { SudokuGame } from '../../api/types'
import SudokuBoard from './SudokuBoard'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../components/NotificationProvider'
import { useSound } from '../../hooks/useSound'

export default function SudokuPage() {
  const [game, setGame] = useState<SudokuGame | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { show, dismiss } = useNotification()
  const { play } = useSound()

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      const newGame = await startSudokuGame(difficulty)
      setGame(newGame)
      setSelectedNumber(null)
      setSelectedCell(null)
    } catch {
      setError('Could not start game')
    } finally {
      setLoading(false)
    }
  }

  const checkCellConflict = (board: number[][], row: number, col: number): boolean => {
    const v = board[row][col]
    if (v === 0) return false

    // Check row
    for (let j = 0; j < 9; j++) {
      if (j !== col && board[row][j] === v) return true
    }
    // Check column
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i][col] === v) return true
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && board[i][j] === v) return true
      }
    }
    return false
  }

  const handleCellClick = async (row: number, col: number) => {
    if (!game || game.finished) return
    if (game.given[row][col]) {
      setSelectedCell([row, col])
      return
    }
    setSelectedCell([row, col])
    setError('')

    if (selectedNumber === null) return

    try {
      if (selectedNumber === 0) {
        const updated = await clearSudokuCell(game.gameId, row, col)
        setGame(updated)
        play('move')
      } else {
        const updated = await submitSudokuMove(game.gameId, row, col, selectedNumber)
        setGame(updated)

        // Check if this move creates a conflict — play wrong-move if so
        const nowHasConflict = checkCellConflict(updated.current, row, col)
        if (nowHasConflict) {
          play('wrong-move')
        } else {
          play('move')
        }

        if (updated.finished && updated.won) {
          play('win')
          show('🎉 You won!', 'success', {
            subtext: `Sudoku (${updated.difficulty}) complete`,
            actions: [
              { label: 'Play again', variant: 'primary', onClick: () => { dismiss(); setGame(null); } },
              { label: 'Home', variant: 'secondary', onClick: () => { dismiss(); navigate('/'); } },
            ],
          })
        }
      }
    } catch {
      setError('Invalid move')
      play('wrong-move')
    }
  }

  // Keyboard support: press a number to select it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!game || game.finished) return
      if (e.key >= '1' && e.key <= '9') {
        setSelectedNumber(parseInt(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        setSelectedNumber(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [game])

  // Find cells that conflict with the current board (Sudoku rule violations)
  const findConflicts = (): boolean[][] => {
    const conflicts: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false))
    if (!game) return conflicts

    const board = game.current

    // Check rows
    for (let i = 0; i < 9; i++) {
      const seen: Record<number, number[]> = {}
      for (let j = 0; j < 9; j++) {
        const v = board[i][j]
        if (v !== 0) {
          if (!seen[v]) seen[v] = []
          seen[v].push(j)
        }
      }
      for (const cols of Object.values(seen)) {
        if (cols.length > 1) cols.forEach((j) => (conflicts[i][j] = true))
      }
    }

    // Check columns
    for (let j = 0; j < 9; j++) {
      const seen: Record<number, number[]> = {}
      for (let i = 0; i < 9; i++) {
        const v = board[i][j]
        if (v !== 0) {
          if (!seen[v]) seen[v] = []
          seen[v].push(i)
        }
      }
      for (const rows of Object.values(seen)) {
        if (rows.length > 1) rows.forEach((i) => (conflicts[i][j] = true))
      }
    }

    // Check 3x3 boxes
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const seen: Record<number, [number, number][]> = {}
        for (let i = br * 3; i < br * 3 + 3; i++) {
          for (let j = bc * 3; j < bc * 3 + 3; j++) {
            const v = board[i][j]
            if (v !== 0) {
              if (!seen[v]) seen[v] = []
              seen[v].push([i, j])
            }
          }
        }
        for (const cells of Object.values(seen)) {
          if (cells.length > 1) cells.forEach(([i, j]) => (conflicts[i][j] = true))
        }
      }
    }

    return conflicts
  }

  // Count remaining placements per digit
  const countsRemaining = (): Record<number, number> => {
    const counts: Record<number, number> = { 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9, 9: 9 }
    if (!game) return counts
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const v = game.current[i][j]
        if (v !== 0) counts[v] = (counts[v] ?? 0) - 1
      }
    }
    return counts
  }

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
  const counts = countsRemaining()
  const conflicts = findConflicts()

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
          conflicts={conflicts}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          disabled={game.finished}
        />
        </div>

        <div>
<p className="text-center text-gray-400 text-sm mb-2">
  {selectedNumber === null
    ? 'Press a number and click on a cell'
    : selectedNumber === 0
      ? 'Eraser selected: click a cell to clear it'
      : `${selectedNumber} selected: click a cell to place it`}
</p>
          <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
              const remaining = counts[n] ?? 0
              const complete = remaining <= 0
              const isSelected = selectedNumber === n
              return (
                <button
                  key={n}
                  onClick={() => setSelectedNumber(n)}
                  disabled={game.finished || complete}
                  className={`
                    aspect-square rounded font-bold text-lg transition
                    ${isSelected ? 'ring-2 ring-blue-400 bg-blue-700' : ''}
                    ${complete ? 'bg-gray-800 text-gray-500 line-through' : 'bg-gray-700 hover:bg-gray-600'}
                    disabled:cursor-not-allowed
                  `}
                >
                  {n}
                </button>
              )
            })}
            <button
              onClick={() => setSelectedNumber(0)}
              disabled={game.finished}
              className={`
                aspect-square rounded font-bold text-lg transition
                ${selectedNumber === 0 ? 'ring-2 ring-blue-400 bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}
                disabled:cursor-not-allowed
              `}
            >
              ⌫
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </main>
    </div>
  )
}