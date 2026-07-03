interface Props {
  onKey: (key: string) => void
  disabled: boolean
}

const rows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

export default function WordleKeyboard({ onKey, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1 sm:gap-2 max-w-lg md:max-w-3xl mx-auto mt-6">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE'
            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                disabled={disabled}
                className={`
                  ${isSpecial ? 'px-4 md:px-8 text-xs md:text-base' : 'w-10 sm:w-12 md:w-16'}
                  h-14 md:h-16 rounded font-semibold text-lg md:text-xl
                  bg-gray-600 hover:bg-gray-500 active:bg-gray-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition
                `}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}