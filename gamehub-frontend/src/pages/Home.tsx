import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const games = [
  { id: 'wordle', name: 'Wordle', emoji: '🟩', description: 'Guess the 5-letter word in 6 tries' },
  { id: 'tictactoe', name: 'Tic Tac Toe', emoji: '❌', description: 'Classic two-player game' },
  { id: 'sudoku', name: 'Sudoku', emoji: '🔢', description: 'Fill the grid with numbers 1-9' },
  { id: 'tango', name: 'Tango', emoji: '☀️', description: 'Balance suns and moons on a 6x6 grid' },
]

export default function Home() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">GameHub 🎮</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">Hi, {username}</span>
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <h2 className="text-2xl mb-6 text-gray-300">Choose a game</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/${game.id}`}
              className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition cursor-pointer border border-gray-700 hover:border-blue-500"
            >
              <div className="text-5xl mb-4">{game.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-gray-400 text-sm">{game.description}</p>
            </Link>
          ))}
        </div>

        <Link
          to="/leaderboard"
          className="block mt-8 bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-center font-semibold transition"
        >
          🏆 View Leaderboard
        </Link>
      </main>
    </div>
  )
}