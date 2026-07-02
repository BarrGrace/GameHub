package com.gamehub.gamehub.tango;

import com.gamehub.gamehub.score.ScoreService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TangoService {

    private final TangoGenerator generator;
    private final ScoreService scoreService;
    private final Map<String, TangoGame> activeGames = new HashMap<>();

    public TangoService(TangoGenerator generator, ScoreService scoreService) {
        this.generator = generator;
        this.scoreService = scoreService;
    }

    public TangoGame startGame(String username, String difficulty) {
        TangoBoard board = generator.generate(difficulty);

        TangoGame game = new TangoGame(
            username,
            board.getPuzzle(),
            board.getSolution(),
            board.getHConstraints(),
            board.getVConstraints(),
            difficulty
        );
        activeGames.put(game.getGameId(), game);
        return game;
    }

    public TangoGame submitMove(String gameId, String username, int row, int col, int value) {
        TangoGame game = activeGames.get(gameId);

        if (game == null) throw new RuntimeException("Game not found");
        if (!game.getUsername().equals(username)) throw new RuntimeException("Not your game");
        if (game.isFinished()) throw new RuntimeException("Game already finished");
        if (row < 0 || row > 5 || col < 0 || col > 5) throw new RuntimeException("Position must be 0-5");
        if (value != 1 && value != 2) throw new RuntimeException("Value must be 1 (sun) or 2 (moon)");
        if (game.getGiven()[row][col]) throw new RuntimeException("Cannot edit a given cell");

        game.getCurrent()[row][col] = value;

        if (isBoardComplete(game) && matchesSolution(game)) {
            game.setWon(true);
            game.setFinished(true);
            int score = calculateScore(game.getDifficulty());
            scoreService.saveScore(username, "tango", score);
        }

        return game;
    }

    public TangoGame clearCell(String gameId, String username, int row, int col) {
        TangoGame game = activeGames.get(gameId);

        if (game == null) throw new RuntimeException("Game not found");
        if (!game.getUsername().equals(username)) throw new RuntimeException("Not your game");
        if (game.getGiven()[row][col]) throw new RuntimeException("Cannot clear a given cell");

        game.getCurrent()[row][col] = 0;
        return game;
    }

    public TangoGame getGame(String gameId) {
        return activeGames.get(gameId);
    }

    private int calculateScore(String difficulty) {
        return switch (difficulty.toLowerCase()) {
            case "easy" -> 50;
            case "medium" -> 100;
            case "hard" -> 150;
            default -> 100;
        };
    }

    private boolean isBoardComplete(TangoGame game) {
        int[][] current = game.getCurrent();
        for (int i = 0; i < 6; i++) {
            for (int j = 0; j < 6; j++) {
                if (current[i][j] == 0) return false;
            }
        }
        return true;
    }

    private boolean matchesSolution(TangoGame game) {
        int[][] current = game.getCurrent();
        int[][] solution = game.getSolution();
        for (int i = 0; i < 6; i++) {
            for (int j = 0; j < 6; j++) {
                if (current[i][j] != solution[i][j]) return false;
            }
        }
        return true;
    }
}