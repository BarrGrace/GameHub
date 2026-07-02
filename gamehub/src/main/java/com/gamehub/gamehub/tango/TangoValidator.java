package com.gamehub.gamehub.tango;

import org.springframework.stereotype.Component;

@Component
public class TangoValidator {

    /**
     * Checks if placing 'value' at (row, col) would violate any rule.
     * Returns true if the placement is valid (no rule broken so far).
     */
    public boolean isValid(int[][] board, char[][] hConstraints, char[][] vConstraints,
                           int row, int col, int value) {
        // Temporarily place the value for checking
        board[row][col] = value;

        boolean valid = checkRowBalance(board, row, value)
                     && checkColumnBalance(board, col, value)
                     && checkNoThreeInRow(board, row, col)
                     && checkConstraints(board, hConstraints, vConstraints, row, col);

        board[row][col] = 0; // revert
        return valid;
    }

    // Each row can have max 3 suns (1) and max 3 moons (2)
    private boolean checkRowBalance(int[][] board, int row, int value) {
        int count = 0;
        for (int j = 0; j < 6; j++) {
            if (board[row][j] == value) count++;
        }
        return count <= 3;
    }

    private boolean checkColumnBalance(int[][] board, int col, int value) {
        int count = 0;
        for (int i = 0; i < 6; i++) {
            if (board[i][col] == value) count++;
        }
        return count <= 3;
    }

    // No three of the same symbol consecutively in row or column
    private boolean checkNoThreeInRow(int[][] board, int row, int col) {
        // horizontal — check windows of 3 around (row, col)
        for (int start = Math.max(0, col - 2); start <= Math.min(3, col); start++) {
            int v = board[row][start];
            if (v != 0 && v == board[row][start + 1] && v == board[row][start + 2]) {
                return false;
            }
        }
        // vertical — check windows of 3 around (row, col)
        for (int start = Math.max(0, row - 2); start <= Math.min(3, row); start++) {
            int v = board[start][col];
            if (v != 0 && v == board[start + 1][col] && v == board[start + 2][col]) {
                return false;
            }
        }
        return true;
    }

    // Constraint markers: '=' means same, 'x' means different
    private boolean checkConstraints(int[][] board, char[][] hConstraints, char[][] vConstraints,
                                     int row, int col) {
        int v = board[row][col];
        // horizontal constraint to the left
        if (col > 0) {
            char c = hConstraints[row][col - 1];
            int left = board[row][col - 1];
            if (left != 0 && !checkPair(left, v, c)) return false;
        }
        // horizontal constraint to the right
        if (col < 5) {
            char c = hConstraints[row][col];
            int right = board[row][col + 1];
            if (right != 0 && !checkPair(v, right, c)) return false;
        }
        // vertical constraint above
        if (row > 0) {
            char c = vConstraints[row - 1][col];
            int above = board[row - 1][col];
            if (above != 0 && !checkPair(above, v, c)) return false;
        }
        // vertical constraint below
        if (row < 5) {
            char c = vConstraints[row][col];
            int below = board[row + 1][col];
            if (below != 0 && !checkPair(v, below, c)) return false;
        }
        return true;
    }

    private boolean checkPair(int a, int b, char constraint) {
        if (constraint == '=') return a == b;
        if (constraint == 'x') return a != b;
        return true; // no constraint
    }
} 