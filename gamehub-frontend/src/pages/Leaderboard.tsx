import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboard, getMyScores } from '../api/scoresApi'
import type { Score } from '../api/types'
import { useAuth } from '../context/AuthContext'

const games = [
  { id: 'wordle', name: 'Wordle', emoji: '🟩' },
  { id: 'tictactoe', name: 'Tic Tac Toe', emoji: '❌' },
  { id: 'sudoku', name: 'Sudoku', emoji: '🔢' },
  { id: 'tango', name: 'Tango', emoji: '☀️' },
]

export default function Leaderboard() {
  const { username } = useAuth()
  const [selectedGame, setSelectedGame] = useState<string>('wordle')
  const [scores, setScores] = useState<Score[]>([])
  const [myScores, setMyScores] = useState<Score[]>([])
  const [view, setView] = useState<'global' | 'me'>('global')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadScores()
  }, [selectedGame, view])

  const loadScores = async () => {
    setLoading(true)
    try {
      if (view === 'global') {
        const data = await getLeaderboard(selectedGame)
        setScores(data)
      } else {
        const data = await getMyScores()
        setMyScores(data.filter((s) => s.game === selectedGame))
      }
    } catch {
      setScores([])
      setMyScores([])
    } finally {
      setLoading(false)
    }
  }

  const displayScores = view === 'global' ? scores : myScores

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        <div />
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        {/* Game tabs */}
        <div className="grid grid-cols-4 gap-2">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`p-3 rounded-lg font-semibold transition ${
                selectedGame === game.id
                  ? 'bg-blue-600'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{game.emoji}</div>
              <div className="text-sm">{game.name}</div>
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('global')}
            className={`flex-1 p-3 rounded font-semibold ${
              view === 'global' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Global Top Scores
          </button>
          <button
            onClick={() => setView('me')}
            className={`flex-1 p-3 rounded font-semibold ${
              view === 'me' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            My Scores
          </button>
        </div>

        {/* Scores table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <p className="p-6 text-center text-gray-400">Loading...</p>
          ) : displayScores.length === 0 ? (
            <p className="p-6 text-center text-gray-400">No scores yet</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-right">Score</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {displayScores.map((score, index) => (
                  <tr
                    key={score.id}
                    className={`border-t border-gray-700 ${
                      score.user.username === username ? 'bg-blue-900/30' : ''
                    }`}
                  >
                    <td className="p-3 font-bold">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}`}
                    </td>
                    <td className="p-3">
                      {score.user.username}
                      {score.user.username === username && (
                        <span className="text-blue-400 text-xs ml-2">(you)</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold">{score.score}</td>
                    <td className="p-3 text-right text-gray-400 text-sm">
                      {formatDate(score.playedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}