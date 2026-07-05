interface Props {
  current: number[][]
  given: boolean[][]
  conflicts: boolean[][]
  selectedCell: [number, number] | null
  onCellClick: (row: number, col: number) => void
  disabled: boolean
}

export default function SudokuBoard({
  current,
  given,
  conflicts,
  selectedCell,
  onCellClick,
  disabled,
}: Props) {
  return (
    <div className="inline-block bg-blue-500 rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-1 bg-blue-500 p-1">
        {[0, 1, 2].map((boxRow) =>
          [0, 1, 2].map((boxCol) => (
            <div key={`${boxRow}-${boxCol}`} className="grid grid-cols-3 gap-[2px] bg-gray-500 p-[2px]">
              {[0, 1, 2].map((r) =>
                [0, 1, 2].map((c) => {
                  const i = boxRow * 3 + r
                  const j = boxCol * 3 + c
                  const value = current[i][j]
                  const isGiven = given[i][j]
                  const isConflict = conflicts[i][j]
                  const isSelected = selectedCell?.[0] === i && selectedCell?.[1] === j
                  const isInSameRow = selectedCell?.[0] === i
                  const isInSameCol = selectedCell?.[1] === j
                  const isInSameBox =
                    selectedCell &&
                    Math.floor(selectedCell[0] / 3) === boxRow &&
                    Math.floor(selectedCell[1] / 3) === boxCol

                  let bg = isGiven ? 'bg-gray-800' : 'bg-gray-900'
                  if (isInSameRow || isInSameCol || isInSameBox) {
                    bg = isGiven ? 'bg-gray-700' : 'bg-gray-800'
                  }
                  if (isSelected) bg = 'bg-blue-900'
                  if (isConflict) bg = 'bg-red-900'

                  let textColor = isGiven ? 'text-gray-300' : 'text-blue-300'
                  if (isConflict) textColor = 'text-red-300'

                  return (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => onCellClick(i, j)}
                      disabled={disabled || isGiven}
                      className={`
                        w-10 h-10 flex items-center justify-center text-xl font-bold
                        ${bg}
                        ${textColor}
                        ${!isGiven && !disabled ? 'hover:bg-blue-800' : ''}
                        disabled:cursor-not-allowed transition
                      `}
                    >
                      {value !== 0 ? value : ''}
                    </button>
                  )
                })
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}