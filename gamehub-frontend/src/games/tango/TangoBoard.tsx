interface Props {
  current: number[][]
  given: boolean[][]
  hConstraints: string[]
  vConstraints: string[]
  selectedCell: [number, number] | null
  onCellClick: (row: number, col: number) => void
  disabled: boolean
}

const symbols: Record<number, string> = {
  0: '',
  1: '☀️',
  2: '🌙',
}

export default function TangoBoard({
  current,
  given,
  hConstraints,
  vConstraints,
  selectedCell,
  onCellClick,
  disabled,
}: Props) {
  const getHConstraint = (row: number, col: number): string => {
    const rowStr = hConstraints[row]
    if (!rowStr || col >= rowStr.length) return ' '
    return rowStr[col]
  }

  const getVConstraint = (row: number, col: number): string => {
    const rowStr = vConstraints[row]
    if (!rowStr || col >= rowStr.length) return ' '
    return rowStr[col]
  }

  const constraintDisplay = (c: string) => {
    if (c === '=') return '='
    if (c === 'x') return '×'
    return ''
  }

  return (
    <div className="inline-block bg-gray-700 p-4 rounded-lg">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          {/* Row of cells with horizontal constraints between them */}
          <div className="flex items-center">
            {[0, 1, 2, 3, 4, 5].map((j) => {
              const value = current[i][j]
              const isGiven = given[i][j]
              const isSelected = selectedCell?.[0] === i && selectedCell?.[1] === j

              return (
                <div key={j} className="flex items-center">
                  <button
                    onClick={() => onCellClick(i, j)}
                    disabled={disabled || isGiven}
                    className={`
                      w-12 h-12 flex items-center justify-center text-2xl rounded
                      ${isGiven ? 'bg-gray-900' : 'bg-gray-800'}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      ${!isGiven && !disabled ? 'hover:bg-gray-600' : ''}
                      disabled:cursor-not-allowed transition
                    `}
                  >
                    {symbols[value]}
                  </button>
                  {j < 5 && (
                    <div className="w-4 flex items-center justify-center text-yellow-400 font-bold">
                      {constraintDisplay(getHConstraint(i, j))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Vertical constraints row (between this row and the next) */}
          {i < 5 && (
            <div className="flex">
              {[0, 1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center">
                  <div className="w-12 h-4 flex items-center justify-center text-yellow-400 font-bold">
                    {constraintDisplay(getVConstraint(i, j))}
                  </div>
                  {j < 5 && <div className="w-4" />}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}