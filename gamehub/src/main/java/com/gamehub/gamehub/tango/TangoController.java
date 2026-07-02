package com.gamehub.gamehub.tango;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/tango")
public class TangoController {

    private final TangoService tangoService;

    public TangoController(TangoService tangoService) {
        this.tangoService = tangoService;
    }

    @PostMapping("/start")
    public ResponseEntity<TangoGame> startGame(@RequestBody Map<String, String> request) {
        String username = getCurrentUsername();
        String difficulty = request.getOrDefault("difficulty", "medium");

        TangoGame game = tangoService.startGame(username, difficulty);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/move")
    public ResponseEntity<TangoGame> submitMove(@RequestBody Map<String, Object> request) {
        String username = getCurrentUsername();
        String gameId = (String) request.get("gameId");
        int row = (int) request.get("row");
        int col = (int) request.get("col");
        int value = (int) request.get("value");

        TangoGame game = tangoService.submitMove(gameId, username, row, col, value);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/clear")
    public ResponseEntity<TangoGame> clearCell(@RequestBody Map<String, Object> request) {
        String username = getCurrentUsername();
        String gameId = (String) request.get("gameId");
        int row = (int) request.get("row");
        int col = (int) request.get("col");

        TangoGame game = tangoService.clearCell(gameId, username, row, col);
        return ResponseEntity.ok(game);
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<TangoGame> getGame(@PathVariable String gameId) {
        TangoGame game = tangoService.getGame(gameId);
        if (game == null) {
            throw new RuntimeException("Game not found");
        }
        return ResponseEntity.ok(game);
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}