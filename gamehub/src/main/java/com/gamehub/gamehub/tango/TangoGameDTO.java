package com.gamehub.gamehub.tango;

import lombok.Data;

@Data
public class TangoGameDTO {
    private String gameId;
    private String username;
    private int[][] puzzle;
    private int[][] current;
    private boolean[][] given;
    private char[][] hConstraints;
    private char[][] vConstraints;
    private String difficulty;
    private boolean finished;
    private boolean won;

    public static TangoGameDTO from(TangoGame game) {
        TangoGameDTO dto = new TangoGameDTO();
        dto.setGameId(game.getGameId());
        dto.setUsername(game.getUsername());
        dto.setPuzzle(game.getPuzzle());
        dto.setCurrent(game.getCurrent());
        dto.setGiven(game.getGiven());
        dto.setHConstraints(game.getHConstraints());
        dto.setVConstraints(game.getVConstraints());
        dto.setDifficulty(game.getDifficulty());
        dto.setFinished(game.isFinished());
        dto.setWon(game.isWon());
        return dto;
    }
}