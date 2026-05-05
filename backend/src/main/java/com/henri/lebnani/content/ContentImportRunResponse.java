package com.henri.lebnani.content;

import java.time.Instant;

public class ContentImportRunResponse {

    private final Long id;
    private final Long courseId;
    private final String courseTitle;
    private final Long userId;
    private final String userEmail;
    private final String status;
    private final int unitsCreated;
    private final int lessonsCreated;
    private final int exercisesCreated;
    private final int optionsCreated;
    private final int acceptedAnswersCreated;
    private final String errorMessage;
    private final Instant startedAt;
    private final Instant completedAt;

    public ContentImportRunResponse(ContentImportRun run) {
        this.id = run.getId();
        this.courseId = run.getCourse().getId();
        this.courseTitle = run.getCourse().getTitle();
        this.userId = run.getUser().getId();
        this.userEmail = run.getUser().getEmail();
        this.status = run.getStatus().name();
        this.unitsCreated = run.getUnitsCreated();
        this.lessonsCreated = run.getLessonsCreated();
        this.exercisesCreated = run.getExercisesCreated();
        this.optionsCreated = run.getOptionsCreated();
        this.acceptedAnswersCreated = run.getAcceptedAnswersCreated();
        this.errorMessage = run.getErrorMessage();
        this.startedAt = run.getStartedAt();
        this.completedAt = run.getCompletedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getStatus() {
        return status;
    }

    public int getUnitsCreated() {
        return unitsCreated;
    }

    public int getLessonsCreated() {
        return lessonsCreated;
    }

    public int getExercisesCreated() {
        return exercisesCreated;
    }

    public int getOptionsCreated() {
        return optionsCreated;
    }

    public int getAcceptedAnswersCreated() {
        return acceptedAnswersCreated;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}