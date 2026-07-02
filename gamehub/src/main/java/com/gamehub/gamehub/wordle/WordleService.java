package com.gamehub.gamehub.wordle;

import com.gamehub.gamehub.score.ScoreService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WordleService {

    private final WordleWordService wordService;
    private final ScoreService scoreService;
    private final Map<String, WordleGame> activeGames = new HashMap<>();

    public WordleService(WordleWordService wordService, ScoreService scoreService) {
        this.wordService = wordService;
        this.scoreService = scoreService;
    }

    public WordleGame startGame(String username) {
        Word word = wordService.pickRandomWord();
        WordleGame game = new WordleGame(username, word.getWord());
        activeGames.put(game.getGameId(), game);
        return game;
    }

    public List<String> submitGuess(String gameId, String guess) {
        WordleGame game = activeGames.get(gameId);

        if (game == null) throw new RuntimeException("Game not found");
        if (game.isFinished()) throw new RuntimeException("Game already finished");
        if (guess.length() != 5) throw new RuntimeException("Guess must be 5 letters");

        guess = guess.toLowerCase();
        game.getGuesses().add(guess);

        List<String> result = evaluateGuess(guess, game.getTargetWord());

        if (guess.equals(game.getTargetWord())) {
            game.setWon(true);
            game.setFinished(true);
            int score = calculateScore(game.getGuesses().size());
            scoreService.saveScore(game.getUsername(), "wordle", score);
        } else if (game.getGuesses().size() >= game.getMaxGuesses()) {
            game.setFinished(true);
            scoreService.saveScore(game.getUsername(), "wordle", 0);
        }

        return result;
    }

    private int calculateScore(int guessesUsed) {
        return switch (guessesUsed) {
            case 1 -> 100;
            case 2 -> 80;
            case 3 -> 60;
            case 4 -> 40;
            case 5 -> 20;
            case 6 -> 10;
            default -> 0;
        };
    }

    public WordleGame getGame(String gameId) {
        return activeGames.get(gameId);
    }

    private List<String> evaluateGuess(String guess, String target) {
        // ... unchanged from before
        List<String> result = new ArrayList<>(List.of("grey", "grey", "grey", "grey", "grey"));
        Map<Character, Integer> targetLetterCount = new HashMap<>();

        for (char c : target.toCharArray()) {
            targetLetterCount.merge(c, 1, Integer::sum);
        }

        for (int i = 0; i < 5; i++) {
            if (guess.charAt(i) == target.charAt(i)) {
                result.set(i, "green");
                targetLetterCount.merge(guess.charAt(i), -1, Integer::sum);
            }
        }

        for (int i = 0; i < 5; i++) {
            if (!result.get(i).equals("green")) {
                char c = guess.charAt(i);
                if (targetLetterCount.getOrDefault(c, 0) > 0) {
                    result.set(i, "yellow");
                    targetLetterCount.merge(c, -1, Integer::sum);
                }
            }
        }

        return result;
    }
}