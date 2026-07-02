package com.gamehub.gamehub.score;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/scores")
public class ScoreController {

    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @PostMapping
    public ResponseEntity<Score> saveScore(@RequestBody Map<String, Object> request) {
        String username = getCurrentUsername();
        String game = (String) request.get("game");
        int score = (int) request.get("score");

        Score saved = scoreService.saveScore(username, game, score);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/leaderboard/{game}")
    public ResponseEntity<List<Score>> getLeaderboard(@PathVariable String game) {
        return ResponseEntity.ok(scoreService.getLeaderboard(game));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Score>> getMyScores() {
        String username = getCurrentUsername();
        return ResponseEntity.ok(scoreService.getUserScores(username));
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}