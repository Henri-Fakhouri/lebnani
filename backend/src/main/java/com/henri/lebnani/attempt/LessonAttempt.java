package com.henri.lebnani.attempt;

import com.henri.lebnani.course.Lesson;
import com.henri.lebnani.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "lesson_attempt")
public class LessonAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LessonAttemptStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }

    public LessonAttemptStatus getStatus() {
        return status;
    }

    public void setStatus(LessonAttemptStatus status) {
        this.status = status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void markCompleted() {
        this.status = LessonAttemptStatus.COMPLETED;
        this.completedAt = Instant.now();
    }
}