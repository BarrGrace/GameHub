package com.gamehub.gamehub.tango;

import lombok.Data;

import java.util.UUID;

@Data
public class TangoGame {
    private String gameId;
    private String username;
    private int[][] puzzle;          // starting puzzle (0=empty, 1=sun, 2=moon)
    private int[][] solution;        // complete solution
    private int[][] current;         // user's current state
    private boolean[][] given;       // which cells were pre-filled
    private char[][] hConstraints;   // 6x5 — between (r,c) and (r,c+1) — '=', 'x', or ' '
    private char[][] vConstraints;   // 5x6 — between (r,c) and (r+1,c) — '=', 'x', or ' '
    private boolean finished;
    private boolean won;
    private String difficulty;

    public TangoGame(String username, int[][] puzzle, int[][] solution,
                    char[][] hConstraints, char[][] vConstraints, String difficulty) {
        this.gameId = UUID.randomUUID().toString();
        this.username = username;
        this.puzzle = puzzle;
        this.solution = solution;
        this.current = deepCopy(puzzle);
        this.given = computeGivenCells(puzzle);
        this.hConstraints = hConstraints;
        this.vConstraints = vConstraints;
        this.difficulty = difficulty;
        this.finished = false;
        this.won = false;
    }

    private int[][] deepCopy(int[][] original) {
        int[][] copy = new int[6][6];
        for (int i = 0; i < 6; i++) {
            System.arraycopy(original[i], 0, copy[i], 0, 6);
        }
        return copy;
    }

    private boolean[][] computeGivenCells(int[][] puzzle) {
        boolean[][] given = new boolean[6][6];
        for (int i = 0; i < 6; i++) {
            for (int j = 0; j < 6; j++) {
                given[i][j] = puzzle[i][j] != 0;
            }
        }
        return given;
    }
}