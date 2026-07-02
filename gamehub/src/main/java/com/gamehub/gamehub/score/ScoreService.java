package com.gamehub.gamehub.score;

import com.gamehub.gamehub.user.User;
import com.gamehub.gamehub.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;

    public ScoreService(ScoreRepository scoreRepository, UserRepository userRepository) {
        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository;
    }

    public Score saveScore(String username, String game, int scoreValue) {
        User user = userRepository.findByUsername(username);

        Score score = new Score();
        score.setUser(user);
        score.setGame(game);
        score.setScore(scoreValue);

        return scoreRepository.save(score);
    }

    public List<Score> getLeaderboard(String game) {
        return scoreRepository.findByGameOrderByScoreDesc(game);
    }

    public List<Score> getUserScores(String username) {
        User user = userRepository.findByUsername(username);
        return scoreRepository.findByUserId(user.getId());
    }
}