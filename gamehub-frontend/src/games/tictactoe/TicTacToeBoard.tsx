interface Props {
  board: (string | null)[]
  onCellClick: (position: number) => void
  disabled: boolean
}

export default function TicTacToeBoard({ board, onCellClick, disabled }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
      {board.map((cell, index) => (
        <button
          key={index}
          onClick={() => onCellClick(index)}
          disabled={disabled || cell !== null}
          className={`
            aspect-square rounded-lg text-5xl font-bold
            flex items-center justify-center transition
            ${cell === 'X' ? 'bg-blue-900 text-blue-300' : ''}
            ${cell === 'O' ? 'bg-red-900 text-red-300' : ''}
            ${!cell ? 'bg-gray-800 hover:bg-gray-700' : ''}
            disabled:cursor-not-allowed
          `}
        >
          {cell}
        </button>
      ))}
    </div>
  )
}