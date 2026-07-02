package com.gamehub.gamehub.sudoku;

import lombok.Data;

@Data
public class SudokuGameDTO {
    private String gameId;
    private String username;
    private int[][] puzzle;
    private int[][] current;
    private boolean[][] given;
    private String difficulty;
    private boolean finished;
    private boolean won;

    public static SudokuGameDTO from(SudokuGame game) {
        SudokuGameDTO dto = new SudokuGameDTO();
        dto.setGameId(game.getGameId());
        dto.setUsername(game.getUsername());
        dto.setPuzzle(game.getPuzzle());
        dto.setCurrent(game.getCurrent());
        dto.setGiven(game.getGiven());
        dto.setDifficulty(game.getDifficulty());
        dto.setFinished(game.isFinished());
        dto.setWon(game.isWon());
        return dto;
    }
}