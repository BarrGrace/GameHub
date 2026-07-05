import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { startWordleGame, submitWordleGuess } from './wordleApi'
import WordleGrid from './WordleGrid'
import WordleKeyboard from './WordleKeyboard'
import { useNotification } from '../../components/NotificationProvider'
import { useSound } from '../../hooks/useSound'

type Color = 'green' | 'yellow' | 'grey'

export default function WordlePage() {
  const navigate = useNavigate()
  const { show, dismiss } = useNotification()
  const { play } = useSound()
  const [gameId, setGameId] = useState<string>('')
  const [maxGuesses, setMaxGuesses] = useState<number>(6)
  const [wordLength, setWordLength] = useState<number>(5)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const [chosenDifficulty, setChosenDifficulty] = useState<string | null>(null)
  const [guesses, setGuesses] = useState<string[]>([])
  const [results, setResults] = useState<Color[][]>([])
  const [currentGuess, setCurrentGuess] = useState<string>('')
  const [finished, setFinished] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [revealingResult, setRevealingResult] = useState<Color[] | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)

  const startNewGame = async (chosen: string) => {
    setLoading(true)
    setError('')
    try {
      const game = await startWordleGame(chosen)
      setGameId(game.gameId)
      setMaxGuesses(game.maxGuesses)
      setWordLength(game.wordLength)
      setDifficulty(game.difficulty)
      setChosenDifficulty(chosen)
      setGuesses([])
      setResults([])
      setCurrentGuess('')
      setFinished(false)
      setRevealingResult(null)
      setRevealedCount(0)
    } catch {
      setError('Could not start game')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = async (key: string) => {
    if (finished || loading || !chosenDifficulty) return

    if (key === 'ENTER') {
      if (currentGuess.length !== wordLength) {
        setError(`Word must be ${wordLength} letters`)
        return
      }
      setError('')
      setLoading(true)
      try {
        const response = await submitWordleGuess(gameId, currentGuess)
        const submittedGuess = currentGuess
        setGuesses([...guesses, submittedGuess])
        setCurrentGuess('')
        setRevealingResult(response.result as Color[])
        setRevealedCount(0)

        const revealDelay = 900
        for (let i = 0; i < response.result.length; i++) {
          if (i > 0) {
            await new Promise((r) => setTimeout(r, revealDelay))
          }
          setRevealedCount(i + 1)
          const color = response.result[i]
          if (color === 'green') play('wordle-success-cell')
          else if (color === 'yellow') play('wordle-wrong-location-cell')
          else play('wrong-move')
        }

        // Let the last cell's animation finish before we transition to the "committed" state
        await new Promise((r) => setTimeout(r, 600))

        setResults([...results, response.result as Color[]])
        setRevealingResult(null)
        setRevealedCount(0)

        setFinished(response.finished)

        if (response.finished) {
          await new Promise((r) => setTimeout(r, 300))
          play(response.won ? 'win' : 'lost')
          show(response.won ? '🎉 You won!' : '😔 Game over', response.won ? 'success' : 'error', {
            subtext: response.won ? `Difficulty: ${difficulty}` : undefined,
            actions: [
              { label: 'Play again', variant: 'primary', onClick: () => { dismiss(); setChosenDifficulty(null); } },
              { label: 'Home', variant: 'secondary', onClick: () => { dismiss(); navigate('/'); } },
            ],
          })
        }
      } catch {
        setError('Invalid guess')
        show('Invalid guess', 'error')
      } finally {
        setLoading(false)
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
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
  }, [currentGuess, gameId, finished, loading, guesses, results, wordLength, chosenDifficulty])

  if (!chosenDifficulty) {
    return (
      <div className="min-h-screen p-6">
        <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
          <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
          <h1 className="text-2xl font-bold">Wordle 🟩</h1>
          <div />
        </header>

        <main className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Choose difficulty</h2>
          <div className="space-y-3">
            <button
              onClick={() => startNewGame('easy')}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-4 rounded font-semibold flex justify-between items-center"
            >
              <span>Easy</span>
              <span className="text-sm opacity-75">5 letters · 1× score</span>
            </button>
            <button
              onClick={() => startNewGame('medium')}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 p-4 rounded font-semibold flex justify-between items-center"
            >
              <span>Medium</span>
              <span className="text-sm opacity-75">6 letters · 2× score</span>
            </button>
            <button
              onClick={() => startNewGame('hard')}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 p-4 rounded font-semibold flex justify-between items-center"
            >
              <span>Hard</span>
              <span className="text-sm opacity-75">7 letters · 3× score</span>
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <h1 className="text-2xl font-bold">Wordle 🟩</h1>
        <button
          onClick={() => setChosenDifficulty(null)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition"
        >
          New Game
        </button>
      </header>

      <main className="max-w-3xl mx-auto">
        <p className="text-center text-gray-400 text-sm mb-4 capitalize">
          Difficulty: {difficulty}
        </p>

        <WordleGrid
          guesses={guesses}
          results={results}
          currentGuess={currentGuess}
          maxGuesses={maxGuesses}
          wordLength={wordLength}
          revealingResult={revealingResult}
          revealedCount={revealedCount}
        />

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

        <WordleKeyboard onKey={handleKeyPress} disabled={finished || loading} />

        <p className="text-gray-400 text-sm text-center mt-6">
          <span className="hidden md:inline">Type on your keyboard or </span>tap the keys and press Enter to submit.
        </p>
      </main>
    </div>
  )
}
