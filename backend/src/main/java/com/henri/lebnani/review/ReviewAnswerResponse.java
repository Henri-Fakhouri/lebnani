package com.henri.lebnani.review;

import java.time.Instant;

public record ReviewAnswerResponse(
        Long reviewItemId,
        Long exerciseId,
        String submittedAnswer,
        String normalizedAnswer,
        boolean correct,
        String expectedAnswer,
        String status,
        int failureCount,
        int successCount,
        Instant nextReviewAt,
        int xpAwarded
) {
    /** Backward-compatible constructor used by existing tests (xpAwarded defaults to 0). */
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
        this(reviewItemId, exerciseId, submittedAnswer, normalizedAnswer, correct,
                expectedAnswer, status, failureCount, successCount, nextReviewAt, 0);
    }
}