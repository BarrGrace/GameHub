import client from '../../api/client'
import type { SudokuGame } from '../../api/types'

export async function startSudokuGame(difficulty: string): Promise<SudokuGame> {
  const response = await client.post<SudokuGame>('/sudoku/start', { difficulty })
  return response.data
}

export async function submitSudokuMove(
  gameId: string,
  row: number,
  col: number,
  value: number
): Promise<SudokuGame> {
  const response = await client.post<SudokuGame>('/sudoku/move', { gameId, row, col, value })
  return response.data
}

export async function clearSudokuCell(
  gameId: string,
  row: number,
  col: number
): Promise<SudokuGame> {
  const response = await client.post<SudokuGame>('/sudoku/clear', { gameId, row, col })
  return response.data
}