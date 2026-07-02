import client from '../../api/client'
import type { TicTacToeGame } from '../../api/types'

export async function startTicTacToeGame(playerO: string): Promise<TicTacToeGame> {
  const response = await client.post<TicTacToeGame>('/tictactoe/start', { playerO })
  return response.data
}

export async function makeTicTacToeMove(gameId: string, position: number): Promise<TicTacToeGame> {
  const response = await client.post<TicTacToeGame>('/tictactoe/move', { gameId, position })
  return response.data
}

export async function getTicTacToeGame(gameId: string): Promise<TicTacToeGame> {
  const response = await client.get<TicTacToeGame>(`/tictactoe/${gameId}`)
  return response.data
}