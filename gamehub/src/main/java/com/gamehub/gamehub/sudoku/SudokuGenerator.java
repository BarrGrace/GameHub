package com.gamehub.gamehub.sudoku;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
public class SudokuGenerator {

    private final SudokuSolver solver;
    private final Random random = new Random();

    public SudokuGenerator(SudokuSolver solver) {
        this.solver = solver;
    }

    public int[][] generateSolvedBoard() {
        int[][] board = new int[9][9];
        fillBoard(board);
        return board;
    }

    public int[][] generatePuzzle(int[][] solution, String difficulty) {
        int targetRemoved = switch (difficulty.toLowerCase()) {
            case "easy" -> 40;
            case "medium" -> 50;
            case "hard" -> 56;
            default -> 50;
        };

        int[][] puzzle = deepCopy(solution);
        List<int[]> positions = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                positions.add(new int[]{i, j});
            }
        }
        Collections.shuffle(positions, random);

        int removed = 0;
        for (int[] pos : positions) {
            if (removed >= targetRemoved) break;

            int saved = puzzle[pos[0]][pos[1]];
            puzzle[pos[0]][pos[1]] = 0;

            int count = solver.countSolutions(puzzle);
            if (count == 1) {
                removed++;
            } else {
                puzzle[pos[0]][pos[1]] = saved;
            }
        }

        return puzzle;
    }

    private boolean fillBoard(int[][] board) {
        for (int row = 0; row < 9; row++) {
            for (int col = 0; col < 9; col++) {
                if (board[row][col] == 0) {
                    List<Integer> numbers = new ArrayList<>();
                    for (int n = 1; n <= 9; n++) numbers.add(n);
                    Collections.shuffle(numbers, random);

                    for (int num : numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isValid(int[][] board, int row, int col, int num) {
        // Check row
        for (int j = 0; j < 9; j++) {
            if (board[row][j] == num) return false;
        }
        // Check column
        for (int i = 0; i < 9; i++) {
            if (board[i][col] == num) return false;
        }
        // Check 3x3 box
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