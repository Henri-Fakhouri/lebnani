package com.henri.lebnani.progress;

import com.henri.lebnani.attempt.LessonAttempt;
import com.henri.lebnani.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "xp_event")
public class XpEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_attempt_id")
    private LessonAttempt lessonAttempt;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LessonAttempt getLessonAttempt() {
        return lessonAttempt;
    }

    public void setLessonAttempt(LessonAttempt lessonAttempt) {
        this.lessonAttempt = lessonAttempt;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}