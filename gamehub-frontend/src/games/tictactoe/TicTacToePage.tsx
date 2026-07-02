import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { startTicTacToeGame, makeTicTacToeMove, getTicTacToeGame } from './tictactoeApi'
import type { TicTacToeGame } from '../../api/types'
import TicTacToeBoard from './TicTacToeBoard'

export default function TicTacToePage() {
  const { username } = useAuth()
  const [game, setGame] = useState<TicTacToeGame | null>(null)
  const [gameIdInput, setGameIdInput] = useState('')
  const [opponent, setOpponent] = useState('')
  const [error, setError] = useState('')
  const pollingRef = useRef<number | null>(null)

  // Poll for updates when it's not our turn
  useEffect(() => {
    if (!game || game.finished) {
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
          // silent fail on poll
        }
      }, 1000)
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [game, username])

  const handleStart = async () => {
    if (!opponent.trim()) {
      setError('Enter opponent username')
      return
    }
    setError('')
    try {
      const newGame = await startTicTacToeGame(opponent.trim())
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

  const handleCellClick = async (position: number) => {
    if (!game) return
    setError('')
    try {
      const updated = await makeTicTacToeMove(game.gameId, position)
      setGame(updated)
    } catch (err: any) {
      setError(err.response?.data || 'Move failed')
    }
  }

  const handleNewGame = () => {
    setGame(null)
    setGameIdInput('')
    setOpponent('')
    setError('')
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
            <h2 className="text-xl font-bold mb-4">Start a new game</h2>
            <input
              type="text"
              placeholder="Opponent's username"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 mb-4"
            />
            <button
              onClick={handleStart}
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
          <p className="text-sm text-gray-400">Game ID: {game.gameId}</p>
          <p className="text-gray-300">
            You are <span className="font-bold">{myMark}</span> vs{' '}
            {myMark === 'X' ? game.playerO : game.playerX}
          </p>
          {!game.finished && (
            <p className={isMyTurn ? 'text-green-400' : 'text-yellow-400'}>
              {isMyTurn ? 'Your turn' : "Opponent's turn..."}
            </p>
          )}
        </div>

        <TicTacToeBoard
          board={game.board}
          onCellClick={handleCellClick}
          disabled={!isMyTurn || game.finished}
        />

        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

        {game.finished && (
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {game.winner === 'DRAW' && '🤝 Draw!'}
              {game.winner === myMark && '🎉 You won!'}
              {game.winner && game.winner !== 'DRAW' && game.winner !== myMark && '😔 You lost'}
            </h2>
            <button
              onClick={handleNewGame}
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