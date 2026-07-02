package com.gamehub.gamehub.score;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findByGameOrderByScoreDesc(String game);

    List<Score> findByUserId(Long userId);
}