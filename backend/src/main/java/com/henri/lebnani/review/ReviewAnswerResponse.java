package com.henri.lebnani.review;

import java.time.Instant;

public class ReviewAnswerResponse {

    private final Long reviewItemId;
    private final Long exerciseId;
    private final String submittedAnswer;
    private final String normalizedAnswer;
    private final boolean correct;
    private final String expectedAnswer;
    private final String status;
    private final int failureCount;
    private final int successCount;
    private final Instant nextReviewAt;

    public ReviewAnswerResponse(
            Long reviewItemId,
            Long exerciseId,
            String submittedAnswer,
            String normalizedAnswer,
            boolean correct,
            String expectedAnswer,
            String status,
            int failureCount,
            int successCount,
            Instant nextReviewAt
    ) {
        this.reviewItemId = reviewItemId;
        this.exerciseId = exerciseId;
        this.submittedAnswer = submittedAnswer;
        this.normalizedAnswer = normalizedAnswer;
        this.correct = correct;
        this.expectedAnswer = expectedAnswer;
        this.status = status;
        this.failureCount = failureCount;
        this.successCount = successCount;
        this.nextReviewAt = nextReviewAt;
    }

    public Long getReviewItemId() {
        return reviewItemId;
    }

    public Long getExerciseId() {
        return exerciseId;
    }

    public String getSubmittedAnswer() {
        return submittedAnswer;
    }

    public String getNormalizedAnswer() {
        return normalizedAnswer;
    }

    public boolean isCorrect() {
        return correct;
    }

    public String getExpectedAnswer() {
        return expectedAnswer;
    }

    public String getStatus() {
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
}