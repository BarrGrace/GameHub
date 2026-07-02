package com.gamehub.gamehub.tango;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
public class TangoGenerator {

    private final TangoValidator validator;
    private final TangoSolver solver;
    private final Random random = new Random();

    public TangoGenerator(TangoValidator validator, TangoSolver solver) {
        this.validator = validator;
        this.solver = solver;
    }

    /**
     * Generates a complete result: solution + constraints + puzzle (with cells removed).
     */
    public TangoBoard generate(String difficulty) {
        int[][] solution = generateSolvedBoard();
        char[][] hConstraints = new char[6][5];
        char[][] vConstraints = new char[5][6];

        fillConstraints(hConstraints, vConstraints, solution);
        int[][] puzzle = removeCells(solution, hConstraints, vConstraints, difficulty);

        return new TangoBoard(puzzle, solution, hConstraints, vConstraints);
    }

    // Step 1: generate a fully solved 6x6 board with backtracking
    private int[][] generateSolvedBoard() {
        int[][] board = new int[6][6];
        char[][] empty5x6 = new char[5][6];
        char[][] empty6x5 = new char[6][5];
        fillBoard(board, empty6x5, empty5x6, 0, 0);
        return board;
    }

    private boolean fillBoard(int[][] board, char[][] hConstraints, char[][] vConstraints,
                              int row, int col) {
        if (row == 6) return true;

        int nextRow = col == 5 ? row + 1 : row;
        int nextCol = col == 5 ? 0 : col + 1;

        List<Integer> values = new ArrayList<>(List.of(1, 2));
        Collections.shuffle(values, random);

        for (int value : values) {
            if (validator.isValid(board, hConstraints, vConstraints, row, col, value)) {
                board[row][col] = value;
                if (fillBoard(board, hConstraints, vConstraints, nextRow, nextCol)) {
                    return true;
                }
                board[row][col] = 0;
            }
        }
        return false;
    }

    // Step 2: sprinkle some constraint markers between cells
    private void fillConstraints(char[][] hConstraints, char[][] vConstraints, int[][] solution) {
        // Initialize all to no constraint
        for (int i = 0; i < 6; i++) {
            for (int j = 0; j < 5; j++) hConstraints[i][j] = ' ';
        }
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 6; j++) vConstraints[i][j] = ' ';
        }

        // Add ~6-8 random markers to give the puzzle character
        int markersToAdd = 6 + random.nextInt(3);
        int added = 0;
        int attempts = 0;

        while (added < markersToAdd && attempts < 100) {
            attempts++;
            boolean horizontal = random.nextBoolean();

            if (horizontal) {
                int r = random.nextInt(6);
                int c = random.nextInt(5);
                if (hConstraints[r][c] != ' ') continue;
                hConstraints[r][c] = solution[r][c] == solution[r][c + 1] ? '=' : 'x';
                added++;
            } else {
                int r = random.nextInt(5);
                int c = random.nextInt(6);
                if (vConstraints[r][c] != ' ') continue;
                vConstraints[r][c] = solution[r][c] == solution[r + 1][c] ? '=' : 'x';
                added++;
            }
        }
    }

    // Step 3: remove cells one by one, checking uniqueness after each removal
    private int[][] removeCells(int[][] solution, char[][] hConstraints, char[][] vConstraints,
                                String difficulty) {
        int targetRemoved = switch (difficulty.toLowerCase()) {
            case "easy" -> 18;
            case "medium" -> 24;
            case "hard" -> 28;
            default -> 24;
        };

        int[][] puzzle = deepCopy(solution);
        List<int[]> positions = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            for (int j = 0; j < 6; j++) positions.add(new int[]{i, j});
        }
        Collections.shuffle(positions, random);

        int removed = 0;
        for (int[] pos : positions) {
            if (removed >= targetRemoved) break;

            int saved = puzzle[pos[0]][pos[1]];
            puzzle[pos[0]][pos[1]] = 0;

            int count = solver.countSolutions(puzzle, hConstraints, vConstraints);
            if (count == 1) {
                removed++;
            } else {
                puzzle[pos[0]][pos[1]] = saved; // restore
            }
        }

        return puzzle;
    }

    private int[][] deepCopy(int[][] original) {
        int[][] copy = new int[6][6];
        for (int i = 0; i < 6; i++) {
            System.arraycopy(original[i], 0, copy[i], 0, 6);
        }
        return copy;
    }
}