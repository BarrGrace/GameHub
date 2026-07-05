package com.gamehub.gamehub.wordle;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class WordleGame {
    private String gameId;
    private String username;
    private String targetWord;
    private int wordLength;
    private String difficulty;
    private List<String> guesses;
    private int maxGuesses;
    private boolean won;
    private boolean finished;

    public WordleGame(String username, String targetWord, String difficulty) {
        this.gameId = UUID.randomUUID().toString();
        this.username = username;
        this.targetWord = targetWord;
        this.wordLength = targetWord.length();
        this.difficulty = difficulty;
        this.guesses = new ArrayList<>();
        this.maxGuesses = 6;
        this.won = false;
        this.finished = false;
    }
}