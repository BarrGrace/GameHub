import client from '../../api/client'
import type { WordleStartResponse, WordleGuessResponse } from '../../api/types'

export async function startWordleGame(): Promise<WordleStartResponse> {
  const response = await client.post<WordleStartResponse>('/wordle/start')
  return response.data
}

export async function submitWordleGuess(
  gameId: string,
  guess: string
): Promise<WordleGuessResponse> {
  const response = await client.post<WordleGuessResponse>('/wordle/guess', {
    gameId,
    guess,
  })
  return response.data
}