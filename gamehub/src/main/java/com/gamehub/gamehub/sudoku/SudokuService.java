package com.gamehub.gamehub.sudoku;

import com.gamehub.gamehub.score.ScoreService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SudokuService {

    private final SudokuGenerator generator;
    private final ScoreService scoreService;
    private final Map<String, SudokuGame> activeGames = new HashMap<>();

    public SudokuService(SudokuGenerator generator, ScoreService scoreService) {
        this.generator = generator;
        this.scoreService = scoreService;
    }

    public SudokuGame startGame(String username, String difficulty) {
        int[][] solution = generator.generateSolvedBoard();
        int[][] puzzle = generator.generatePuzzle(solution, difficulty);

        SudokuGame game = new SudokuGame(username, puzzle, solution, difficulty);
        activeGames.put(game.getGameId(), game);
        return game;
    }

    public SudokuGame submitMove(String gameId, String username, int row, int col, int value) {
        SudokuGame game = activeGames.get(gameId);

        if (game == null) throw new RuntimeException("Game not found");
        if (!game.getUsername().equals(username)) throw new RuntimeException("Not your game");
        if (game.isFinished()) throw new RuntimeException("Game already finished");
        if (row < 0 || row > 8 || col < 0 || col > 8) throw new RuntimeException("Position must be 0-8");
        if (value < 1 || value > 9) throw new RuntimeException("Value must be 1-9");
        if (game.getGiven()[row][col]) throw new RuntimeException("Cannot edit a given cell");

        game.getCurrent()[row][col] = value;

        if (isBoardComplete(game) && matchesSolution(game)) {
            game.setWon(true);
            game.setFinished(true);
            int score = calculateScore(game.getDifficulty());
            scoreService.saveScore(username, "sudoku", score);
        }

        return game;
    }

    public SudokuGame clearCell(String gameId, String username, int row, int col) {
        SudokuGame game = activeGames.get(gameId);

        if (game == null) throw new RuntimeException("Game not found");
        if (!game.getUsername().equals(username)) throw new RuntimeException("Not your game");
        if (game.getGiven()[row][col]) throw new RuntimeException("Cannot clear a given cell");

        game.getCurrent()[row][col] = 0;
        return game;
    }

    public SudokuGame getGame(String gameId) {
        return activeGames.get(gameId);
    }

    private int calculateScore(String difficulty) {
        return switch (difficulty.toLowerCase()) {
            case "easy" -> 50;
            case "medium" -> 100;
            case "hard" -> 200;
            default -> 100;
        };
    }

    private boolean isBoardComplete(SudokuGame game) {
        int[][] current = game.getCurrent();
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (current[i][j] == 0) return false;
            }
        }
        return true;
    }

    private boolean matchesSolution(SudokuGame game) {
        int[][] current = game.getCurrent();
        int[][] solution = game.getSolution();
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (current[i][j] != solution[i][j]) return false;
            }
        }
        return true;
    }
}