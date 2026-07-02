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
    private List<String> guesses;
    private int maxGuesses;
    private boolean won;
    private boolean finished;

    public WordleGame(String username, String targetWord) {
        this.gameId = UUID.randomUUID().toString();
        this.username = username;
        this.targetWord = targetWord;
        this.guesses = new ArrayList<>();
        this.maxGuesses = 6;
        this.won = false;
        this.finished = false;
    }
}