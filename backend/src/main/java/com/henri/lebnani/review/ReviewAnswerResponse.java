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
        Instant nextReviewAt
) {}