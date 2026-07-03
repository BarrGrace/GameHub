import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { startTicTacToeGame, makeTicTacToeMove, getTicTacToeGame } from './tictactoeApi'
import type { TicTacToeGame } from '../../api/types'
import TicTacToeBoard from './TicTacToeBoard'
import { useNotification } from '../../components/NotificationProvider'

export default function TicTacToePage() {
  const { username } = useAuth()
  const navigate = useNavigate()
  const { show, dismiss } = useNotification()
  const [game, setGame] = useState<TicTacToeGame | null>(null)
  const [gameIdInput, setGameIdInput] = useState('')
  const [opponent, setOpponent] = useState('')
  const [error, setError] = useState('')
  const pollingRef = useRef<number | null>(null)

  useEffect(() => {
    if (!game || game.finished || game.mode === 'ai') {
      if (pollingRef.current) clearInterval(pollingRef.current)
      return
    }

    const isMyTurn =
      (game.currentTurn === 'X' && game.playerX === username) ||
      (game.currentTurn === 'O' && game.playerO === username)

    if (!isMyTurn) {
      pollingRef.current = window.setInterval(async () => {
        try {
          const updated = await getTicTacToeGame(game.gameId)
          setGame(updated)
        } catch {
          // silent
        }
      }, 1000)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [game, username])

  const handleStartAI = async () => {
    setError('')
    try {
      const newGame = await startTicTacToeGame('ai')
      setGame(newGame)
    } catch {
      setError('Could not start game')
    }
  }

  const handleStartPvp = async () => {
    if (!opponent.trim()) {
      setError('Enter opponent username')
      return
    }
    setError('')
    try {
      const newGame = await startTicTacToeGame('pvp', opponent.trim())
      setGame(newGame)
    } catch {
      setError('Could not start game')
    }
  }

  const handleJoin = async () => {
    if (!gameIdInput.trim()) {
      setError('Enter a game ID')
      return
    }
    setError('')
    try {
      const existingGame = await getTicTacToeGame(gameIdInput.trim())
      setGame(existingGame)
    } catch {
      setError('Game not found')
    }
  }

  const handleNewGame = () => {
    setGame(null)
    setGameIdInput('')
    setOpponent('')
    setError('')
  }

  const handleCellClick = async (position: number) => {
    if (!game) return
    setError('')

    // Optimistic update
    const optimisticBoard = [...game.board]
    optimisticBoard[position] = game.currentTurn
    const optimisticGame: TicTacToeGame = {
      ...game,
      board: optimisticBoard,
      currentTurn: game.currentTurn === 'X' ? 'O' : 'X',
    }
    setGame(optimisticGame)

    try {
      const updated = await makeTicTacToeMove(game.gameId, position)

      if (game.mode === 'ai') {
        await new Promise((resolve) => setTimeout(resolve, 600))
      }

      setGame(updated)

      if (updated.finished) {
        const myMark = updated.playerX === username ? 'X' : 'O'
        const message =
          updated.winner === 'DRAW' ? '🤝 Draw!'
          : updated.winner === myMark ? '🎉 You won!'
          : '😔 You lost'
        show(message, 'info', {
          actions: [
            { label: 'New game', variant: 'primary', onClick: () => { dismiss(); handleNewGame(); } },
            { label: 'Home', variant: 'secondary', onClick: () => { dismiss(); navigate('/'); } },
          ],
        })
      }
    } catch (err: any) {
      setGame(game)
      setError(err.response?.data || 'Move failed')
    }
  }

  if (!game) {
    return (
      <div className="min-h-screen p-6">
        <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
          <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
          <h1 className="text-2xl font-bold">Tic Tac Toe ❌</h1>
          <div />
        </header>

        <main className="max-w-md mx-auto space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Play vs Computer</h2>
            <button
              onClick={handleStartAI}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
            >
              Start
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Play vs Friend</h2>
            <input
              type="text"
              placeholder="Opponent's username"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 mb-4"
            />
            <button
              onClick={handleStartPvp}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
            >
              Start
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Join existing game</h2>
            <input
              type="text"
              placeholder="Game ID"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 mb-4"
            />
            <button
              onClick={handleJoin}
              className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded font-semibold"
            >
              Join
            </button>
          </div>

          {error && <p className="text-red-400 text-center">{error}</p>}
        </main>
      </div>
    )
  }

  const isMyTurn =
    (game.currentTurn === 'X' && game.playerX === username) ||
    (game.currentTurn === 'O' && game.playerO === username)
  const myMark = game.playerX === username ? 'X' : 'O'
  const opponentName = myMark === 'X' ? game.playerO : game.playerX

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <h1 className="text-2xl font-bold">Tic Tac Toe ❌</h1>
        <button
          onClick={handleNewGame}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          New Game
        </button>
      </header>

      <main className="max-w-md mx-auto">
        <div className="text-center mb-4 space-y-1">
          {game.mode === 'pvp' && (
            <p className="text-sm text-gray-400">Game ID: {game.gameId}</p>
          )}
          <p className="text-gray-300">
            You are <span className="font-bold">{myMark}</span> vs{' '}
            <span className="font-bold">{opponentName}</span>
          </p>
          {!game.finished && (
            <p className={isMyTurn ? 'text-green-400' : 'text-yellow-400'}>
              {isMyTurn ? 'Your turn' : game.mode === 'ai' ? 'AI is thinking...' : "Opponent's turn..."}
            </p>
          )}
        </div>

        <TicTacToeBoard
          board={game.board}
          onCellClick={handleCellClick}
          disabled={!isMyTurn || game.finished}
        />

        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
      </main>
    </div>
  )
}