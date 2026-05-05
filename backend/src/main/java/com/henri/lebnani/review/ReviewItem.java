package com.henri.lebnani.review;

import com.henri.lebnani.attempt.ExerciseAttempt;
import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "review_item")
public class ReviewItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_exercise_attempt_id")
    private ExerciseAttempt sourceExerciseAttempt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewItemStatus status;

    @Column(name = "failure_count", nullable = false)
    private int failureCount = 1;

    @Column(name = "success_count", nullable = false)
    private int successCount = 0;

    @Column(name = "next_review_at", nullable = false)
    private Instant nextReviewAt = Instant.now();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public ExerciseAttempt getSourceExerciseAttempt() {
        return sourceExerciseAttempt;
    }

    public ReviewItemStatus getStatus() {
        return status;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public Instant getNextReviewAt() {
        return nextReviewAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void createForWrongAnswer(User user, Exercise exercise, ExerciseAttempt sourceExerciseAttempt) {
        this.user = user;
        this.exercise = exercise;
        this.sourceExerciseAttempt = sourceExerciseAttempt;
        this.status = ReviewItemStatus.DUE;
        this.failureCount = 1;
        this.successCount = 0;
        this.nextReviewAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void registerFailure(ExerciseAttempt sourceExerciseAttempt) {
        this.sourceExerciseAttempt = sourceExerciseAttempt;
        this.status = ReviewItemStatus.DUE;
        this.failureCount++;
        this.nextReviewAt = Instant.now();
        this.updatedAt = Instant.now();
    }
}