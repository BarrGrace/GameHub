package com.gamehub.gamehub.tictactoe;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/tictactoe")
public class TicTacToeController {

    private final TicTacToeService ticTacToeService;

    public TicTacToeController(TicTacToeService ticTacToeService) {
        this.ticTacToeService = ticTacToeService;
    }

    @PostMapping("/start")
    public ResponseEntity<TicTacToeGame> startGame(@RequestBody Map<String, String> request) {
        String playerX = getCurrentUsername();
        String mode = request.getOrDefault("mode", "pvp");

        if ("ai".equals(mode)) {
            TicTacToeGame game = ticTacToeService.startGame(playerX, "AI", "ai");
            return ResponseEntity.ok(game);
        }

        String playerO = request.get("playerO");
        if (playerO == null || playerO.isBlank()) {
            throw new RuntimeException("playerO is required");
        }

        TicTacToeGame game = ticTacToeService.startGame(playerX, playerO, "pvp");
        return ResponseEntity.ok(game);
    }

    @PostMapping("/move")
    public ResponseEntity<TicTacToeGame> makeMove(@RequestBody Map<String, Object> request) {
        String username = getCurrentUsername();
        String gameId = (String) request.get("gameId");
        int position = (int) request.get("position");

        TicTacToeGame game = ticTacToeService.makeMove(gameId, username, position);
        return ResponseEntity.ok(game);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<TicTacToeGame> getGame(@PathVariable String gameId) {
        TicTacToeGame game = ticTacToeService.getGame(gameId);
        if (game == null) {
            throw new RuntimeException("Game not found");
        }
        return ResponseEntity.ok(game);
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}