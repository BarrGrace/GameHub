package com.gamehub.gamehub.sudoku;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/sudoku")
public class SudokuController {

    private final SudokuService sudokuService;

    public SudokuController(SudokuService sudokuService) {
        this.sudokuService = sudokuService;
    }

    @PostMapping("/start")
    public ResponseEntity<SudokuGameDTO> startGame(@RequestBody Map<String, String> request) {
        String username = getCurrentUsername();
        String difficulty = request.getOrDefault("difficulty", "medium");

        SudokuGame game = sudokuService.startGame(username, difficulty);
        return ResponseEntity.ok(SudokuGameDTO.from(game));
    }

    @PostMapping("/move")
    public ResponseEntity<SudokuGameDTO> submitMove(@RequestBody Map<String, Object> request) {
        String username = getCurrentUsername();
        String gameId = (String) request.get("gameId");
        int row = (int) request.get("row");
        int col = (int) request.get("col");
        int value = (int) request.get("value");

        SudokuGame game = sudokuService.submitMove(gameId, username, row, col, value);
        return ResponseEntity.ok(SudokuGameDTO.from(game));
    }

    @PostMapping("/clear")
    public ResponseEntity<SudokuGameDTO> clearCell(@RequestBody Map<String, Object> request) {
        String username = getCurrentUsername();
        String gameId = (String) request.get("gameId");
        int row = (int) request.get("row");
        int col = (int) request.get("col");

        SudokuGame game = sudokuService.clearCell(gameId, username, row, col);
        return ResponseEntity.ok(SudokuGameDTO.from(game));
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<SudokuGameDTO> getGame(@PathVariable String gameId) {
        SudokuGame game = sudokuService.getGame(gameId);
        if (game == null) throw new RuntimeException("Game not found");
        return ResponseEntity.ok(SudokuGameDTO.from(game));
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}