package com.gamehub.gamehub.sudoku;

import org.springframework.stereotype.Component;

@Component
public class SudokuSolver {

    /**
     * Counts solutions to the puzzle. Caps at 2 for performance —
     * we only need to know if there's a unique solution.
     */
    public int countSolutions(int[][] board) {
        int[][] copy = deepCopy(board);
        return solve(copy, 0, 0, 2);
    }

    private int solve(int[][] board, int row, int col, int cap) {
        if (row == 9) return 1;

        int nextRow = col == 8 ? row + 1 : row;
        int nextCol = col == 8 ? 0 : col + 1;

        if (board[row][col] != 0) {
            return solve(board, nextRow, nextCol, cap);
        }

        int count = 0;
        for (int value = 1; value <= 9; value++) {
            if (isValid(board, row, col, value)) {
                board[row][col] = value;
                count += solve(board, nextRow, nextCol, cap);
                board[row][col] = 0;

                if (count >= cap) return count;
            }
        }
        return count;
    }

    private boolean isValid(int[][] board, int row, int col, int num) {
        for (int j = 0; j < 9; j++) {
            if (board[row][j] == num) return false;
        }
        for (int i = 0; i < 9; i++) {
            if (board[i][col] == num) return false;
        }
        int boxRow = (row / 3) * 3;
        int boxCol = (col / 3) * 3;
        for (int i = boxRow; i < boxRow + 3; i++) {
            for (int j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] == num) return false;
            }
        }
        return true;
    }

    private int[][] deepCopy(int[][] original) {
        int[][] copy = new int[9][9];
        for (int i = 0; i < 9; i++) {
            System.arraycopy(original[i], 0, copy[i], 0, 9);
        }
        return copy;
    }
}