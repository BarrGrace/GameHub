import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { startWordleGame, submitWordleGuess } from './wordleApi'
import WordleGrid from './WordleGrid'

type Color = 'green' | 'yellow' | 'grey'

export default function WordlePage() {
  const [gameId, setGameId] = useState<string>('')
  const [maxGuesses, setMaxGuesses] = useState<number>(6)
  const [guesses, setGuesses] = useState<string[]>([])
  const [results, setResults] = useState<Color[][]>([])
  const [currentGuess, setCurrentGuess] = useState<string>('')
  const [finished, setFinished] = useState<boolean>(false)
  const [won, setWon] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = async () => {
    setLoading(true)
    setError('')
    try {
      const game = await startWordleGame()
      setGameId(game.gameId)
      setMaxGuesses(game.maxGuesses)
      setGuesses([])
      setResults([])
      setCurrentGuess('')
      setFinished(false)
      setWon(false)
    } catch {
      setError('Could not start game')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = async (key: string) => {
    if (finished || loading) return

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setError('Word must be 5 letters')
        return
      }
      setError('')
      setLoading(true)
      try {
        const response = await submitWordleGuess(gameId, currentGuess)
        setGuesses([...guesses, currentGuess])
        setResults([...results, response.result])
        setCurrentGuess('')
        setFinished(response.finished)
        setWon(response.won)
      } catch {
        setError('Invalid guess')
      } finally {
        setLoading(false)
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key.toLowerCase())
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER')
      else if (e.key === 'Backspace') handleKeyPress('BACKSPACE')
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase())
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentGuess, gameId, finished, loading, guesses, results])

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <h1 className="text-2xl font-bold">Wordle 🟩</h1>
        <button
          onClick={startNewGame}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition"
        >
          New Game
        </button>
      </header>

      <main className="max-w-md mx-auto">
        <WordleGrid
          guesses={guesses}
          results={results}
          currentGuess={currentGuess}
          maxGuesses={maxGuesses}
        />

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

        {finished && (
          <div className="mt-8 text-center">
            <h2 className={`text-3xl font-bold mb-4 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? '🎉 You won!' : '😔 Game over'}
            </h2>
            <button
              onClick={startNewGame}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold transition"
            >
              Play Again
            </button>
          </div>
        )}

        <p className="text-gray-400 text-sm text-center mt-6">
          Type on your keyboard to guess. Press Enter to submit.
        </p>
      </main>
    </div>
  )
}