package com.gamehub.gamehub.score;

import com.gamehub.gamehub.user.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String game;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private LocalDateTime playedAt;

    @PrePersist
    protected void onCreate() {
        this.playedAt = LocalDateTime.now();
    }
}