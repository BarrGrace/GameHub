package com.gamehub.gamehub.tictactoe;

import com.gamehub.gamehub.score.ScoreService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class TicTacToeService {

    private final ScoreService scoreService;
    private final Map<String, TicTacToeGame> activeGames = new HashMap<>();
    private final Random random = new Random();

    private static final int[][] WIN_LINES = {
        {0, 1, 2}, {3, 4, 5}, {6, 7, 8},
        {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
        {0, 4, 8}, {2, 4, 6}
    };

    public TicTacToeService(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    public TicTacToeGame startGame(String playerX, String playerO, String mode) {
        TicTacToeGame game = new TicTacToeGame(playerX, playerO, mode);
        activeGames.put(game.getGameId(), game);
        return game;
    }

    public TicTacToeGame makeMove(String gameId, String username, int position) {
        TicTacToeGame game = activeGames.get(gameId);

        if (game == null) throw new RuntimeException("Game not found");
        if (game.isFinished()) throw new RuntimeException("Game already finished");
        if (position < 0 || position > 8) throw new RuntimeException("Position must be 0-8");
        if (game.getBoard()[position] != null) throw new RuntimeException("Cell already occupied");

        String expectedPlayer = game.getCurrentTurn().equals("X")
            ? game.getPlayerX()
            : game.getPlayerO();

        if (!expectedPlayer.equals(username)) {
            throw new RuntimeException("Not your turn");
        }

        applyMove(game, position);

        // If it's now AI's turn, play automatically
        if (!game.isFinished() && "ai".equals(game.getMode()) && game.getCurrentTurn().equals("O")) {
            int aiMove = pickAIMove(game.getBoard());
            applyMove(game, aiMove);
        }

        return game;
    }

    private void applyMove(TicTacToeGame game, int position) {
        game.getBoard()[position] = game.getCurrentTurn();

        if (checkWinner(game.getBoard(), game.getCurrentTurn())) {
            game.setWinner(game.getCurrentTurn());
            game.setFinished(true);
            String winnerUsername = game.getCurrentTurn().equals("X")
                ? game.getPlayerX()
                : game.getPlayerO();
            String loserUsername = game.getCurrentTurn().equals("X")
                ? game.getPlayerO()
                : game.getPlayerX();
            if (!"AI".equals(winnerUsername)) scoreService.saveScore(winnerUsername, "tictactoe", 10);
            if (!"AI".equals(loserUsername)) scoreService.saveScore(loserUsername, "tictactoe", 0);
        } else if (isBoardFull(game.getBoard())) {
            game.setWinner("DRAW");
            game.setFinished(true);
            if (!"AI".equals(game.getPlayerX())) scoreService.saveScore(game.getPlayerX(), "tictactoe", 5);
            if (!"AI".equals(game.getPlayerO())) scoreService.saveScore(game.getPlayerO(), "tictactoe", 5);
        } else {
            game.setCurrentTurn(game.getCurrentTurn().equals("X") ? "O" : "X");
        }
    }

    private int pickAIMove(String[] board) {
        // 1. Take winning move if available
        for (int i = 0; i < 9; i++) {
            if (board[i] == null) {
                board[i] = "O";
                if (checkWinner(board, "O")) { board[i] = null; return i; }
                board[i] = null;
            }
        }
        // 2. Block opponent's winning move
        for (int i = 0; i < 9; i++) {
            if (board[i] == null) {
                board[i] = "X";
                if (checkWinner(board, "X")) { board[i] = null; return i; }
                board[i] = null;
            }
        }
        // 3. Prefer center, then corners, then edges
        int[] preferred = {4, 0, 2, 6, 8, 1, 3, 5, 7};
        List<Integer> available = new ArrayList<>();
        for (int p : preferred) {
            if (board[p] == null) available.add(p);
        }
        return available.get(0);
    }

    public TicTacToeGame getGame(String gameId) {
        return activeGames.get(gameId);
    }

    private boolean checkWinner(String[] board, String symbol) {
        for (int[] line : WIN_LINES) {
            if (symbol.equals(board[line[0]])
                && symbol.equals(board[line[1]])
                && symbol.equals(board[line[2]])) {
                return true;
            }
        }
        return false;
    }

    private boolean isBoardFull(String[] board) {
        for (String cell : board) {
            if (cell == null) return false;
        }
        return true;
    }
}