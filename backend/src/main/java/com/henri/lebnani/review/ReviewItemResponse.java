package com.henri.lebnani.review;

import com.henri.lebnani.exercise.Exercise;
import com.henri.lebnani.exercise.ExerciseOptionResponse;

import java.time.Instant;
import java.util.List;

public class ReviewItemResponse {

    private final Long id;
    private final Long exerciseId;
    private final String exerciseType;
    private final String promptFr;
    private final String correctAnswer;
    private final List<ExerciseOptionResponse> options;
    private final String status;
    private final int failureCount;
    private final int successCount;
    private final Instant nextReviewAt;
    private final Long unitId;
    private final String unitTitle;

    public ReviewItemResponse(ReviewItem reviewItem) {
        Exercise exercise = reviewItem.getExercise();

        this.id = reviewItem.getId();
        this.exerciseId = exercise.getId();
        this.exerciseType = exercise.getType().name();
        this.promptFr = exercise.getPromptFr();
        this.correctAnswer = exercise.getCorrectAnswer();
        this.options = exercise.getOptions()
                .stream()
                .map(ExerciseOptionResponse::new)
                .toList();
        this.status = reviewItem.getStatus().name();
        this.failureCount = reviewItem.getFailureCount();
        this.successCount = reviewItem.getSuccessCount();
        this.nextReviewAt = reviewItem.getNextReviewAt();
        this.unitId = exercise.getLesson().getUnit().getId();
        this.unitTitle = exercise.getLesson().getUnit().getTitle();
    }

    public Long getId() { return id; }
    public Long getExerciseId() { return exerciseId; }
    public String getExerciseType() { return exerciseType; }
    public String getPromptFr() { return promptFr; }
    public String getCorrectAnswer() { return correctAnswer; }
    public List<ExerciseOptionResponse> getOptions() { return options; }
    public String getStatus() { return status; }
    public int getFailureCount() { return failureCount; }
    public int getSuccessCount() { return successCount; }
    public Instant getNextReviewAt() { return nextReviewAt; }
    public Long getUnitId() { return unitId; }
    public String getUnitTitle() { return unitTitle; }
}