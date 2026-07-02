import client from '../../api/client'
import type { TangoGame } from '../../api/types'

export async function startTangoGame(difficulty: string): Promise<TangoGame> {
  const response = await client.post<TangoGame>('/tango/start', { difficulty })
  return response.data
}

export async function submitTangoMove(
  gameId: string,
  row: number,
  col: number,
  value: number
): Promise<TangoGame> {
  const response = await client.post<TangoGame>('/tango/move', { gameId, row, col, value })
  return response.data
}

export async function clearTangoCell(
  gameId: string,
  row: number,
  col: number
): Promise<TangoGame> {
  const response = await client.post<TangoGame>('/tango/clear', { gameId, row, col })
  return response.data
}