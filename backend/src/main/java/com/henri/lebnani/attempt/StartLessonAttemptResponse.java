package com.henri.lebnani.attempt;

public class StartLessonAttemptResponse {

    private final Long attemptId;
    private final Long lessonId;
    private final String status;

    public StartLessonAttemptResponse(Long attemptId, Long lessonId, String status) {
        this.attemptId = attemptId;
        this.lessonId = lessonId;
        this.status = status;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public String getStatus() {
        return status;
    }
}