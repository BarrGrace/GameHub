package com.gamehub.gamehub.wordle;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wordle")
public class WordleController {

    private final WordleService wordleService;

    public WordleController(WordleService wordleService) {
        this.wordleService = wordleService;
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startGame(@RequestBody Map<String, String> request) {
        String username = getCurrentUsername();
        String difficulty = request.get("difficulty") != null ? request.get("difficulty") : "easy";
        WordleGame game = wordleService.startGame(username, difficulty);

        return ResponseEntity.ok(Map.of(
            "gameId", game.getGameId(),
            "maxGuesses", game.getMaxGuesses(),
            "wordLength", game.getWordLength(),
            "difficulty", game.getDifficulty()
        ));
    }

    @PostMapping("/guess")
    public ResponseEntity<Map<String, Object>> submitGuess(@RequestBody Map<String, String> request) {
        String gameId = request.get("gameId");
        String guess = request.get("guess");

        List<String> result = wordleService.submitGuess(gameId, guess);
        WordleGame game = wordleService.getGame(gameId);

        return ResponseEntity.ok(Map.of(
            "result", result,
            "won", game.isWon(),
            "finished", game.isFinished(),
            "guessesUsed", game.getGuesses().size(),
            "guessesRemaining", game.getMaxGuesses() - game.getGuesses().size()
        ));
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}