package com.gamehub.gamehub.sudoku;

import lombok.Data;

import java.util.UUID;

@Data
public class SudokuGame {
    private String gameId;
    private String username;
    private int[][] puzzle;      // The starting puzzle (0 = empty cell)
    private int[][] solution;    // The complete solution
    private int[][] current;     // The user's current state
    private boolean[][] given;   // Which cells were pre-filled (immutable)
    private String difficulty;
    private boolean finished;
    private boolean won;

    public SudokuGame(String username, int[][] puzzle, int[][] solution, String difficulty) {
        this.gameId = UUID.randomUUID().toString();
        this.username = username;
        this.puzzle = puzzle;
        this.solution = solution;
        this.current = deepCopy(puzzle);
        this.given = computeGivenCells(puzzle);
        this.difficulty = difficulty;
        this.finished = false;
        this.won = false;
    }

    private int[][] deepCopy(int[][] original) {
        int[][] copy = new int[9][9];
        for (int i = 0; i < 9; i++) {
            System.arraycopy(original[i], 0, copy[i], 0, 9);
        }
        return copy;
    }

    private boolean[][] computeGivenCells(int[][] puzzle) {
        boolean[][] given = new boolean[9][9];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                given[i][j] = puzzle[i][j] != 0;
            }
        }
        return given;
    }
}