interface WordleGridProps {
  guesses: string[]
  results: ('green' | 'yellow' | 'grey')[][]
  currentGuess: string
  maxGuesses: number
  wordLength: number
  revealingResult?: ('green' | 'yellow' | 'grey')[] | null
  revealedCount?: number
}

const colorClasses: Record<string, string> = {
  green: 'bg-green-600 border-green-600',
  yellow: 'bg-yellow-500 border-yellow-500',
  grey: 'bg-gray-600 border-gray-600',
  empty: 'bg-gray-800 border-gray-700',
  typing: 'bg-gray-800 border-gray-500',
  submitted: 'bg-gray-700 border-gray-500',
}

export default function WordleGrid({
  guesses,
  results,
  currentGuess,
  maxGuesses,
  wordLength,
  revealingResult,
  revealedCount = 0,
}: WordleGridProps) {
  const rows = []

  // If a reveal is in progress, the "current row" for input is one after the reveal row.
  // guesses already contains the submitted word for the row being revealed.
  const revealingRowIndex = revealingResult ? guesses.length - 1 : -1

  for (let i = 0; i < maxGuesses; i++) {
    const guess = guesses[i] || ''
    const result = results[i] || []
    const isRevealingRow = i === revealingRowIndex
    const isCurrentRow = i === guesses.length && !revealingResult

    const cells = []
    for (let j = 0; j < wordLength; j++) {
      let letter = ''
      let colorClass = colorClasses.empty

      if (isRevealingRow && revealingResult) {
        letter = guess[j]?.toUpperCase() || ''
        if (j < revealedCount) {
          colorClass = colorClasses[revealingResult[j]] || colorClasses.submitted
        } else {
          colorClass = colorClasses.submitted
        }
      } else if (guess && result.length > 0) {
        letter = guess[j]?.toUpperCase() || ''
        colorClass = colorClasses[result[j]] || colorClasses.empty
      } else if (isCurrentRow) {
        letter = currentGuess[j]?.toUpperCase() || ''
        if (letter) colorClass = colorClasses.typing
      }

      const isRevealed = isRevealingRow && j < revealedCount
      const isPop = !isRevealingRow && guess && result.length > 0

      cells.push(
        <div
          key={j}
          className={`
            w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
            border-2 flex items-center justify-center text-2xl md:text-3xl font-bold rounded
            transition-transform duration-500
            ${colorClass}
            ${isRevealed ? 'animate-flip-in' : ''}
            ${isPop && letter ? 'animate-cell-pop' : ''}
          `}
        >
          {letter}
        </div>
      )
    }

    rows.push(
      <div key={i} className="flex gap-2 justify-center">
        {cells}
      </div>
    )
  }

  return <div className="flex flex-col gap-2">{rows}</div>
}
