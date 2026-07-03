interface WordleGridProps {
  guesses: string[]
  results: ('green' | 'yellow' | 'grey')[][]
  currentGuess: string
  maxGuesses: number
}

const colorClasses: Record<string, string> = {
  green: 'bg-green-600 border-green-600',
  yellow: 'bg-yellow-500 border-yellow-500',
  grey: 'bg-gray-600 border-gray-600',
  empty: 'bg-gray-800 border-gray-700',
  typing: 'bg-gray-800 border-gray-500',
}

export default function WordleGrid({ guesses, results, currentGuess, maxGuesses }: WordleGridProps) {
  const rows = []

  for (let i = 0; i < maxGuesses; i++) {
    const guess = guesses[i] || ''
    const result = results[i] || []
    const isCurrentRow = i === guesses.length

    const cells = []
    for (let j = 0; j < 5; j++) {
      let letter = ''
      let colorClass = colorClasses.empty

      if (guess) {
        letter = guess[j]?.toUpperCase() || ''
        colorClass = colorClasses[result[j]] || colorClasses.empty
      } else if (isCurrentRow) {
        letter = currentGuess[j]?.toUpperCase() || ''
        if (letter) colorClass = colorClasses.typing
      }

      cells.push(
        <div
          key={j}
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 flex items-center justify-center text-2xl md:text-3xl font-bold rounded ${colorClass}`}
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