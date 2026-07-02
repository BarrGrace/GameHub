package com.gamehub.gamehub.wordle;

import lombok.Data;

import java.util.List;

@Data
public class WordleGameDTO {
    private String gameId;
    private String username;
    private List<String> guesses;
    private int maxGuesses;
    private boolean won;
    private boolean finished;

    public static WordleGameDTO from(WordleGame game) {
        WordleGameDTO dto = new WordleGameDTO();
        dto.setGameId(game.getGameId());
        dto.setUsername(game.getUsername());
        dto.setGuesses(game.getGuesses());
        dto.setMaxGuesses(game.getMaxGuesses());
        dto.setWon(game.isWon());
        dto.setFinished(game.isFinished());
        return dto;
    }
}