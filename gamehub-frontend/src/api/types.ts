// Auth
export interface User {
  username: string
  password: string
}

// Score
export interface Score {
  id: number
  user: { id: number; username: string }
  game: string
  score: number
  playedAt: string
}

// Wordle
export interface WordleStartResponse {
  gameId: string
  maxGuesses: number
}

export interface WordleGuessResponse {
  result: ('green' | 'yellow' | 'grey')[]
  won: boolean
  finished: boolean
  guessesUsed: number
  guessesRemaining: number
}

// Tic Tac Toe
export interface TicTacToeGame {
  gameId: string
  mode: string
  playerX: string
  playerO: string
  board: (string | null)[]
  currentTurn: 'X' | 'O'
  winner: 'X' | 'O' | 'DRAW' | null
  finished: boolean
}

// Sudoku
export interface SudokuGame {
  gameId: string
  username: string
  puzzle: number[][]
  current: number[][]
  given: boolean[][]
  difficulty: string
  finished: boolean
  won: boolean
}

// Tango
export interface TangoGame {
  gameId: string
  username: string
  puzzle: number[][]
  current: number[][]
  given: boolean[][]
  hConstraints: string[]
  vConstraints: string[]
  difficulty: string
  finished: boolean
  won: boolean
}