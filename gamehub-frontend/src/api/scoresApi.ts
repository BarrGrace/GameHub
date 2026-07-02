import client from './client'
import type { Score } from './types'

export async function getLeaderboard(game: string): Promise<Score[]> {
  const response = await client.get<Score[]>(`/scores/leaderboard/${game}`)
  return response.data
}

export async function getMyScores(): Promise<Score[]> {
  const response = await client.get<Score[]>('/scores/me')
  return response.data
}