package com.gamehub.gamehub.tictactoe;

import lombok.Data;

import java.util.UUID;

@Data
public class TicTacToeGame {
    private String gameId;
    private String mode;          // "pvp" or "ai" (future)
    private String playerX;       // username
    private String playerO;       // username (or "AI" in future)
    private String[] board;       // 9 cells, indices 0-8
    private String currentTurn;   // "X" or "O"
    private String winner;        // "X", "O", "DRAW", or null
    private boolean finished;

    public TicTacToeGame(String playerX, String playerO, String mode) {
        this.gameId = UUID.randomUUID().toString();
        this.mode = mode;
        this.playerX = playerX;
        this.playerO = playerO;
        this.board = new String[9];
        this.currentTurn = "X";
        this.winner = null;
        this.finished = false;
    }
}