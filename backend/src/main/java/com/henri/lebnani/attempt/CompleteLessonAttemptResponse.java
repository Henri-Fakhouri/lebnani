package com.henri.lebnani.attempt;

import java.util.List;

public class CompleteLessonAttemptResponse {

    public record WrongAnswerDetail(String promptFr, String submittedAnswer, String correctAnswer) {}

    private final Long attemptId;
    private final Long lessonId;
    private final String status;
    private final long totalExercises;
    private final long answeredExercises;
    private final long correctAnswers;
    private final long wrongAnswers;
    private final int xpAwarded;
    private final List<WrongAnswerDetail> wrongAnswerDetails;

    /** Backward-compatible constructor used by existing tests. */
    public CompleteLessonAttemptResponse(
            Long attemptId,
            Long lessonId,
            String status,
            long totalExercises,
            long answeredExercises,
            long correctAnswers,
            int xpAwarded
    ) {
        this(attemptId, lessonId, status, totalExercises, answeredExercises, correctAnswers, xpAwarded, List.of());
    }

    public CompleteLessonAttemptResponse(
            Long attemptId,
            Long lessonId,
            String status,
            long totalExercises,
            long answeredExercises,
            long correctAnswers,
            int xpAwarded,
            List<WrongAnswerDetail> wrongAnswerDetails
    ) {
        this.attemptId = attemptId;
        this.lessonId = lessonId;
        this.status = status;
        this.totalExercises = totalExercises;
        this.answeredExercises = answeredExercises;
        this.correctAnswers = correctAnswers;
        this.wrongAnswers = answeredExercises - correctAnswers;
        this.xpAwarded = xpAwarded;
        this.wrongAnswerDetails = wrongAnswerDetails == null ? List.of() : wrongAnswerDetails;
    }

    public Long getAttemptId() { return attemptId; }
    public Long getLessonId() { return lessonId; }
    public String getStatus() { return status; }
    public long getTotalExercises() { return totalExercises; }
    public long getAnsweredExercises() { return answeredExercises; }
    public long getCorrectAnswers() { return correctAnswers; }
    public long getWrongAnswers() { return wrongAnswers; }

    public int getScorePercent() {
        if (totalExercises == 0) return 100;
        return (int) Math.round((correctAnswers * 100.0) / totalExercises);
    }

    public int getXpAwarded() { return xpAwarded; }
    public List<WrongAnswerDetail> getWrongAnswerDetails() { return wrongAnswerDetails; }
}