package com.gamehub.gamehub.tictactoe;

import com.gamehub.gamehub.score.ScoreService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TicTacToeService {

    private final ScoreService scoreService;
    private final Map<String, TicTacToeGame> activeGames = new HashMap<>();

    private static final int[][] WIN_LINES = {
        {0, 1, 2}, {3, 4, 5}, {6, 7, 8},
        {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
        {0, 4, 8}, {2, 4, 6}
    };

    public TicTacToeService(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    public TicTacToeGame startGame(String playerX, String playerO) {
        TicTacToeGame game = new TicTacToeGame(playerX, playerO, "pvp");
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

        game.getBoard()[position] = game.getCurrentTurn();

        if (checkWinner(game.getBoard(), game.getCurrentTurn())) {
            game.setWinner(game.getCurrentTurn());
            game.setFinished(true);
            // Winner gets 10, loser gets 0
            String winnerUsername = game.getCurrentTurn().equals("X")
                ? game.getPlayerX()
                : game.getPlayerO();
            String loserUsername = game.getCurrentTurn().equals("X")
                ? game.getPlayerO()
                : game.getPlayerX();
            scoreService.saveScore(winnerUsername, "tictactoe", 10);
            scoreService.saveScore(loserUsername, "tictactoe", 0);
        } else if (isBoardFull(game.getBoard())) {
            game.setWinner("DRAW");
            game.setFinished(true);
            // Both get 5 for a draw
            scoreService.saveScore(game.getPlayerX(), "tictactoe", 5);
            scoreService.saveScore(game.getPlayerO(), "tictactoe", 5);
        } else {
            game.setCurrentTurn(game.getCurrentTurn().equals("X") ? "O" : "X");
        }

        return game;
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