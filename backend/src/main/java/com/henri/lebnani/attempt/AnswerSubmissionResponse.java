package com.henri.lebnani.attempt;

public class AnswerSubmissionResponse {

    private final Long exerciseAttemptId;
    private final Long exerciseId;
    private final String submittedAnswer;
    private final String normalizedAnswer;
    private final boolean correct;
    private final String expectedAnswer;

    public AnswerSubmissionResponse(
            Long exerciseAttemptId,
            Long exerciseId,
            String submittedAnswer,
            String normalizedAnswer,
            boolean correct,
            String expectedAnswer
    ) {
        this.exerciseAttemptId = exerciseAttemptId;
        this.exerciseId = exerciseId;
        this.submittedAnswer = submittedAnswer;
        this.normalizedAnswer = normalizedAnswer;
        this.correct = correct;
        this.expectedAnswer = expectedAnswer;
    }

    public Long getExerciseAttemptId() {
        return exerciseAttemptId;
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
}