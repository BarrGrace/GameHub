package com.gamehub.gamehub.tango;

import org.springframework.stereotype.Component;

@Component
public class TangoSolver {

    private final TangoValidator validator;

    public TangoSolver(TangoValidator validator) {
        this.validator = validator;
    }

    /**
     * Counts solutions to the puzzle. Stops at 2 for performance —
     * we only need to know if there's a unique solution.
     */
    public int countSolutions(int[][] board, char[][] hConstraints, char[][] vConstraints) {
        int[][] copy = deepCopy(board);
        return solve(copy, hConstraints, vConstraints, 0, 0, 2);
    }

    private int solve(int[][] board, char[][] hConstraints, char[][] vConstraints,
                      int row, int col, int cap) {
        if (row == 6) return 1; // completed board — one solution found

        int nextRow = col == 5 ? row + 1 : row;
        int nextCol = col == 5 ? 0 : col + 1;

        if (board[row][col] != 0) {
            return solve(board, hConstraints, vConstraints, nextRow, nextCol, cap);
        }

        int count = 0;
        for (int value : new int[]{1, 2}) {
            if (validator.isValid(board, hConstraints, vConstraints, row, col, value)) {
                board[row][col] = value;
                count += solve(board, hConstraints, vConstraints, nextRow, nextCol, cap);
                board[row][col] = 0;

                if (count >= cap) return count; // early exit for uniqueness check
            }
        }
        return count;
    }

    private int[][] deepCopy(int[][] original) {
        int[][] copy = new int[6][6];
        for (int i = 0; i < 6; i++) {
            System.arraycopy(original[i], 0, copy[i], 0, 6);
        }
        return copy;
    }
}